
import React from 'react';
import { formatNumberInput, parseNumberInput, formatNumberDisplay } from '@/utils/numberUtils';

interface FormattedNumberInputProps {
  value: string | number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  min?: number;
  step?: string;
}

const FormattedNumberInput: React.FC<FormattedNumberInputProps> = ({
  value,
  onChange,
  className = '',
  placeholder = '',
  min,
  step = "0.01"
}) => {
  const [displayValue, setDisplayValue] = React.useState(() => 
    formatNumberDisplay(Number(value))
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatNumberInput(e.target.value);
    setDisplayValue(formattedValue);
    
    const numericValue = parseNumberInput(formattedValue);
    onChange(numericValue);
  };

  const handleBlur = () => {
    // Reformata o valor quando o campo perde o foco
    const numericValue = parseNumberInput(displayValue);
    setDisplayValue(formatNumberDisplay(numericValue));
  };

  React.useEffect(() => {
    setDisplayValue(formatNumberDisplay(Number(value)));
  }, [value]);

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      placeholder={placeholder}
    />
  );
};

export default FormattedNumberInput;
