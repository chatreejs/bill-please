import { getAppTheme } from '../../config/theme';

/**
 * BillCard uses `whole`. The Result page's ticket is two halves joined by a
 * tear line, and uses `top` and `bottom`
 */
export type CardPart = 'whole' | 'top' | 'bottom';

/** How far the red envelope's seal reaches above the card, in px */
export const SEAL_OVERHANG = 20;

/** Room to leave above the card so the share image keeps its decoration */
export const getCardOverhang = (): number =>
  getAppTheme() === 'chinese-new-year' ? SEAL_OVERHANG : 0;
