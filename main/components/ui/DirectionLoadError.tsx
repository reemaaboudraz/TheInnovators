import React from "react";
import LoadErrorOverlay from "./LoadError";

type Props = Readonly<{
  visible: boolean;
  message: string;
  onRefresh: () => void;
  accentColor?: string;
}>;

export default function DirectionsLoadError({
  visible,
  message,
  onRefresh,
  accentColor = "#D84A4A",
}: Props) {
  return (
    <LoadErrorOverlay
      visible={visible}
      title="Directions unavailable"
      message={message}
      primaryLabel="Refresh"
      onPrimary={onRefresh}
      accentColor={accentColor}
      testIDPrefix="directions-error"
    />
  );
}
