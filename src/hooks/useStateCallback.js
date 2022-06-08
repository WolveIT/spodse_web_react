import { useCallback, useEffect, useRef, useState } from "react";

/**
 * This hook mimcs the setState behaviour of class components. An optional callback can be passed
 * as the second parameter of setState to be called when the state has been changed
 *
 * @param initialState
 */
export function useStateCallback(initialState) {
  const [state, _setState] = useState(initialState);

  const callbackRef = useRef();
  const isFirstCallbackCall = useRef(true);

  const setState = useCallback(
    (setStateAction, callback) => {
      _setState(setStateAction);
      if (state === setStateAction) {
        if (typeof callback === "function") callback(state);
        return;
      }
      callbackRef.current = callback;
    },
    [state]
  );

  useEffect(() => {
    if (isFirstCallbackCall.current) {
      isFirstCallbackCall.current = false;
      return;
    }
    typeof callbackRef.current === "function" && callbackRef.current(state);
  }, [state]);

  return [state, setState];
}
