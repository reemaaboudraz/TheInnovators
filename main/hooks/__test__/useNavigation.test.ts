import { renderHook, act } from "@testing-library/react-native";

import { useNavigation } from "@/hooks/useNavigation";

jest.mock("@/components/Buildings/types", () => ({}));

describe("useNavigation", () => {
  const B1 = { code: "H", name: "Hall" } as any;
  const B2 = { code: "MB", name: "Molson" } as any;

  it("toggleRouteMode flips mode + clears error + resets activeField", () => {
    const { result } = renderHook(() => useNavigation());

    act(() => {
      result.current.setRouteError("boom");
      result.current.setActiveField("start");
    });

    act(() => {
      result.current.toggleRouteMode();
    });

    expect(result.current.isRouteMode).toBe(true);
    expect(result.current.routeError).toBeNull();
    expect(result.current.activeField).toBe("destination");
  });

  it("setFieldFromBuilding sets start when activeField=start", () => {
    const { result } = renderHook(() => useNavigation());

    act(() => result.current.setActiveField("start"));
    act(() => result.current.setFieldFromBuilding(B1));

    expect(result.current.routeStart).toEqual(B1);
    expect(result.current.routeDest).toBeNull();
  });

  it("setFieldFromBuilding sets destination when activeField=destination", () => {
    const { result } = renderHook(() => useNavigation());

    act(() => result.current.setActiveField("destination"));
    act(() => result.current.setFieldFromBuilding(B2));

    expect(result.current.routeDest).toEqual(B2);
    expect(result.current.routeStart).toBeNull();
  });

  it("validateRouteRequest returns false + correct errors for missing fields", () => {
    const { result } = renderHook(() => useNavigation());

    let ok = true;
    act(() => {
      ok = result.current.validateRouteRequest();
    });
    expect(ok).toBe(false);
    expect(result.current.routeError).toBe("Select a start and destination.");

    act(() => result.current.setRouteDest(B2));
    act(() => {
      ok = result.current.validateRouteRequest();
    });
    expect(ok).toBe(false);
    expect(result.current.routeError).toBe("Select a start location.");

    act(() => {
      result.current.setRouteDest(null);
      result.current.setRouteStart(B1);
    });
    act(() => {
      ok = result.current.validateRouteRequest();
    });
    expect(ok).toBe(false);
    expect(result.current.routeError).toBe("Select a destination.");
  });

  it("validateRouteRequest returns true when both are selected", () => {
    const { result } = renderHook(() => useNavigation());

    act(() => {
      result.current.setRouteStart(B1);
      result.current.setRouteDest(B2);
    });

    let ok = false;
    act(() => {
      ok = result.current.validateRouteRequest();
    });

    expect(ok).toBe(true);
    expect(result.current.routeError).toBeNull();
  });

  it("clearStart / clearDestination reset the selections", () => {
    const { result } = renderHook(() => useNavigation());

    act(() => {
      result.current.setRouteStart(B1);
      result.current.setRouteDest(B2);
    });

    act(() => result.current.clearStart());
    expect(result.current.routeStart).toBeNull();
    expect(result.current.routeDest).toEqual(B2);

    act(() => result.current.clearDestination());
    expect(result.current.routeDest).toBeNull();
  });
});
