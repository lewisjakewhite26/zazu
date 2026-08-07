/**
 * Audit the word bank (words, word_roots, word_morning_tasks) for UK English
 * spelling drift and basic definition-clarity smells.
 *
 * Usage:
 *   node scripts/audit-word-bank.mjs            # scan + report + write flagged_words_audit.json
 *   node scripts/audit-word-bank.mjs --apply     # also write the proposed spelling fixes back to Supabase
 *
 * Requires .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */

import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

dotenv.config({ path: resolve(root, '.env') });

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const outPath = resolve(root, 'scripts/flagged_words_audit.json');

function requireEnv(name) {
  const value = process.env[name];
  if (!value || value.includes('YOUR_PROJECT')) {
    console.error(`Missing or placeholder env var: ${name}`);
    console.error('Copy .env.example → .env and add your Supabase credentials.');
    process.exit(1);
  }
  return value;
}

// ── UK English spelling dictionary ──────────────────────────────────────────
// High-confidence, unambiguous US -> UK pairs. Context-dependent pairs
// (license/licence, practice/practise, program/programme) are deliberately
// excluded — they're correct in one part of speech and would false-positive.

const SPELLING_RULES = [
  // -or -> -our
  ['color', 'colour'], ['colors', 'colours'], ['colored', 'coloured'], ['coloring', 'colouring'],
  ['honor', 'honour'], ['honors', 'honours'], ['honored', 'honoured'], ['honoring', 'honouring'],
  ['favor', 'favour'], ['favors', 'favours'], ['favored', 'favoured'], ['favoring', 'favouring'], ['favorite', 'favourite'], ['favorites', 'favourites'],
  ['behavior', 'behaviour'], ['behaviors', 'behaviours'], ['behavioral', 'behavioural'],
  ['labor', 'labour'], ['labors', 'labours'], ['labored', 'laboured'], ['laboring', 'labouring'],
  ['neighbor', 'neighbour'], ['neighbors', 'neighbours'], ['neighboring', 'neighbouring'], ['neighborhood', 'neighbourhood'],
  ['humor', 'humour'], ['humors', 'humours'], ['humored', 'humoured'], ['humorous', 'humourous'],
  ['rumor', 'rumour'], ['rumors', 'rumours'], ['rumored', 'rumoured'],
  ['valor', 'valour'],
  ['vigor', 'vigour'], ['vigorous', 'vigourous'],
  ['splendor', 'splendour'],
  ['endeavor', 'endeavour'], ['endeavors', 'endeavours'], ['endeavored', 'endeavoured'], ['endeavoring', 'endeavouring'],
  ['armor', 'armour'], ['armored', 'armoured'],
  ['harbor', 'harbour'], ['harbors', 'harbours'], ['harbored', 'harboured'],
  ['flavor', 'flavour'], ['flavors', 'flavours'], ['flavored', 'flavoured'], ['flavoring', 'flavouring'],
  ['candor', 'candour'],
  ['clamor', 'clamour'], ['clamored', 'clamoured'],
  ['glamor', 'glamour'], ['glamorous', 'glamourous'],
  ['rigor', 'rigour'], ['rigorous', 'rigourous'],
  ['tumor', 'tumour'], ['tumors', 'tumours'],
  ['vapor', 'vapour'], ['vapors', 'vapours'],
  ['ardor', 'ardour'],
  ['fervor', 'fervour'],
  ['odor', 'odour'], ['odors', 'odours'],
  ['savor', 'savour'], ['savory', 'savoury'],
  ['demeanor', 'demeanour'],

  // -er -> -re
  ['center', 'centre'], ['centers', 'centres'], ['centered', 'centred'], ['centering', 'centring'],
  ['theater', 'theatre'], ['theaters', 'theatres'],
  ['liter', 'litre'], ['liters', 'litres'],
  ['fiber', 'fibre'], ['fibers', 'fibres'],
  ['somber', 'sombre'],
  ['caliber', 'calibre'],
  ['scepter', 'sceptre'],
  ['luster', 'lustre'], ['lustrous', 'lustrous'],
  ['meager', 'meagre'],
  ['saber', 'sabre'],
  ['specter', 'spectre'], ['specters', 'spectres'],
  ['somber', 'sombre'],

  // -ize/-yze -> -ise/-yse
  ['organize', 'organise'], ['organizes', 'organises'], ['organized', 'organised'], ['organizing', 'organising'], ['organization', 'organisation'], ['organizations', 'organisations'],
  ['realize', 'realise'], ['realizes', 'realises'], ['realized', 'realised'], ['realizing', 'realising'],
  ['recognize', 'recognise'], ['recognizes', 'recognises'], ['recognized', 'recognised'], ['recognizing', 'recognising'], ['recognizable', 'recognisable'],
  ['apologize', 'apologise'], ['apologizes', 'apologises'], ['apologized', 'apologised'], ['apologizing', 'apologising'],
  ['criticize', 'criticise'], ['criticizes', 'criticises'], ['criticized', 'criticised'], ['criticizing', 'criticising'],
  ['emphasize', 'emphasise'], ['emphasizes', 'emphasises'], ['emphasized', 'emphasised'], ['emphasizing', 'emphasising'],
  ['analyze', 'analyse'], ['analyzes', 'analyses'], ['analyzed', 'analysed'], ['analyzing', 'analysing'],
  ['paralyze', 'paralyse'], ['paralyzes', 'paralyses'], ['paralyzed', 'paralysed'], ['paralyzing', 'paralysing'],
  ['characterize', 'characterise'], ['characterizes', 'characterises'], ['characterized', 'characterised'], ['characterizing', 'characterising'],
  ['categorize', 'categorise'], ['categorizes', 'categorises'], ['categorized', 'categorised'], ['categorizing', 'categorising'],
  ['customize', 'customise'], ['customizes', 'customises'], ['customized', 'customised'], ['customizing', 'customising'],
  ['finalize', 'finalise'], ['finalizes', 'finalises'], ['finalized', 'finalised'], ['finalizing', 'finalising'],
  ['generalize', 'generalise'], ['generalizes', 'generalises'], ['generalized', 'generalised'], ['generalizing', 'generalising'],
  ['initialize', 'initialise'], ['initializes', 'initialises'], ['initialized', 'initialised'], ['initializing', 'initialising'],
  ['maximize', 'maximise'], ['maximizes', 'maximises'], ['maximized', 'maximised'], ['maximizing', 'maximising'],
  ['minimize', 'minimise'], ['minimizes', 'minimises'], ['minimized', 'minimised'], ['minimizing', 'minimising'],
  ['modernize', 'modernise'], ['modernizes', 'modernises'], ['modernized', 'modernised'], ['modernizing', 'modernising'],
  ['normalize', 'normalise'], ['normalizes', 'normalises'], ['normalized', 'normalised'], ['normalizing', 'normalising'],
  ['optimize', 'optimise'], ['optimizes', 'optimises'], ['optimized', 'optimised'], ['optimizing', 'optimising'],
  ['prioritize', 'prioritise'], ['prioritizes', 'prioritises'], ['prioritized', 'prioritised'], ['prioritizing', 'prioritising'],
  ['rationalize', 'rationalise'], ['rationalizes', 'rationalises'], ['rationalized', 'rationalised'], ['rationalizing', 'rationalising'],
  ['socialize', 'socialise'], ['socializes', 'socialises'], ['socialized', 'socialised'], ['socializing', 'socialising'],
  ['specialize', 'specialise'], ['specializes', 'specialises'], ['specialized', 'specialised'], ['specializing', 'specialising'],
  ['standardize', 'standardise'], ['standardizes', 'standardises'], ['standardized', 'standardised'], ['standardizing', 'standardising'],
  ['summarize', 'summarise'], ['summarizes', 'summarises'], ['summarized', 'summarised'], ['summarizing', 'summarising'],
  ['symbolize', 'symbolise'], ['symbolizes', 'symbolises'], ['symbolized', 'symbolised'], ['symbolizing', 'symbolising'],
  ['sympathize', 'sympathise'], ['sympathizes', 'sympathises'], ['sympathized', 'sympathised'], ['sympathizing', 'sympathising'],
  ['utilize', 'utilise'], ['utilizes', 'utilises'], ['utilized', 'utilised'], ['utilizing', 'utilising'], ['utilization', 'utilisation'],
  ['visualize', 'visualise'], ['visualizes', 'visualises'], ['visualized', 'visualised'], ['visualizing', 'visualising'],
  ['idolize', 'idolise'], ['idolizes', 'idolises'], ['idolized', 'idolised'], ['idolizing', 'idolising'],
  ['immortalize', 'immortalise'], ['immortalizes', 'immortalises'], ['immortalized', 'immortalised'],
  ['mesmerize', 'mesmerise'], ['mesmerizes', 'mesmerises'], ['mesmerized', 'mesmerised'], ['mesmerizing', 'mesmerising'],
  ['tantalize', 'tantalise'], ['tantalizes', 'tantalises'], ['tantalized', 'tantalised'], ['tantalizing', 'tantalising'],
  ['synthesize', 'synthesise'], ['synthesizes', 'synthesises'], ['synthesized', 'synthesised'], ['synthesizing', 'synthesising'],

  // -og -> -ogue
  ['catalog', 'catalogue'], ['catalogs', 'catalogues'], ['cataloged', 'catalogued'], ['cataloging', 'cataloguing'],
  ['dialog', 'dialogue'], ['dialogs', 'dialogues'],
  ['analog', 'analogue'], ['analogs', 'analogues'],
  ['epilog', 'epilogue'],
  ['prolog', 'prologue'],

  // single -> double consonant before -ed/-ing/-er
  ['traveled', 'travelled'], ['traveling', 'travelling'], ['traveler', 'traveller'], ['travelers', 'travellers'],
  ['canceled', 'cancelled'], ['canceling', 'cancelling'], ['cancellation', 'cancellation'],
  ['labeled', 'labelled'], ['labeling', 'labelling'],
  ['modeled', 'modelled'], ['modeling', 'modelling'], ['modeler', 'modeller'],
  ['signaled', 'signalled'], ['signaling', 'signalling'],
  ['fueled', 'fuelled'], ['fueling', 'fuelling'],
  ['jeweler', 'jeweller'], ['jewelers', 'jewellers'],
  ['marveled', 'marvelled'], ['marveling', 'marvelling'],
  ['quarreled', 'quarrelled'], ['quarreling', 'quarrelling'],
  ['counseled', 'counselled'], ['counseling', 'counselling'], ['counselor', 'counsellor'], ['counselors', 'counsellors'],
  ['leveled', 'levelled'], ['leveling', 'levelling'],
  ['rivaled', 'rivalled'], ['rivaling', 'rivalling'],
  ['libeled', 'libelled'], ['libeling', 'libelling'],

  // -se/-ce (unambiguous nouns only)
  ['defense', 'defence'], ['defenses', 'defences'], ['defenseless', 'defenceless'],
  ['offense', 'offence'], ['offenses', 'offences'],
  ['pretense', 'pretence'],

  // ae/oe restorations
  ['anesthesia', 'anaesthesia'], ['anesthetic', 'anaesthetic'],
  ['encyclopedia', 'encyclopaedia'], ['encyclopedic', 'encyclopaedic'],
  ['esophagus', 'oesophagus'],
  ['fetus', 'foetus'], ['fetal', 'foetal'],
  ['maneuver', 'manoeuvre'], ['maneuvers', 'manoeuvres'], ['maneuvered', 'manoeuvred'], ['maneuvering', 'manoeuvring'],
  ['archeology', 'archaeology'], ['archeological', 'archaeological'],
  ['leukemia', 'leukaemia'],
  ['pediatric', 'paediatric'], ['pediatrician', 'paediatrician'],
  ['gynecology', 'gynaecology'],
  ['orthopedic', 'orthopaedic'],

  // one-off vocabulary
  ['gray', 'grey'], ['grayish', 'greyish'],
  ['jewelry', 'jewellery'],
  ['mustache', 'moustache'],
  ['pajamas', 'pyjamas'],
  ['tire', 'tyre'], ['tires', 'tyres'],
  ['curb', 'kerb'],
  ['aluminum', 'aluminium'],
  ['sulfur', 'sulphur'], ['sulfuric', 'sulphuric'],
  ['skeptic', 'sceptic'], ['skeptics', 'sceptics'], ['skeptical', 'sceptical'], ['skepticism', 'scepticism'],
  ['plow', 'plough'], ['plows', 'ploughs'], ['plowed', 'ploughed'],
  ['mold', 'mould'], ['molds', 'moulds'], ['molded', 'moulded'], ['molding', 'moulding'],
  ['smolder', 'smoulder'], ['smoldering', 'smouldering'],
  ['ax', 'axe'],
  ['donut', 'doughnut'],
  ['draft', 'draught'],
  ['artifact', 'artefact'], ['artifacts', 'artefacts'],
  ['disk', 'disc'],
  ['annex', 'annexe'],
  ['gage', 'gauge'],
  ['inquiry', 'enquiry'], ['inquiries', 'enquiries'],
  ['story', 'storey'],
  ['woolen', 'woollen'],
  ['fulfill', 'fulfil'], ['fulfills', 'fulfils'], ['fulfillment', 'fulfilment'],
  ['skillful', 'skilful'],
  ['willful', 'wilful'],
  ['enrollment', 'enrolment'],
  ['installment', 'instalment'],
];

