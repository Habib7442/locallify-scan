export type SceneContent = {
  ariaLabel: string;
  steps: [string, string, string, string];
  cafeName: string;
  tableName: string;
  tableCode: string;
  seats: [string, string, string, string];
  dessertCard: string;
  phone: {
    welcome: string;
    unlock: string;
    verified: string;
    squadTitle: string;
    squadDone: string;
    prizeIntro: string;
    prizeTitle: string;
    prizeDetail: string;
    prizeSaved: string;
    scratchHint: string;
    footer: string;
  };
  tablet: {
    label: string;
    live: string;
    openTables: string;
    idle: string;
    alertTitle: string;
    alertLine: string;
  };
};

export type HeroContent = {
  eyebrow: string;
  headline: { line1: string; line2Before: string; accent: string; line2After: string };
  sub: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  trust: string[];
  proof: string;
  scene: SceneContent;
};

/** 0 Scan · 1 Squad · 2 Pehchaan · 3 Inaam */
export type Step = 0 | 1 | 2 | 3;
