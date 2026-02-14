import { useState } from "react";
import type { Building } from "@/components/Buildings/types";
import type { SelectionMode } from "@/components/campus/NavigationSearchCard";

export function useNavigationState() {
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);
  const [query, setQuery] = useState("");
  const [startBuilding, setStartBuilding] = useState<Building | null>(null);
  const [destinationBuilding, setDestinationBuilding] =
    useState<Building | null>(null);

  const startValue = startBuilding
    ? `${startBuilding.code} - ${startBuilding.name}`
    : "";

  const destinationValue = destinationBuilding
    ? `${destinationBuilding.code} - ${destinationBuilding.name}`
    : "";

  const swap = () => {
    setStartBuilding(destinationBuilding);
    setDestinationBuilding(startBuilding);
  };

  return {
    selectionMode,
    setSelectionMode,
    query,
    setQuery,
    startBuilding,
    setStartBuilding,
    destinationBuilding,
    setDestinationBuilding,
    startValue,
    destinationValue,
    swap,
  };
}
