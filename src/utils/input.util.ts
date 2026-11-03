import type React from 'react';

/** Block letters and symbols as they are typed. Pasted text is cleaned by normalize */
export const allowDigitsOnly = (
  event: React.KeyboardEvent<HTMLInputElement>,
) => {
  const isShortcut = event.ctrlKey || event.metaKey || event.altKey;
  if (event.key.length === 1 && /\D/.test(event.key) && !isShortcut) {
    event.preventDefault();
  }
};
