// @vitest-environment jsdom
import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExerciseCard } from "@/components/workout/ExerciseCard";
import { getExercise } from "@/data/exercises";
import type { WorkoutExercise } from "@/data/types";

const exercise = getExercise("agachamento-halter")!;
const workout: WorkoutExercise = {
  exerciseId: exercise.id,
  effectiveSets: 3,
  technique: "rest-pause",
  guidance: "Vá até a falha técnica.",
};

function renderCard(overrides: Partial<React.ComponentProps<typeof ExerciseCard>> = {}) {
  const props = {
    index: 0,
    exercise,
    workout,
    done: false,
    weight: undefined,
    onToggle: vi.fn(),
    onWeightChange: vi.fn(),
    ...overrides,
  };
  render(<ExerciseCard {...props} />);
  return props;
}

describe("ExerciseCard", () => {
  test("starts collapsed and opens on header click", () => {
    renderCard();
    expect(screen.queryByText("Carga (kg)")).toBeNull();
    fireEvent.click(screen.getByText(exercise.name));
    expect(screen.getByText("Carga (kg)")).toBeInTheDocument();
  });

  test("shows the last weight as hint and placeholder", () => {
    renderCard({ lastWeight: 42.5 });
    fireEvent.click(screen.getByText(exercise.name));
    expect(screen.getByText("42.5 kg")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("42.5")).toBeInTheDocument();
  });

  test("shows the seeded weight as the input value", () => {
    renderCard({ weight: 40 });
    fireEvent.click(screen.getByText(exercise.name));
    expect(screen.getByRole("spinbutton")).toHaveValue(40);
  });

  test("typing a weight emits a number, clearing emits 0", () => {
    const props = renderCard({ weight: 40 });
    fireEvent.click(screen.getByText(exercise.name));
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "37.5" } });
    expect(props.onWeightChange).toHaveBeenNthCalledWith(1, 37.5);
    fireEvent.change(input, { target: { value: "" } });
    expect(props.onWeightChange).toHaveBeenNthCalledWith(2, 0);
  });

  test("Concluir toggles and collapses; Trocar calls onSwap", () => {
    const props = renderCard({ onSwap: vi.fn() });
    fireEvent.click(screen.getByText(exercise.name));
    fireEvent.click(screen.getByText(/Trocar por outro/));
    expect(props.onSwap).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText("Concluir"));
    expect(props.onToggle).toHaveBeenCalledTimes(1);
  });

  test("renders done state with check mark", () => {
    renderCard({ done: true });
    expect(screen.getByText("✓")).toBeInTheDocument();
  });
});
