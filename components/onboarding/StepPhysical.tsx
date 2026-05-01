"use client";

import { Input } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { Sex } from "@/data/types";

export interface PhysicalDraft {
  sex: Sex | null;
  age: string;
  weight: string;
  height: string;
}

interface Props {
  draft: PhysicalDraft;
  onChange: (draft: PhysicalDraft) => void;
}

export function StepPhysical({ draft, onChange }: Props) {
  return (
    <div className="space-y-5">
      <SegmentedControl<Sex>
        label="Sexo"
        columns={2}
        value={draft.sex}
        onChange={(sex) => onChange({ ...draft, sex })}
        options={[
          { value: "masculino", label: "Masculino" },
          { value: "feminino", label: "Feminino" },
        ]}
      />
      <Input
        label="Idade"
        name="age"
        type="number"
        inputMode="numeric"
        suffix="anos"
        placeholder="ex: 28"
        value={draft.age}
        onChange={(e) => onChange({ ...draft, age: e.target.value })}
      />
      <Input
        label="Peso"
        name="weight"
        type="number"
        inputMode="decimal"
        suffix="kg"
        placeholder="ex: 78"
        value={draft.weight}
        onChange={(e) => onChange({ ...draft, weight: e.target.value })}
      />
      <Input
        label="Altura"
        name="height"
        type="number"
        inputMode="numeric"
        suffix="cm"
        placeholder="ex: 175"
        value={draft.height}
        onChange={(e) => onChange({ ...draft, height: e.target.value })}
      />
    </div>
  );
}

export function isPhysicalValid(d: PhysicalDraft): boolean {
  if (!d.sex) return false;
  const age = parseInt(d.age);
  const w = parseFloat(d.weight);
  const h = parseFloat(d.height);
  if (!Number.isFinite(age) || age < 12 || age > 90) return false;
  if (!Number.isFinite(w) || w < 30 || w > 250) return false;
  if (!Number.isFinite(h) || h < 120 || h > 230) return false;
  return true;
}
