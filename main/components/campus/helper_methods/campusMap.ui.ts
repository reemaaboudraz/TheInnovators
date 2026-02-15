const FLOATING_BOTTOM_POSITIONS = {
  BASE: 120,
  PEEK: 280,
  EXPANDED: 440,
} as const;

export const computeFloatingBottom = (
  selectedExists: boolean,
  popupIndex: number,
) => {
  if (!selectedExists || popupIndex === -1) {
    return FLOATING_BOTTOM_POSITIONS.BASE;
  }
  return popupIndex === 0
    ? FLOATING_BOTTOM_POSITIONS.PEEK
    : FLOATING_BOTTOM_POSITIONS.EXPANDED;
};
