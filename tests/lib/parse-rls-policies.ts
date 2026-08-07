import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export interface PolicyInfo {
  name: string;
  table: string;
  cmd: string;
  roles: string;
  /** Raw text inside `using (...)` and/or `with check (...)`, concatenated. */
  body: string;
  /** Migration file that produced the final version of this policy. */
  file: string;
}

/**
 * Replays every `drop policy` / `create policy` statement across all
 * migration files, in filename order and in document order within each
 * file, into a map keyed by `table.policy_name` — mirroring what a real
 * `supabase db push` ends up with in Postgres. This matters for two
 * reasons found while writing this parser:
 *
 * - Most policy changes here are `drop policy if exists` immediately
 *   followed by `create policy` with the *same* name (a replace) — but
 *   004_lock_entitlements.sql drops `user_entitlements_upsert_own` and
 *   `_update_own` and does NOT recreate them under those names (they're
 *   superseded by differently-named service-role policies). A parser that
 *   only tracks `create policy` would wrongly think those old policies are
 *   still active.
 * - `using (...)` and `with check (...)` can't be parsed with a single
 *   regex and `\);` as a terminator: some policies are single-line
 *   (`using (tier = 'free');`) and some are multi-line, and a naive
 *   non-greedy regex silently swallows whichever policy comes next after a
 *   single-line one. This does real balanced-paren scanning instead.
 */
export function extractFinalPolicies(migrationsDir: string): Map<string, PolicyInfo> {
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const policies = new Map<string, PolicyInfo>();

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf8');
    for (const event of extractEventsFromSql(sql)) {
      const key = `${event.table}.${event.name}`;
      if (event.kind === 'drop') {
        policies.delete(key);
      } else {
        policies.set(key, { name: event.name, table: event.table, cmd: event.cmd, roles: event.roles, body: event.body, file });
      }
    }
  }

  return policies;
}

type PolicyEvent =
  | { kind: 'drop'; pos: number; name: string; table: string }
  | { kind: 'create'; pos: number; name: string; table: string; cmd: string; roles: string; body: string };

function extractEventsFromSql(sql: string): PolicyEvent[] {
  const events: PolicyEvent[] = [];

  const dropRe = /drop policy if exists "([^"]+)" on public\.(\w+);/g;
  let dropMatch: RegExpExecArray | null;
  while ((dropMatch = dropRe.exec(sql))) {
    events.push({ kind: 'drop', pos: dropMatch.index, name: dropMatch[1], table: dropMatch[2] });
  }

  const headerRe = /create policy "([^"]+)"\s*\n\s*on public\.(\w+) for (\w+)\s*\n\s*to ([^\n]+)\n/g;
  let headerMatch: RegExpExecArray | null;
  while ((headerMatch = headerRe.exec(sql))) {
    const [, name, table, cmd, roles] = headerMatch;
    const pos = headerMatch.index;
    let cursor = headerRe.lastIndex;
    let usingBody: string | null = null;
    let checkBody: string | null = null;

    // USING and WITH CHECK can each appear at most once, USING first when both are present.
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const rest = sql.slice(cursor);
      const usingHead = usingBody === null ? rest.match(/^\s*using\s*\(/) : null;
      const checkHead = checkBody === null ? rest.match(/^\s*with check\s*\(/) : null;

      if (usingHead) {
        const openIdx = cursor + usingHead[0].length - 1;
        const clause = readBalancedParen(sql, openIdx);
        usingBody = clause.body;
        cursor = clause.endIdx;
      } else if (checkHead) {
        const openIdx = cursor + checkHead[0].length - 1;
        const clause = readBalancedParen(sql, openIdx);
        checkBody = clause.body;
        cursor = clause.endIdx;
      } else {
        break;
      }
    }

    if (usingBody === null && checkBody === null) continue;

    events.push({
      kind: 'create',
      pos,
      name,
      table,
      cmd,
      roles: roles.trim(),
      body: [usingBody, checkBody].filter((b): b is string => b !== null).join(' '),
    });
  }

  return events.sort((a, b) => a.pos - b.pos);
}

/** Given the index of an opening `(`, returns the text up to its matching `)` and the index just past it. */
function readBalancedParen(sql: string, openParenIdx: number): { body: string; endIdx: number } {
  let depth = 1;
  let i = openParenIdx + 1;
  while (i < sql.length && depth > 0) {
    if (sql[i] === '(') depth += 1;
    else if (sql[i] === ')') depth -= 1;
    i += 1;
  }
  return { body: sql.slice(openParenIdx + 1, i - 1), endIdx: i };
}
