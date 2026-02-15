export const computeFloatingBottom = (
    selectedExists: boolean,
    popupIndex: number,
) => {
    const base = 120;
    if (!selectedExists || popupIndex === -1) return base;
    if (popupIndex === 0) return 280;
    return 440;
};