const SPELLING_MAP = new Map(SPELLING_RULES.map(([us, uk]) => [us.toLowerCase(), uk]));

function categoryFor(us) {
  if (/or$/.test(us) && SPELLING_MAP.get(us).endsWith('our')) return '-or → -our';
  if (/ize|izing|ization/.test(us)) return '-ize → -ise';
  if (/yze|yzing/.test(us)) return '-yze → -yse';
  if (/og$|ogs$|oged$|oging$/.test(us)) return '-og → -ogue';
  if (/er$/.test(us) && SPELLING_MAP.get(us).endsWith('re')) return '-er → -re';
  if (/ense$/.test(us)) return '-se → -ce';
  return 'other UK spelling';
}

/** Word-boundary, case-insensitive scan that preserves original casing in the replacement. */
function findSpellingIssues(text) {
  if (!text || typeof text !== 'string') return [];
  const issues = [];
  const re = /[A-Za-z]+/g;
  let match;
  while ((match = re.exec(text))) {
    const word = match[0];
    const uk = SPELLING_MAP.get(word.toLowerCase());
    if (!uk) continue;

    let replacement = uk;
    if (word === word.toUpperCase() && word.length > 1) {
      replacement = uk.toUpperCase();
    } else if (word[0] === word[0].toUpperCase()) {
      replacement = uk[0].toUpperCase() + uk.slice(1);
    }

    issues.push({
      us: word,
      uk: replacement,
      category: categoryFor(word.toLowerCase()),
      index: match.index,
    });
  }
  return issues;
}

