// File: front/src/components/shared/ui/slider.ui.tsx
// Last change: Fixed TS2322 error by removing orient attribute and using CSS for vertical orientation
import react from 'react';

export interface SliderProps extends Omit<react.InputHTMLAttributes<hTMLInputElement>, 'onChange'> {
  /** Orientation of the slider: 'horizontal' | 'vertical' */
  orientation?: 'horizontal' | 'vertical';
  /** Initial slider value */
  initialValue?: number;
  /** Called when the value changes */
  onValueChange?: (value: number) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Additional CSS classes */
  className?: string;
}

const Slider: React.FC<sliderProps> = ({
  orientation = 'horizontal',
  initialValue = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className = '',
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<hTMLInputElement>) => {
    const v = Number(e.target.value);
    onValueChange && onValueChange(v);
  };

  return (
    <input
      type="range"
      className={[
        'slider',
        `slider--${orientation}`,
        className
      ]
        .filter(Boolean)
        .join(' ')}
      defaultValue={String(initialValue)}
      min={String(min)}
      max={String(max)}
      step={String(step)}
      onChange={handleChange}
      {...props}
    />
  );
};

export default Slider;