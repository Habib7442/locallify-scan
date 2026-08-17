import {
  Hanken_Grotesk,
  Inter,
  Poppins,
  Montserrat,
  Space_Grotesk,
  Work_Sans,
  Roboto,
  Playfair_Display,
} from "next/font/google";

const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-poppins" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans" });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-roboto" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const FONTS = {
  hanken,
  inter,
  poppins,
  montserrat,
  space_grotesk: spaceGrotesk,
  work_sans: workSans,
  roboto,
  playfair,
} as const;

export type FontKey = keyof typeof FONTS;

export const FONT_LABELS: Record<FontKey, string> = {
  hanken: "Hanken Grotesk",
  inter: "Inter",
  poppins: "Poppins",
  montserrat: "Montserrat",
  space_grotesk: "Space Grotesk",
  work_sans: "Work Sans",
  roboto: "Roboto",
  playfair: "Playfair Display",
};

export function fontClassName(key: string | null | undefined): string {
  return (FONTS[key as FontKey] ?? hanken).className;
}