function applySpellingFixes(text, issues) {
  if (!issues.length) return text;
  // Apply back-to-front so earlier indices stay valid.
  let result = text;
  for (const issue of [...issues].sort((a, b) => b.index - a.index)) {
    result = result.slice(0, issue.index) + issue.uk + result.slice(issue.index + issue.us.length);
  }
  return result;
}

// ── Clarity heuristics (definitions only — flagged, not auto-fixed) ─────────

function findClarityIssues(word, definition) {
  if (!definition) return [];
  const issues = [];
  const wordCount = definition.trim().split(/\s+/).filter(Boolean).length;
  const lower = definition.toLowerCase();

  if (wordCount > 25) {
    issues.push({ type: 'too-long', detail: `${wordCount} words — consider tightening for a morning glance-read.` });
  }
  if (wordCount < 3) {
    issues.push({ type: 'too-short', detail: `${wordCount} words — may be too terse to stand alone.` });
  }
  if (word && lower.includes(word.toLowerCase())) {
    issues.push({ type: 'circular', detail: `Definition repeats the headword "${word}".` });
  }
  return issues;
}

// ── Field scanners per table ────────────────────────────────────────────────

const FIELD_CONFIG = {
  words: ['word', 'pronunciation', 'pos', 'definition', 'origin'],
  word_roots: ['root_text', 'root_language', 'root_meaning'],
  word_morning_tasks: ['source_value', 'correct_answer', 'hint'],
};

