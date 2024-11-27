// ./front/src/types/dots.ts
import colors from "@/constants/colors";

// Základné typy pre dots
export type TopRowType = "client" | "forwarder" | "carrier" | null;
export type BottomRowType = "anonymous" | "cookies" | "registered" | null;

// Typy pre farby
export type DotsColors = typeof colors.components.dots;
export type DotsColorValues = DotsColors[keyof DotsColors];
export type DotsArray = DotsColorValues[];

// Props interfaces
export interface NavDotsProps {
  topDots: DotsArray;
  bottomDots: DotsArray;
  onClick: () => void;
}

export interface NavCenterGroupProps extends Omit<NavDotsProps, "onClick"> {
  onAvatarClick: () => void;
  onDotsClick: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

// Props pre Modal
export interface DotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectionChange: (top: TopRowType, bottom: BottomRowType) => void;
  initialTopDots: DotsArray;
  initialBottomDots: DotsArray;
}
