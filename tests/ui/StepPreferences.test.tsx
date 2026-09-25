// @vitest-environment jsdom
import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  StepPreferences,
  isPreferencesValid,
  type PreferencesDraft,
} from "@/components/onboarding/StepPreferences";

const filled: PreferencesDraft = {
  days: 5,
  duration: 60,
  level: "intermediario",
  goal: "hipertrofia",
  cardio: false,
  gymType: "moderna",
  splitMode: "auto",
  customSplit: [],
};

describe("StepPreferences", () => {
  test("switching to Personalizada emits splitMode custom", () => {
    const onChange = vi.fn();
    render(<StepPreferences draft={filled} onChange={onChange} />);
    fireEvent.click(screen.getByText("Personalizada"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ splitMode: "custom" }));
  });

  test("renders one focus select per training day in custom mode", () => {
    render(<StepPreferences draft={{ ...filled, splitMode: "custom" }} onChange={vi.fn()} />);
    expect(screen.getAllByRole("combobox")).toHaveLength(5);
    expect(screen.getByText("Dia 5")).toBeInTheDocument();
  });

  test("choosing a focus updates the right day slot", () => {
    const onChange = vi.fn();
    render(<StepPreferences draft={{ ...filled, splitMode: "custom" }} onChange={onChange} />);
    fireEvent.change(screen.getAllByRole("combobox")[2], { target: { value: "perna" } });
    const next = onChange.mock.calls[0][0] as PreferencesDraft;
    expect(next.customSplit).toEqual([null, null, "perna", null, null]);
  });

  test("changing the day count resizes the custom split preserving choices", () => {
    const onChange = vi.fn();
    render(
      <StepPreferences
        draft={{ ...filled, splitMode: "custom", customSplit: ["perna", "braco", "perna", "braco", "perna"] }}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByText("3"));
    const next = onChange.mock.calls[0][0] as PreferencesDraft;
    expect(next.days).toBe(3);
    expect(next.customSplit).toEqual(["perna", "braco", "perna"]);
  });
});

describe("isPreferencesValid", () => {
  test("auto mode is valid once all fields are set", () => {
    expect(isPreferencesValid(filled)).toBe(true);
    expect(isPreferencesValid({ ...filled, goal: null })).toBe(false);
  });

  test("custom mode requires a focus for every day", () => {
    expect(isPreferencesValid({ ...filled, splitMode: "custom", customSplit: ["perna", "braco", "perna", "braco", null] })).toBe(false);
    expect(isPreferencesValid({ ...filled, splitMode: "custom", customSplit: ["perna", "braco", "perna", "braco", "perna"] })).toBe(true);
    expect(isPreferencesValid({ ...filled, days: null, splitMode: "custom", customSplit: [] })).toBe(false);
  });
});
