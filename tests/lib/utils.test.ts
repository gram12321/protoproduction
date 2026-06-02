import { clamp, clamp01, formatNumber } from "@/lib/utils";

describe("utils", () => {
  it("clamps values into the requested range", () => {
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(12, 0, 10)).toBe(10);
  });

  it("clamps values to the 0..1 range", () => {
    expect(clamp01(-0.25)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(1.5)).toBe(1);
  });

  it("formats currency and fixed decimals consistently", () => {
    expect(formatNumber(1000, { currency: true })).toBe("€1,000");
    expect(
      formatNumber(0.5689, { decimals: 3, forceDecimals: true }),
    ).toBe("0,569");
  });
});
