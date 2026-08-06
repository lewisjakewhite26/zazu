import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { CompletionResult, GymCompletionResult } from '../../lib/useProgress';
import type { ZazuAlarmWord, ZazuGymWord } from '../../lib/supabase';

type AlarmFlowContextValue = {
  sessionWord: ZazuAlarmWord | null;
  gymSessionWord: ZazuGymWord | null;
  completionResult: CompletionResult | null;
  gymCompletionResult: GymCompletionResult | null;
  /** True when the alarm flow was entered via the Home screen's "Try the alarm" preview rather than a real scheduled notification. Demo sessions get a visible exit; the real alarm stays locked until the task is done, by design. */
  isDemo: boolean;
  startFlow: (word: ZazuAlarmWord, options?: { isDemo?: boolean }) => void;
  startGymFlow: (word: ZazuGymWord) => void;
  setCompletionResult: (result: CompletionResult) => void;
  setGymCompletionResult: (result: GymCompletionResult) => void;
  clearFlow: () => void;
};

const AlarmFlowContext = createContext<AlarmFlowContextValue | null>(null);

export function AlarmFlowProvider({ children }: { children: ReactNode }) {
  const [sessionWord, setSessionWord] = useState<ZazuAlarmWord | null>(null);
  const [gymSessionWord, setGymSessionWord] = useState<ZazuGymWord | null>(null);
  const [completionResult, setCompletionResultState] = useState<CompletionResult | null>(null);
  const [gymCompletionResult, setGymCompletionResultState] = useState<GymCompletionResult | null>(
    null,
  );
  const [isDemo, setIsDemo] = useState(false);

  const startFlow = useCallback((word: ZazuAlarmWord, options?: { isDemo?: boolean }) => {
    setSessionWord(word);
    setGymSessionWord(null);
    setCompletionResultState(null);
    setGymCompletionResultState(null);
    setIsDemo(Boolean(options?.isDemo));
  }, []);

  const startGymFlow = useCallback((word: ZazuGymWord) => {
    setGymSessionWord(word);
    setSessionWord(null);
    setCompletionResultState(null);
    setGymCompletionResultState(null);
  }, []);

  const setCompletionResult = useCallback((result: CompletionResult) => {
    setCompletionResultState(result);
  }, []);

  const setGymCompletionResult = useCallback((result: GymCompletionResult) => {
    setGymCompletionResultState(result);
  }, []);

  const clearFlow = useCallback(() => {
    setSessionWord(null);
    setGymSessionWord(null);
    setCompletionResultState(null);
    setGymCompletionResultState(null);
    setIsDemo(false);
  }, []);

  const value = useMemo(
    () => ({
      sessionWord,
      gymSessionWord,
      completionResult,
      gymCompletionResult,
      isDemo,
      startFlow,
      startGymFlow,
      setCompletionResult,
      setGymCompletionResult,
      clearFlow,
    }),
    [
      sessionWord,
      gymSessionWord,
      completionResult,
      gymCompletionResult,
      isDemo,
      startFlow,
      startGymFlow,
      setCompletionResult,
      setGymCompletionResult,
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
