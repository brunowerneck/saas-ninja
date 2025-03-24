
import React from 'react';
import { Info } from 'lucide-react';
import { useCalculator } from '@/context/CalculatorContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const TaxesTab: React.FC = () => {
  const { state, updateTaxRate } = useCalculator();

  return (
    <div className="bg-app-card border border-app-border rounded-lg p-5 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Tributos</h2>
        <p className="text-white/60 text-sm mb-4">Configure a taxa de tributos mensais.</p>
        
        <div className="max-w-md">
          <label htmlFor="taxRate" className="flex items-center text-sm font-medium mb-2">
            Taxa de Tributos
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span><Info size={16} className="ml-1.5 info-icon" /></span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">Porcentagem de tributos mensais sobre a receita (ex: Simples Nacional, ISS, PIS, COFINS).</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </label>
          <div className="flex">
            <input
              id="taxRate"
              type="number"
              value={state.taxRate}
              onChange={(e) => updateTaxRate(parseFloat(e.target.value) || 0)}
              className="form-input rounded-r-none"
              step="0.01"
              min="0"
            />
            <span className="inline-flex items-center px-3 bg-black/30 border border-app-border border-l-0 rounded-r-md">%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxesTab;
