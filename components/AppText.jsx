import React from "react";
import { Text } from "react-native";
import { typography } from "@/constants/typography";

/**
 * AppText
 * Props:
 *  - variant: "body" | "h1" | "h2" | "caption" etc.
 *  - weight: override weight: "regular"|"semibold"|"bold" (optional)
 *  - color: string override (optional)
 *  - style: additional style (optional)
 *  - children, ...rest
 */
export default function AppText({ variant = "body", weight, color, style, children, ...rest }) {
  const variantStyle = typography.variants[variant] || typography.variants.body;

  // allow weight override to switch family quickly
  const fontFamily = weight
    ? (weight === "bold" ? typography.variants.h1.fontFamily : (weight === "semibold" ? typography.variants.h3.fontFamily : typography.variants.body.fontFamily))
    : variantStyle.fontFamily;

  const textColor = color ?? typography.colors.textPrimary;

  return (
    <Text
      {...rest}
      style={[
        { fontFamily, fontSize: variantStyle.fontSize, lineHeight: variantStyle.lineHeight, color: textColor },
        style,
      ]}
    >
      {children}
    </Text>
  );
}