import localFont from "next/font/local";

// Anek Kannada - Variable font (includes all weights)
export const anek = localFont({
  src: "../../public/fonts/anek/AnekLatin[wdth,wght].ttf",
  variable: "--font-anek",
  display: "swap",
  // For extra bold, you'll use font-weight: 800 in your CSS
});

// Aileron Thin
export const aileron = localFont({
  src: "../../public/fonts/aileron/Aileron-Light.otf",
  variable: "--font-aileron",
  display: "swap",
  weight: "100",
});
