// Relative luminance of a "#rrggbb" color (WCAG formula)
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastRatio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

export function getScanWarnings({
  foregroundColor,
  backgroundColor,
  gradientEnabled,
  gradientStart,
  gradientEnd,
  margin,
  moduleSize,
  pattern,
  errorCorrection,
}) {
  const warnings = [];

  // With gradient on, modules use the gradient colors and finders use the foreground
  const darkSide = gradientEnabled
    ? [foregroundColor, gradientStart, gradientEnd]
    : [foregroundColor];

  if (darkSide.some((c) => contrastRatio(c, backgroundColor) < 3)) {
    warnings.push(
      "Low contrast between the QR and its background. It may not scan."
    );
  }

  if (darkSide.some((c) => luminance(c) > luminance(backgroundColor))) {
    warnings.push(
      "Light-on-dark (inverted) QR codes are not supported by many scanners."
    );
  }

  if (margin < 8) {
    warnings.push(
      "The margin is very small. Scanners need clear space around the code."
    );
  }

  if (moduleSize < 3) {
    warnings.push(
      "Modules are very small. Increase the size or shorten the content."
    );
  }

  if (
    ["dots", "diamond", "pixel", "grid", "rounded"].includes(pattern) &&
    errorCorrection === "L"
  ) {
    warnings.push(
      "This pattern with Low error correction is risky. Try Medium or higher."
    );
  }

  return warnings;
}