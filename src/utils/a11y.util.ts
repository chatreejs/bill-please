import type { KeyboardEvent } from 'react';

/**
 * Props that make an element such as an antd Card or Tag act as a button.
 * Screen readers announce it as a button, the Tab key stops on it, and
 * Enter or Space calls onPress.
 */
export const buttonProps = (onPress: () => void) => ({
  role: 'button',
  tabIndex: 0,
  onClick: onPress,
  onKeyDown: (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onPress();
    }
  },
});
