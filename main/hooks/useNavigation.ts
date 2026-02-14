import { useCallback, useState } from "react";
import type { Building } from "@/components/Buildings/types";

export type RouteField = "start" | "destination";

export function useNavigation() {
  const [isRouteMode, setIsRouteMode] = useState(false);

  const [routeStart, setRouteStart] = useState<Building | null>(null);
  const [routeDest, setRouteDest] = useState<Building | null>(null);

  const [activeField, setActiveField] = useState<RouteField>("destination");

  const [routeError, setRouteError] = useState<string | null>(null);

  const toggleRouteMode = useCallback(() => {
    setIsRouteMode((v) => !v);
    setRouteError(null);
    setActiveField("destination");
  }, []);

  const clearStart = useCallback(() => setRouteStart(null), []);
  const clearDestination = useCallback(() => setRouteDest(null), []);

  const setFieldFromBuilding = useCallback(
    (b: Building) => {
      if (activeField === "start") setRouteStart(b);
      else setRouteDest(b);

      setRouteError(null);
    },
    [activeField],
  );

  const validateRouteRequest = useCallback(() => {
    if (!routeStart && !routeDest) {
      setRouteError("Select a start and destination.");
      return false;
    }
    if (!routeStart) {
      setRouteError("Select a start location.");
      return false;
    }
    if (!routeDest) {
      setRouteError("Select a destination.");
      return false;
    }

    setRouteError(null);
    return true;
  }, [routeStart, routeDest]);

  return {
    // state
    isRouteMode,
    routeStart,
    routeDest,
    activeField,
    routeError,

    // setters/actions
    setIsRouteMode,
    setRouteStart,
    setRouteDest,
    setActiveField,

    toggleRouteMode,
    clearStart,
    clearDestination,
    setFieldFromBuilding,
    validateRouteRequest,
    setRouteError,
  };
}
