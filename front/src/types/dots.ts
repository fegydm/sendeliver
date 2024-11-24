// ./front/src/types/dots.ts
import { components } from "@front/constants/colors/components";

export type TopRowType = "client" | "forwarder" | "carrier" | null;
export type BottomRowType = "anonymous" | "cookies" | "registered" | null;

export type DotsColors = typeof components.dots;
export type DotsColorValues = DotsColors[keyof DotsColors];
export type DotsArray = DotsColorValues[];

export interface NavCenterGroupProps {
  onAvatarClick: () => void;
  onDotsClick: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  topDots: DotsArray;
  bottomDots: DotsArray;
}