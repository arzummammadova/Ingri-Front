export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type Cefr = (typeof LEVELS)[number];

export const NEXT_LEVEL: Record<Cefr, Cefr> = {
  A1: "A2",
  A2: "B1",
  B1: "B2",
  B2: "C1",
  C1: "C2",
  C2: "C2",
};

export const DAILY_GOAL: Record<Cefr, number> = {
  A1: 10,
  A2: 15,
  B1: 20,
  B2: 25,
  C1: 30,
  C2: 35,
};

export function isCefr(value: string): value is Cefr {
  return (LEVELS as readonly string[]).includes(value);
}
