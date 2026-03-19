"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { LifeCategory, GoalType, Quarter, Frequency } from "@prisma/client"

export interface WizardReflections {
  wins: string
  challenges: string
  gratitude: string
  lessons: string
}

export interface WizardWheelEntry {
  category: LifeCategory
  rating: number
}

export interface WizardCheckpoint {
  quarter: Quarter
  title: string
  description: string
}

export interface WizardSystem {
  description: string
  frequency: Frequency
}

export interface WizardGoal {
  id: string
  category: LifeCategory
  type: GoalType
  title: string
  description: string
  whyText: string
  consequenceText: string
  checkpoints: WizardCheckpoint[]
  systems: WizardSystem[]
}

export interface WizardAntiGoal {
  id: string
  description: string
  category: LifeCategory | null
}

interface WizardState {
  currentStep: number
  year: number
  reflections: WizardReflections
  wheelEntries: WizardWheelEntry[]
  wheelContext: string
  goals: WizardGoal[]
  antiGoals: WizardAntiGoal[]
  isSubmitting: boolean

  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setYear: (year: number) => void
  setReflections: (reflections: Partial<WizardReflections>) => void
  setWheelEntry: (category: LifeCategory, rating: number) => void
  setWheelContext: (context: string) => void
  addGoal: (goal: WizardGoal) => void
  updateGoal: (id: string, data: Partial<WizardGoal>) => void
  removeGoal: (id: string) => void
  addAntiGoal: (antiGoal: WizardAntiGoal) => void
  updateAntiGoal: (id: string, data: Partial<WizardAntiGoal>) => void
  removeAntiGoal: (id: string) => void
  setSubmitting: (v: boolean) => void
  reset: () => void
}

const LIFE_CATEGORIES: LifeCategory[] = [
  "HEALTH",
  "CAREER",
  "FINANCE",
  "RELATIONSHIPS",
  "SPIRITUALITY",
  "PASSION",
]

const currentMonth = new Date().getMonth()
const defaultYear = currentMonth >= 10 ? new Date().getFullYear() + 1 : new Date().getFullYear()

const initialState = {
  currentStep: 0,
  year: defaultYear,
  reflections: { wins: "", challenges: "", gratitude: "", lessons: "" },
  wheelEntries: LIFE_CATEGORIES.map((c) => ({ category: c, rating: 5 })),
  wheelContext: "",
  goals: [] as WizardGoal[],
  antiGoals: [] as WizardAntiGoal[],
  isSubmitting: false,
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 6) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),
      setYear: (year) => set({ year }),

      setReflections: (reflections) =>
        set((s) => ({ reflections: { ...s.reflections, ...reflections } })),

      setWheelEntry: (category, rating) =>
        set((s) => ({
          wheelEntries: s.wheelEntries.map((e) =>
            e.category === category ? { ...e, rating } : e
          ),
        })),

      setWheelContext: (wheelContext) => set({ wheelContext }),

      addGoal: (goal) => set((s) => ({ goals: [...s.goals, goal] })),
      updateGoal: (id, data) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
        })),
      removeGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      addAntiGoal: (antiGoal) =>
        set((s) => ({ antiGoals: [...s.antiGoals, antiGoal] })),
      updateAntiGoal: (id, data) =>
        set((s) => ({
          antiGoals: s.antiGoals.map((a) => (a.id === id ? { ...a, ...data } : a)),
        })),
      removeAntiGoal: (id) =>
        set((s) => ({ antiGoals: s.antiGoals.filter((a) => a.id !== id) })),

      setSubmitting: (isSubmitting) => set({ isSubmitting }),
      reset: () => set(initialState),
    }),
    { name: "yir-wizard" }
  )
)

export const WIZARD_STEPS = [
  { id: "begin", label: "Begin", title: "Welcome to Your Journey" },
  { id: "reflect", label: "Reflect", title: "Honor Your Past Year" },
  { id: "discover", label: "Discover", title: "Your Wheel of Life" },
  { id: "envision", label: "Envision", title: "Set Your Intentions" },
  { id: "map", label: "Map", title: "Chart the Path" },
  { id: "release", label: "Release", title: "Set Boundaries" },
  { id: "activate", label: "Activate", title: "Bring It to Life" },
] as const
