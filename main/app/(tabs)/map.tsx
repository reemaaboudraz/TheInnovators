import React from "react";
import SGWCampus from "@/components/campus/SGW/SGWCampus";
import LoyolaCampus from "@/components/campus/Loyola/LoyolaCampus";

// temporary (later you can replace by a toggle / state)
const DEFAULT_CAMPUS: "SGW" | "LOY" = "SGW";

export default function MapScreen() {
    return DEFAULT_CAMPUS === "SGW" ? <SGWCampus /> : <LoyolaCampus />;
}
