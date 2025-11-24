export type LifeCategory = 
  | 'Health' 
  | 'Career' 
  | 'Finance' 
  | 'Relationships' 
  | 'Spirituality' 
  | 'Passion';

export interface ActionStep {
  small: string;
  medium: string;
  big: string;
}

export interface CategoryGoal {
  category: LifeCategory;
  mainGoal: string;
  actions: ActionStep;
  monthlyCheckIn: string;
  motivation: {
    why: string;
    consequence: string;
  };
}

export interface WizardData {
  selectedCategories: LifeCategory[];
  primaryCategory: LifeCategory | null;
  secondaryCategories: LifeCategory[];
  lifeWheelRatings: Record<LifeCategory, number>;
  goals: CategoryGoal[];
  userInfo: {
    name: string;
    email: string;
  };
}

export type WizardStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;
