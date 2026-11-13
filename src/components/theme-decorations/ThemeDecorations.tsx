import React from 'react';

import { AppTheme, getAppTheme } from '../../config/theme';
import { CardPart } from './card';
import FullMoon from './FullMoon';
import Garland from './Garland';
import GoldLattice from './GoldLattice';
import PartyHat from './PartyHat';
import Particles from './Particles';
import RedEnvelope from './RedEnvelope';
import SantaHat from './SantaHat';

type Decorations = Partial<Record<AppTheme, React.ReactNode>>;

// Each component looks up its map on every render. The theme doesn't change
// during a visit, so the result is always the same

const SKY: Decorations = {
  'loy-krathong': <Particles kind="lantern" />,
  christmas: <Particles kind="snow" />,
  'new-year': <Particles kind="confetti" />,
  'chinese-new-year': (
    <>
      <GoldLattice />
      <Particles kind="glint" />
    </>
  ),
  songkran: <Particles kind="drop" />,
};

const LOGO: Decorations = {
  'loy-krathong': <FullMoon />,
  christmas: <SantaHat />,
  'new-year': <PartyHat />,
};

const CARD: Partial<Record<AppTheme, (part: CardPart) => React.ReactNode>> = {
  'loy-krathong': (part) => part !== 'bottom' && <Garland kind="marigolds" />,
  christmas: (part) => part !== 'bottom' && <Garland kind="lights" />,
  'new-year': (part) =>
    part !== 'bottom' && (
      <Garland
        kind="bunting"
        colors={['#d4a020', '#6d28d9', '#c0c6d0', '#e0559b']}
      />
    ),
  'chinese-new-year': (part) => <RedEnvelope part={part} />,
  songkran: (part) =>
    part !== 'bottom' && (
      <Garland
        kind="bunting"
        colors={['#06b6d4', '#fbbf24', '#f472b6', '#22c55e', '#0369a1']}
      />
    ),
};

/** Behind the whole app. Render it before MainWrapper */
export const ThemeSky: React.FC = () => <>{SKY[getAppTheme()]}</>;

/** An accessory on the logo text */
export const ThemeLogoDecoration: React.FC = () => <>{LOGO[getAppTheme()]}</>;

/** On the bill card. Its parent must be position: relative */
export const ThemeCardDecoration: React.FC<{ part?: CardPart }> = ({
  part = 'whole',
}) => <>{CARD[getAppTheme()]?.(part)}</>;
