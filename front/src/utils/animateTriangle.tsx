// File: src/utils/animateTriangle.tsx
type SortDirection = "asc" | "desc" | "none";

export const getAnimatedTriangle = (
  direction: SortDirection,
  className?: string,
  onClick?: (e: React.MouseEvent) => void
): JSX.Element => {
  switch (direction) {
    case "asc":
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
          <path d="M6 2L2 10H10L6 2Z" fill="currentColor" />
        </svg>
      );
    case "desc":
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
          <path d="M6 10L2 2H10L6 10Z" fill="currentColor" />
        </svg>
      );
    case "none":
    default:
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
          <path d="M6 3L4 5H8L6 3Z" fill="currentColor" />
          <path d="M6 9L4 7H8L6 9Z" fill="currentColor" />
        </svg>
      );
  }
};