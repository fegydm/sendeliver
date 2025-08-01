// ./front/src/types/dots.ts

import colors from "@/lib/constants/colors";

// basic
export type TopRowType = "client" | "forwarder" | "carrier" | null;
export type BottomRowType = "anonymous" | "cookies" | "registered" | null;

// for colors
export type DotsColors = typeof colors.components.dots;
export type DotsColorValues = DotsColors[keyof DotsColors];
export type DotsArray = DotsColorValues[];

// Props interfaces
export interface NavbarDotsProps {
  topDots: DotsArray;
  bottomDots: DotsArray;
  onClick: () => void;
}

export interface NavbarCenterGroupProps extends Omit<NavbarDotsProps, "onClick"> {
  onAvatarClick: () => void;
  onDotsClick: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

// Props for Modal
export interface DotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectionChange: (top: TopRowType, bottom: BottomRowType) => void;
  initialTopDots: DotsArray;
  initialBottomDots: DotsArray;
}
