import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { CompletionResult } from '../../lib/useProgress';
import type { ZazuAlarmWord, ZazuGymWord } from '../../lib/supabase';

type AlarmFlowContextValue = {
  sessionWord: ZazuAlarmWord | null;
  gymSessionWord: ZazuGymWord | null;
  completionResult: CompletionResult | null;
  startFlow: (word: ZazuAlarmWord) => void;
  startGymFlow: (word: ZazuGymWord) => void;
  setCompletionResult: (result: CompletionResult) => void;
  clearFlow: () => void;
};

const AlarmFlowContext = createContext<AlarmFlowContextValue | null>(null);

export function AlarmFlowProvider({ children }: { children: ReactNode }) {
  const [sessionWord, setSessionWord] = useState<ZazuAlarmWord | null>(null);
  const [gymSessionWord, setGymSessionWord] = useState<ZazuGymWord | null>(null);
  const [completionResult, setCompletionResultState] = useState<CompletionResult | null>(null);

  const startFlow = useCallback((word: ZazuAlarmWord) => {
    setSessionWord(word);
    setGymSessionWord(null);
    setCompletionResultState(null);
  }, []);

  const startGymFlow = useCallback((word: ZazuGymWord) => {
    setGymSessionWord(word);
    setSessionWord(null);
    setCompletionResultState(null);
  }, []);

  const setCompletionResult = useCallback((result: CompletionResult) => {
    setCompletionResultState(result);
  }, []);

  const clearFlow = useCallback(() => {
    setSessionWord(null);
    setGymSessionWord(null);
    setCompletionResultState(null);
  }, []);

  const value = useMemo(
    () => ({
      sessionWord,
      gymSessionWord,
      completionResult,
      startFlow,
      startGymFlow,
      setCompletionResult,
      clearFlow,
    }),
    [
      sessionWord,
      gymSessionWord,
      completionResult,
      startFlow,
      startGymFlow,
      setCompletionResult,
      clearFlow,
    ],
  );

  return <AlarmFlowContext.Provider value={value}>{children}</AlarmFlowContext.Provider>;
}

export function useAlarmFlow() {
  const context = useContext(AlarmFlowContext);
  if (!context) {
    throw new Error('useAlarmFlow must be used within AlarmFlowProvider');
  }
  return context;
}
