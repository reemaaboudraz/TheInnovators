import React from "react";
import LoadErrorOverlay from "./LoadError";

type Props = Readonly<{
  visible: boolean;
  onRefresh: () => void;
  accentColor?: string;
  testIDPrefix?: string;
}>;

export default function BuildingsLoadError({
  visible,
  onRefresh,
  accentColor = "#D84A4A",
  testIDPrefix = "buildings-error",
}: Props) {
  return (
    <LoadErrorOverlay
      visible={visible}
      title="Whoops!"
      message="There was an error loading the buildings. Please refresh the page."
      primaryLabel="Refresh"
      onPrimary={onRefresh}
      accentColor={accentColor}
      testIDPrefix={testIDPrefix}
    />
  );
}
