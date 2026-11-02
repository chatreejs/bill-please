import { useEffect } from 'react';

// The page must grow by this much to count as the keyboard closing, so the
// address bar showing or hiding does not count
const KEYBOARD_MIN_HEIGHT = 120;

/**
 * Phones can hide the keyboard and leave the input focused, so its blur
 * event never fires. On iPhone this happens on a tap outside the input,
 * and on Android when the back button closes the keyboard. Blur the input
 * in both cases, so checks that run on blur still run.
 */
const useBlurOnKeyboardClose = (
  getInput: () => HTMLInputElement | null | undefined,
  isEnabled = true,
) => {
  useEffect(() => {
    if (!isEnabled) return;

    const getFocusedInput = () => {
      const input = getInput();
      return input && document.activeElement === input ? input : undefined;
    };

    const onPointerDown = (event: PointerEvent) => {
      const input = getFocusedInput();
      if (input && !input.contains(event.target as Node)) {
        input.blur();
      }
    };

    const viewport = window.visualViewport;
    let lastHeight = viewport?.height ?? 0;
    const onViewportResize = () => {
      const height = viewport?.height ?? 0;
      if (height - lastHeight >= KEYBOARD_MIN_HEIGHT) {
        getFocusedInput()?.blur();
      }
      lastHeight = height;
    };

    document.addEventListener('pointerdown', onPointerDown);
    viewport?.addEventListener('resize', onViewportResize);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      viewport?.removeEventListener('resize', onViewportResize);
    };
  }, [isEnabled]);
};

export default useBlurOnKeyboardClose;
