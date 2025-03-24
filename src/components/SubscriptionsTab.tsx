
import React, { useState } from 'react';
import { Plus, Trash2, Info } from 'lucide-react';
import { useCalculator } from '@/context/CalculatorContext';
import { Currency } from '@/types/calculator';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SubscriptionsTab: React.FC = () => {
  const { state, updateDollarRate, addSubscriptionPlan, removeSubscriptionPlan } = useCalculator();
  
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');
  const [newPlanCurrency, setNewPlanCurrency] = useState<Currency>('BRL');

  const handleAddPlan = () => {
    if (newPlanName && newPlanPrice) {
      addSubscriptionPlan(
        newPlanName, 
        parseFloat(newPlanPrice), 
        newPlanCurrency
      );
      setNewPlanName('');
      setNewPlanPrice('');
    }
  };

  return (
    <div className="bg-app-card border border-app-border rounded-lg p-5 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Planos de Assinatura</h2>
        <p className="text-white/60 text-sm mb-4">Adicione os planos de assinatura do seu SaaS.</p>
        
        <div className="mb-5">
          <label htmlFor="dollarRate" className="flex items-center text-sm font-medium mb-2">
            Taxa do Dólar:
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span><Info size={16} className="ml-1.5 info-icon" /></span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">Taxa de conversão do dólar para o real. Utilizada para calcular custos em dólar.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 bg-black/30 border border-app-border border-r-0 rounded-l-md">R$</span>
            <input
              id="dollarRate"
              type="number"
              value={state.dollarRate}
              onChange={(e) => updateDollarRate(parseFloat(e.target.value) || 0)}
              className="form-input rounded-l-none"
              step="0.01"
              min="0"
            />
          </div>
        </div>
        
        {state.subscriptionPlans.map((plan) => (
          <div key={plan.id} className="cost-item">
            <input
              type="text"
              value={plan.name}
              readOnly
              className="form-input"
            />
            <input
              type="number"
              value={plan.price}
              readOnly
              className="form-input"
            />
            <select
              value={plan.currency}
              disabled
              className="currency-select"
            >
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
            </select>
            <button
              onClick={() => removeSubscriptionPlan(plan.id)}
              className="delete-button"
              aria-label="Remove plan"
            >
              <Trash2 size={18} className="text-white/70" />
            </button>
          </div>
        ))}
        
        <div className="cost-item">
          <input
            type="text"
            value={newPlanName}
            onChange={(e) => setNewPlanName(e.target.value)}
            className="form-input"
            placeholder="Nome do plano"
          />
          <input
            type="number"
            value={newPlanPrice}
            onChange={(e) => setNewPlanPrice(e.target.value)}
            className="form-input"
            placeholder="Preço"
            step="0.01"
            min="0"
          />
          <select
            value={newPlanCurrency}
            onChange={(e) => setNewPlanCurrency(e.target.value as Currency)}
            className="currency-select"
          >
            <option value="BRL">BRL</option>
            <option value="USD">USD</option>
          </select>
          <button
            onClick={() => {}}
            className="opacity-0 pointer-events-none delete-button"
            aria-label="Placeholder button"
          >
            <Trash2 size={18} className="text-white/70" />
          </button>
        </div>
        
        <button
          onClick={handleAddPlan}
          className="add-button"
        >
          <Plus size={18} className="mr-2" /> Adicionar Plano
        </button>
      </div>
    </div>
  );
};

export default SubscriptionsTab;
