export interface ICompleteOnboardingInput {
  clerkUserId: string;
  email: string;
  name: string;
  username: string;
  phone: string;
}

export type TCompleteOnboardingActionState = {
  error: string | null;
};
