// app/theme/typography.js
import { PixelRatio } from "react-native";

/**
 * Responsive font scaler using device fontScale.
 * You can tune the base scaleFactor as needed.
 */
const scaleFont = (size) => {
  const fontScale = PixelRatio.getFontScale() || 1; // respects accessibility settings
  return Math.round(size * fontScale);
};

export const fontFamilies = {
  light: "Nunito-Light",
  // extralight: "Nunito-Light",
  regular: "Nunito-Regular",
  semibold: "Nunito-SemiBold",
  bold: "Nunito-Bold",
};

export const typography = {
  // base sizes are in px; scaleFont will adjust with accessibility settings
  variants: {
    h1: { fontFamily: fontFamilies.bold, fontSize: scaleFont(38), lineHeight: scaleFont(50) },
    h2: { fontFamily: fontFamilies.bold, fontSize: scaleFont(34), lineHeight: scaleFont(40) },
    h3: { fontFamily: fontFamilies.semibold, fontSize: scaleFont(30), lineHeight: scaleFont(35) },
    heading: { fontFamily: fontFamilies.semibold, fontSize: scaleFont(27), lineHeight: scaleFont(22) },

    body: { fontFamily: fontFamilies.regular, fontSize: scaleFont(25), lineHeight: scaleFont(28) },
    bodyBold: { fontFamily: fontFamilies.semibold, fontSize: scaleFont(24) },

    label: { fontFamily: fontFamilies.semibold, fontSize: scaleFont(20) },
    caption: { fontFamily: fontFamilies.regular, fontSize: scaleFont(20) },
    small: { fontFamily: fontFamilies.regular, fontSize: scaleFont(16) },

    light: { fontFamily: fontFamilies.light, fontSize: scaleFont(15) },
    // extra
  },

  // helper default colors (override in theme)
  colors: {
    textPrimary: "#000000ff",
    textSecondary: "#475569",
  }
};
