
import React from 'react';
import { Info } from 'lucide-react';
import { useCalculator } from '@/context/CalculatorContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PaymentTab: React.FC = () => {
  const { state, updatePaymentGatewayPercentage, updatePaymentGatewayFixed } = useCalculator();

  return (
    <div className="bg-app-card border border-app-border rounded-lg p-5 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Gateway de Pagamento</h2>
        <p className="text-white/60 text-sm mb-4">Configure as taxas do seu gateway de pagamento.</p>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Percentage Fee */}
          <div>
            <label htmlFor="percentageFee" className="flex items-center text-sm font-medium mb-2">
              Taxa Percentual
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span><Info size={16} className="ml-1.5 info-icon" /></span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">Porcentagem cobrada pelo gateway de pagamento sobre cada transação.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <div className="flex">
              <input
                id="percentageFee"
                type="number"
                value={state.paymentGatewayPercentage}
                onChange={(e) => updatePaymentGatewayPercentage(parseFloat(e.target.value) || 0)}
                className="form-input rounded-r-none"
                step="0.01"
                min="0"
              />
              <span className="inline-flex items-center px-3 bg-black/30 border border-app-border border-l-0 rounded-r-md">%</span>
            </div>
          </div>
          
          {/* Fixed Fee */}
          <div>
            <label htmlFor="fixedFee" className="flex items-center text-sm font-medium mb-2">
              Taxa Fixa
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span><Info size={16} className="ml-1.5 info-icon" /></span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">Valor fixo cobrado pelo gateway de pagamento em cada transação.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-black/30 border border-app-border border-r-0 rounded-l-md">R$</span>
              <input
                id="fixedFee"
                type="number"
                value={state.paymentGatewayFixed}
                onChange={(e) => updatePaymentGatewayFixed(parseFloat(e.target.value) || 0)}
                className="form-input rounded-l-none"
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTab;
