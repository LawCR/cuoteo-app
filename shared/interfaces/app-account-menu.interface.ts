export type TAppAccountMenuVariant = "sidebar" | "icon";

export interface IAppAccountMenuProps {
  name: string;
  email: string;
  variant?: TAppAccountMenuVariant;
  showProfileLink?: boolean;
}
