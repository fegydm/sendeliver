// ./front/src/types/dots.ts
import colors from "@constants/colors";
// alebo
// import { components } from "@constants/colors/components";

export type TopRowType = "client" | "forwarder" | "carrier" | null;
export type BottomRowType = "anonymous" | "cookies" | "registered" | null;

export type DotsColors = typeof colors.components.dots;
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