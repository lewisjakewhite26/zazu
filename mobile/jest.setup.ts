// useAlarms/useWordLibrary-style hooks fire state updates from async effects
// (AsyncStorage reads, permission checks) that resolve after the initial
// synchronous render act() wraps -- without this, every such update logs
// "not configured to support act(...)" and, in this React 19 + jest-expo
// combination, breaks renderHook's `result` entirely instead of just warning.
// See https://github.com/reactwg/react-18/discussions/102.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
