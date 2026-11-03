import { describe, expect, it } from "vitest";
import {
  generatePaymentReference,
  getInvestmentState,
} from "@/lib/investment";

describe("generatePaymentReference", () => {
  it("starts with MTC- and has 6 unambiguous characters", () => {
    const ref = generatePaymentReference();
    expect(ref).toMatch(/^MTC-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/);
  });

  it("generates different references across calls", () => {
    const refs = new Set(
      Array.from({ length: 50 }, () => generatePaymentReference()),
    );
    expect(refs.size).toBeGreaterThan(1);
  });
});

describe("getInvestmentState", () => {
  const future = new Date(Date.now() + 86400000).toISOString();
  const past = new Date(Date.now() - 86400000).toISOString();

  it("never lets a pending cycle mature by date — admin approval starts maturity", () => {
    expect(getInvestmentState({ status: "pending", matures_at: past })).toBe(
      "pending",
    );
  });

  it("never lets a rejected cycle mature by date", () => {
    expect(getInvestmentState({ status: "rejected", matures_at: past })).toBe(
      "rejected",
    );
  });

  it("matures an approved cycle once its maturity date passes", () => {
    expect(getInvestmentState({ status: "active", matures_at: past })).toBe(
      "matured",
    );
  });

  it("keeps an approved cycle active until its maturity date", () => {
    expect(getInvestmentState({ status: "active", matures_at: future })).toBe(
      "active",
    );
  });

  it("treats withdrawn cycles as withdrawn before anything else", () => {
    expect(getInvestmentState({ status: "active", matures_at: past }, true)).toBe(
      "withdrawn",
    );
  });
});
