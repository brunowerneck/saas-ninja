
import React, { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Currency } from '@/types/calculator';
import { formatNumberInput, parseNumberInput, formatNumberDisplay } from '@/utils/numberUtils';

interface EditableCellProps {
  value: string | number;
  onSave: (value: string | number) => void;
  onCancel: () => void;
  type?: 'text' | 'number' | 'currency';
  min?: number;
  step?: string;
  currencyValue?: Currency;
  onCurrencyChange?: (currency: Currency) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onSave,
  onCancel,
  type = 'text',
  min,
  step = "0.01",
  currencyValue,
  onCurrencyChange
}) => {
  const [editValue, setEditValue] = useState(() => {
    if (type === 'number' || type === 'currency') {
      return formatNumberDisplay(Number(value));
    }
    return value;
  });
  const [currency, setCurrency] = useState<Currency>(currencyValue || 'BRL');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleSave = () => {
    if (onCurrencyChange && currencyValue !== currency) {
      onCurrencyChange(currency);
    }
    
    if (type === 'number' || type === 'currency') {
      onSave(parseNumberInput(String(editValue)));
    } else {
      onSave(editValue);
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value as Currency);
    if (onCurrencyChange) {
      onCurrencyChange(e.target.value as Currency);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (type === 'number' || type === 'currency') {
      setEditValue(formatNumberInput(newValue));
    } else {
      setEditValue(newValue);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {type === 'currency' && (
        <select
          value={currency}
          onChange={handleCurrencyChange}
          className="bg-app-dark border border-white/20 rounded px-1 py-1 text-sm"
        >
          <option value="BRL" className="bg-app-dark text-white">R$</option>
          <option value="USD" className="bg-app-dark text-white">US$</option>
        </select>
      )}
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={handleInputChange}
        className="bg-app-dark border border-white/20 rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-white/30"
        onKeyDown={handleKeyDown}
      />
      <div className="flex space-x-1">
        <button 
          onClick={handleSave}
          className="p-1 rounded bg-green-600/20 hover:bg-green-600/40 transition-colors"
          aria-label="Save"
        >
          <Check size={16} className="text-green-500" />
        </button>
        <button 
          onClick={onCancel}
          className="p-1 rounded bg-red-600/20 hover:bg-red-600/40 transition-colors"
          aria-label="Cancel"
        >
          <X size={16} className="text-red-500" />
        </button>
      </div>
    </div>
  );
};

export default EditableCell;