async function fetchAll(supabase, table, columns) {
  const pageSize = 1000;
  let from = 0;
  const rows = [];
  for (;;) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`${table} select: ${error.message}`);
    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

async function main() {
  const url = requireEnv('SUPABASE_URL');
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('Fetching word bank…');
  const [words, wordRoots, morningTasks] = await Promise.all([
    fetchAll(supabase, 'words', 'id, word, pronunciation, pos, definition, origin'),
    fetchAll(supabase, 'word_roots', 'id, word_id, root_text, root_language, root_meaning'),
    fetchAll(supabase, 'word_morning_tasks', 'word_id, source_value, correct_answer, hint'),
  ]);

  const wordById = new Map(words.map((w) => [w.id, w]));

  console.log(`  ✓ words: ${words.length} rows`);
  console.log(`  ✓ word_roots: ${wordRoots.length} rows`);
  console.log(`  ✓ word_morning_tasks: ${morningTasks.length} rows`);

  const flagged = [];
  const categoryTotals = {};
  const fieldTotals = {};
  let spellingIssueCount = 0;
  let clarityIssueCount = 0;

  function recordSpelling(table, id, field, original, headword) {
    const issues = findSpellingIssues(original);
    if (!issues.length) return;
    spellingIssueCount += issues.length;
    fieldTotals[`${table}.${field}`] = (fieldTotals[`${table}.${field}`] ?? 0) + issues.length;
    for (const issue of issues) {
      categoryTotals[issue.category] = (categoryTotals[issue.category] ?? 0) + 1;
    }
    flagged.push({
      table,
      id,
      field,
      word: headword ?? null,
      type: 'spelling',
      original,
      suggested: applySpellingFixes(original, issues),
      issues: issues.map(({ us, uk, category }) => ({ us, uk, category })),
    });
  }

  for (const row of words) {
    for (const field of FIELD_CONFIG.words) {
      recordSpelling('words', row.id, field, row[field], row.word);
    }
    const clarity = findClarityIssues(row.word, row.definition);
    if (clarity.length) {
      clarityIssueCount += clarity.length;
      flagged.push({
        table: 'words',
        id: row.id,
        field: 'definition',
        word: row.word,
        type: 'clarity',
        original: row.definition,
        suggested: null,
        issues: clarity,
      });
    }
  }

  for (const row of wordRoots) {
    const headword = wordById.get(row.word_id)?.word;
    for (const field of FIELD_CONFIG.word_roots) {
      recordSpelling('word_roots', row.id, field, row[field], headword);
    }
  }

  for (const row of morningTasks) {
    const headword = wordById.get(row.word_id)?.word;
    for (const field of FIELD_CONFIG.word_morning_tasks) {
      recordSpelling('word_morning_tasks', row.word_id, field, row[field], headword);
    }
  }

  writeFileSync(outPath, JSON.stringify(flagged, null, 2), 'utf8');

  const totalRows = words.length + wordRoots.length + morningTasks.length;
  console.log('');
  console.log('── Word Bank Audit Summary ─────────────────────────────');
  console.log(`Rows scanned:      ${totalRows} (words ${words.length}, word_roots ${wordRoots.length}, word_morning_tasks ${morningTasks.length})`);
  console.log(`Entries flagged:   ${flagged.length}`);
  console.log(`  Spelling issues: ${spellingIssueCount}`);
  console.log(`  Clarity issues:  ${clarityIssueCount}`);
  if (Object.keys(categoryTotals).length) {
    console.log('');
    console.log('Spelling issues by category:');
    for (const [category, count] of Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${category.padEnd(20)} ${count}`);
    }
  }
  if (Object.keys(fieldTotals).length) {
    console.log('');
    console.log('Spelling issues by field:');
    for (const [field, count] of Object.entries(fieldTotals).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${field.padEnd(28)} ${count}`);
    }
  }
  console.log('');
  console.log(`Full detail written to ${outPath}`);

  if (!apply) {
    console.log('');
    console.log('Dry run — no database writes. Re-run with --apply to write the proposed spelling fixes back.');
    return;
  }

  const spellingFixes = flagged.filter((f) => f.type === 'spelling');
  if (!spellingFixes.length) {
    console.log('');
    console.log('Nothing to apply — no spelling issues found.');
    return;
  }

  console.log('');
  console.log(`Applying ${spellingFixes.length} spelling fixes…`);
  let applied = 0;
  for (const fix of spellingFixes) {
    const idColumn = fix.table === 'word_morning_tasks' ? 'word_id' : 'id';
    const { error } = await supabase
      .from(fix.table)
      .update({ [fix.field]: fix.suggested })
      .eq(idColumn, fix.id);
    if (error) {
      console.error(`  ✗ ${fix.table}.${fix.field} (${fix.id}): ${error.message}`);
      continue;
    }
    applied += 1;
  }
  console.log(`  ✓ ${applied}/${spellingFixes.length} fixes applied`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
