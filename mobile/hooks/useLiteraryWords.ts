import { useEffect, useState } from 'react';

import { fetchLiteraryWords, type LiteraryWord } from '../../lib/literary-words';

/** RLS already gates this to Gold entitlement holders; `enabled` just avoids the network call for everyone else. */
export function useLiteraryWords(enabled: boolean) {
  const [loading, setLoading] = useState(enabled);
  const [literaryWords, setLiteraryWords] = useState<LiteraryWord[]>([]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setLiteraryWords([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchLiteraryWords().then((words) => {
      if (cancelled) return;
      setLiteraryWords(words);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { loading, literaryWords };
}
