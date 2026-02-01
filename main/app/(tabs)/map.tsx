import React from "react";
import SGWCampus from "@/components/campus/SGW/SGWCampus";
import LoyolaCampus from "@/components/campus/Loyola/LoyolaCampus";

// this will be removed when the toggle button is added later on
const DEFAULT_CAMPUS: "SGW" | "LOY" = "LOY";

export default function MapScreen() {
  return DEFAULT_CAMPUS === "SGW" ? <SGWCampus /> : <LoyolaCampus />;
}
