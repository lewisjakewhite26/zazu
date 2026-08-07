import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { CompletionResult, GymCompletionResult } from '../../lib/useProgress';
import type { GymMcqQuestion } from '../../lib/gym-modes';
import type { LiteraryMcqQuestion } from '../../lib/literary-words';
import type { ZazuAlarmWord, ZazuGymWord } from '../../lib/supabase';
import { DEFAULT_ALARM_SOUND_ID, type AlarmSoundId } from '../../lib/alarm-sound';

export type GymModeSession =
  | { mode: 'roots_drill' | 'usage_lab'; mcqQuestions: GymMcqQuestion[] }
  | { mode: 'literary'; literaryQuestions: LiteraryMcqQuestion[] };

type AlarmFlowContextValue = {
  sessionWord: ZazuAlarmWord | null;
  gymSessionWord: ZazuGymWord | null;
  gymSession: GymModeSession | null;
  completionResult: CompletionResult | null;
  gymCompletionResult: GymCompletionResult | null;
  /** True when the alarm flow was entered via the Home screen's "Try the alarm" preview rather than a real scheduled notification. Demo sessions get a visible exit; the real alarm stays locked until the task is done, by design. */
  isDemo: boolean;
  /** Which alarm sound to ring for this session — the triggering alarm's own choice, or the default for demo sessions. */
  soundId: AlarmSoundId;
  /** The triggering alarm's id, for rescheduling a snooze. Null for demo sessions — there's no real notification to reschedule. */
  alarmId: string | null;
  startFlow: (
    word: ZazuAlarmWord,
    options?: { isDemo?: boolean; soundId?: AlarmSoundId; alarmId?: string },
  ) => void;
  startGymFlow: (word: ZazuGymWord) => void;
  startGymModeSession: (session: GymModeSession) => void;
  setCompletionResult: (result: CompletionResult) => void;
  setGymCompletionResult: (result: GymCompletionResult) => void;
  clearFlow: () => void;
};

const AlarmFlowContext = createContext<AlarmFlowContextValue | null>(null);

export function AlarmFlowProvider({ children }: { children: ReactNode }) {
  const [sessionWord, setSessionWord] = useState<ZazuAlarmWord | null>(null);
  const [gymSessionWord, setGymSessionWord] = useState<ZazuGymWord | null>(null);
  const [gymSession, setGymSession] = useState<GymModeSession | null>(null);
  const [completionResult, setCompletionResultState] = useState<CompletionResult | null>(null);
  const [gymCompletionResult, setGymCompletionResultState] = useState<GymCompletionResult | null>(
    null,
  );
  const [isDemo, setIsDemo] = useState(false);
  const [soundId, setSoundId] = useState<AlarmSoundId>(DEFAULT_ALARM_SOUND_ID);
  const [alarmId, setAlarmId] = useState<string | null>(null);

  const startFlow = useCallback(
    (word: ZazuAlarmWord, options?: { isDemo?: boolean; soundId?: AlarmSoundId; alarmId?: string }) => {
      setSessionWord(word);
      setGymSessionWord(null);
      setGymSession(null);
      setCompletionResultState(null);
      setGymCompletionResultState(null);
      setIsDemo(Boolean(options?.isDemo));
      setSoundId(options?.soundId ?? DEFAULT_ALARM_SOUND_ID);
      setAlarmId(options?.alarmId ?? null);
    },
    [],
  );

  const startGymFlow = useCallback((word: ZazuGymWord) => {
    setGymSessionWord(word);
    setGymSession(null);
    setSessionWord(null);
    setCompletionResultState(null);
    setGymCompletionResultState(null);
    setAlarmId(null);
  }, []);

  const startGymModeSession = useCallback((session: GymModeSession) => {
    setGymSession(session);
    setGymSessionWord(null);
    setSessionWord(null);
    setCompletionResultState(null);
    setGymCompletionResultState(null);
    setAlarmId(null);
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
    setGymSession(null);
    setCompletionResultState(null);
    setGymCompletionResultState(null);
    setIsDemo(false);
    setSoundId(DEFAULT_ALARM_SOUND_ID);
    setAlarmId(null);
  }, []);

  const value = useMemo(
    () => ({
      sessionWord,
      gymSessionWord,
      gymSession,
      completionResult,
      gymCompletionResult,
      isDemo,
      soundId,
      alarmId,
      startFlow,
      startGymFlow,
      startGymModeSession,
      setCompletionResult,
      setGymCompletionResult,
      clearFlow,
    }),
    [
      sessionWord,
      gymSessionWord,
      gymSession,
      completionResult,
      gymCompletionResult,
      isDemo,
      soundId,
      alarmId,
      startFlow,
      startGymFlow,
      startGymModeSession,
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
