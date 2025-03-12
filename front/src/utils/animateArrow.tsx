// File: src/utils/animateArrow.tsx
export const getAnimatedArrow = (
  isOpen: boolean,
  className?: string,
  onClick?: (e: React.MouseEvent) => void
): JSX.Element => {
  return (
    <svg
      className={className}
      onClick={onClick}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={isOpen ? "M2 8L6 4L10 8" : "M2 4L6 8L10 4"}
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
};