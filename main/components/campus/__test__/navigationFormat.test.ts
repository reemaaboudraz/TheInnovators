import {
  formatArrivalTimeFromNow,
  metersToKmString,
  secondsToMinutesString,
} from "@/components/campus/helper_methods/navigationFormat";

describe("navigationFormat", () => {
  describe("formatArrivalTimeFromNow", () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it("formats minutes with leading zero (e.g., 07)", () => {
      // Freeze time: Jan 1, 2026 10:05:00
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-01-01T10:05:00"));

      // +2 minutes => 10:07
      expect(formatArrivalTimeFromNow(120)).toBe("10:07");
    });

    it("handles hour rollover", () => {
      // 10:59:00 + 2 minutes => 11:01
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-01-01T10:59:00"));

      expect(formatArrivalTimeFromNow(120)).toBe("11:01");
    });
  });

  describe("secondsToMinutesString", () => {
    it("rounds seconds to minutes and enforces minimum 1", () => {
      expect(secondsToMinutesString(0)).toBe("1");
      expect(secondsToMinutesString(1)).toBe("1");
      expect(secondsToMinutesString(29)).toBe("1");
      expect(secondsToMinutesString(30)).toBe("1"); // Math.round(0.5)=1
      expect(secondsToMinutesString(31)).toBe("1");
      expect(secondsToMinutesString(89)).toBe("1"); // 1.48 -> 1
      expect(secondsToMinutesString(90)).toBe("2"); // 1.5 -> 2
      expect(secondsToMinutesString(119)).toBe("2"); // 1.98 -> 2
      expect(secondsToMinutesString(120)).toBe("2");
    });
  });

  describe("metersToKmString", () => {
    it("formats <10km with 1 decimal place", () => {
      expect(metersToKmString(0)).toBe("0.0");
      expect(metersToKmString(50)).toBe("0.1"); // 0.05 -> 0.1
      expect(metersToKmString(999)).toBe("1.0"); // 0.999 -> 1.0
      expect(metersToKmString(1500)).toBe("1.5");
      expect(metersToKmString(9900)).toBe("9.9");
    });

    it("formats >=10km with no decimals", () => {
      expect(metersToKmString(10_000)).toBe("10");
      expect(metersToKmString(10_100)).toBe("10");
      expect(metersToKmString(10_900)).toBe("11"); // 10.9 -> 11
      expect(metersToKmString(25_000)).toBe("25");
    });
  });
});
