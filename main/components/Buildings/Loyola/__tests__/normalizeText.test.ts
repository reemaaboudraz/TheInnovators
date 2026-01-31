import { describe, it, expect } from "@jest/globals";
import { normalizeText } from "@/components/Buildings/Loyola/LoyolaBuildings";

describe("normalizeText()", () => {
  it("lowercases and trims extra spaces", () => {
    expect(normalizeText("  Hello   World  ")).toBe("hello world");
  });

  it("removes accents (NFD stripping)", () => {
    expect(normalizeText("École Été à Montréal")).toBe("ecole ete a montreal");
  });

  it("replaces punctuation with spaces and collapses runs", () => {
    expect(normalizeText("AD---Building!!!")).toBe("ad building");
  });

  it("returns empty string for only symbols/spaces", () => {
    expect(normalizeText("   --- !!! ")).toBe("");
  });
});
