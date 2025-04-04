
import React, { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Currency } from '@/types/calculator';

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
  const [editValue, setEditValue] = useState(value);
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
    onSave(editValue);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value as Currency);
    if (onCurrencyChange) {
      onCurrencyChange(e.target.value as Currency);
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
        type={type === 'text' ? 'text' : 'number'}
        value={editValue}
        onChange={(e) => setEditValue(type === 'number' || type === 'currency' ? parseFloat(e.target.value) : e.target.value)}
        className="bg-app-dark border border-white/20 rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-white/30"
        min={min}
        step={step}
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
