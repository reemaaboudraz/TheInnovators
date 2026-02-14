import { filterBuildingSuggestions } from "@/components/campus/filterBuildingSuggestions";
import type { Building } from "@/components/Buildings/types";

const buildings: Building[] = [
  {
    id: "1",
    code: "H",
    name: "Henry Hall",
    address: "1455 De Maisonneuve",
    latitude: 45.1,
    longitude: -73.1,
    campus: "SGW",
    zoomCategory: 2,
    aliases: ["hall", "henry"],
    polygon: [],
  },
  {
    id: "2",
    code: "AD",
    name: "Administration Building",
    address: "7141 Sherbrooke",
    latitude: 45.2,
    longitude: -73.2,
    campus: "LOY",
    zoomCategory: 2,
    aliases: ["admin"],
    polygon: [],
  },
];

describe("filterBuildingSuggestions", () => {
  it("returns [] for empty query", () => {
    expect(filterBuildingSuggestions("   ", buildings)).toEqual([]);
  });

  it("matches by code", () => {
    const r = filterBuildingSuggestions("ad", buildings);
    expect(r.map((b) => b.id)).toEqual(["2"]);
  });

  it("matches by name/address/aliases", () => {
    expect(filterBuildingSuggestions("henry", buildings)[0].id).toBe("1");
    expect(filterBuildingSuggestions("sherbrooke", buildings)[0].id).toBe("2");
    expect(filterBuildingSuggestions("admin", buildings)[0].id).toBe("2");
  });

  it("enforces limit", () => {
    const repeated = Array.from({ length: 10 }, (_, i) => ({
      ...buildings[0],
      id: `x-${i}`,
      code: `H${i}`,
      name: `Henry ${i}`,
    }));
    expect(filterBuildingSuggestions("henry", repeated, 3)).toHaveLength(3);
  });
});
