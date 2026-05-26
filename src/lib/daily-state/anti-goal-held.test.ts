import { describe, expect, it } from "vitest"
import {
  parseLegacyAntiGoalReflection,
  resolveAntiGoalHeldForPill,
  resolveReflectionText,
  summarizeAntiGoalHeldRows,
} from "@/lib/daily-state/anti-goal-held"

describe("parseLegacyAntiGoalReflection", () => {
  it("strips held prefix and returns clean text", () => {
    const raw =
      "anti-goal:clxyz123=held\n\nGood focus today"
    expect(parseLegacyAntiGoalReflection(raw)).toEqual({
      antiGoalId: "clxyz123",
      antiHeld: "held",
      text: "Good focus today",
    })
  })

  it("returns plain reflection when no prefix", () => {
    expect(parseLegacyAntiGoalReflection("Just notes")).toEqual({
      antiGoalId: null,
      antiHeld: null,
      text: "Just notes",
    })
  })
})

describe("resolveAntiGoalHeldForPill", () => {
  it("prefers column values for today's rotating anti-goal", () => {
    expect(
      resolveAntiGoalHeldForPill({
        rotatingAntiGoalId: "ag-1",
        antiGoalHeldId: "ag-1",
        antiGoalHeld: false,
        reflection: null,
      }),
    ).toBe("slipped")
  })

  it("falls back to legacy prefix when columns unset", () => {
    expect(
      resolveAntiGoalHeldForPill({
        rotatingAntiGoalId: "ag-1",
        antiGoalHeldId: null,
        antiGoalHeld: null,
        reflection: "anti-goal:ag-1=held\n\nLegacy row",
      }),
    ).toBe("held")
    expect(
      resolveReflectionText("anti-goal:ag-1=held\n\nLegacy row"),
    ).toBe("Legacy row")
  })
})

describe("summarizeAntiGoalHeldRows", () => {
  it("counts held and slipped", () => {
    expect(
      summarizeAntiGoalHeldRows([
        { antiGoalHeld: true },
        { antiGoalHeld: false },
        { antiGoalHeld: true },
        { antiGoalHeld: null },
      ]),
    ).toEqual({ held: 2, slipped: 1, answered: 3 })
  })
})
