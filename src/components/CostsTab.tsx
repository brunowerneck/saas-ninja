
import React, { useState } from 'react';
import { Plus, Trash2, Info } from 'lucide-react';
import { useCalculator } from '@/context/CalculatorContext';
import { Currency } from '@/types/calculator';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const CostsTab: React.FC = () => {
  const {
    state,
    addMonthlyCost,
    removeMonthlyCost,
    addAnnualCost,
    removeAnnualCost,
    addPerUserCost,
    removePerUserCost,
  } = useCalculator();
  
  // Monthly costs state
  const [newMonthlyCostName, setNewMonthlyCostName] = useState('');
  const [newMonthlyCostValue, setNewMonthlyCostValue] = useState('');
  const [newMonthlyCostCurrency, setNewMonthlyCostCurrency] = useState<Currency>('BRL');
  
  // Annual costs state
  const [newAnnualCostName, setNewAnnualCostName] = useState('');
  const [newAnnualCostValue, setNewAnnualCostValue] = useState('');
  const [newAnnualCostCurrency, setNewAnnualCostCurrency] = useState<Currency>('BRL');
  
  // Per user costs state
  const [newPerUserCostName, setNewPerUserCostName] = useState('');
  const [newPerUserCostValue, setNewPerUserCostValue] = useState('');
  const [newPerUserCostCurrency, setNewPerUserCostCurrency] = useState<Currency>('BRL');

  const handleAddMonthlyCost = () => {
    if (newMonthlyCostName && newMonthlyCostValue) {
      addMonthlyCost(
        newMonthlyCostName, 
        parseFloat(newMonthlyCostValue), 
        newMonthlyCostCurrency
      );
      setNewMonthlyCostName('');
      setNewMonthlyCostValue('');
    }
  };

  const handleAddAnnualCost = () => {
    if (newAnnualCostName && newAnnualCostValue) {
      addAnnualCost(
        newAnnualCostName, 
        parseFloat(newAnnualCostValue), 
        newAnnualCostCurrency
      );
      setNewAnnualCostName('');
      setNewAnnualCostValue('');
    }
  };

  const handleAddPerUserCost = () => {
    if (newPerUserCostName && newPerUserCostValue) {
      addPerUserCost(
        newPerUserCostName, 
        parseFloat(newPerUserCostValue), 
        newPerUserCostCurrency
      );
      setNewPerUserCostName('');
      setNewPerUserCostValue('');
    }
  };

  return (
    <div className="bg-app-card border border-app-border rounded-lg p-5 animate-fade-in">
      {/* Monthly Costs */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Custos Mensais Fixos</h2>
        <p className="text-white/60 text-sm mb-4">Adicione todos os custos fixos mensais do seu SaaS.</p>
        
        {state.monthlyCosts.map((cost) => (
          <div key={cost.id} className="cost-item">
            <input
              type="text"
              value={cost.name}
              readOnly
              className="form-input"
            />
            <input
              type="number"
              value={cost.value}
              readOnly
              className="form-input"
            />
            <select
              value={cost.currency}
              disabled
              className="currency-select"
            >
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
            </select>
            <button
              onClick={() => removeMonthlyCost(cost.id)}
              className="delete-button"
              aria-label="Remove cost"
            >
              <Trash2 size={18} className="text-white/70" />
            </button>
          </div>
        ))}
        
        <div className="cost-item">
          <input
            type="text"
            value={newMonthlyCostName}
            onChange={(e) => setNewMonthlyCostName(e.target.value)}
            className="form-input"
            placeholder="Nome do custo"
          />
          <input
            type="number"
            value={newMonthlyCostValue}
            onChange={(e) => setNewMonthlyCostValue(e.target.value)}
            className="form-input"
            placeholder="Valor"
            step="0.01"
            min="0"
          />
          <select
            value={newMonthlyCostCurrency}
            onChange={(e) => setNewMonthlyCostCurrency(e.target.value as Currency)}
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
          onClick={handleAddMonthlyCost}
          className="add-button"
        >
          <Plus size={18} className="mr-2" /> Adicionar Custo Mensal
        </button>
      </div>
      
      {/* Annual Costs */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Custos Anuais Fixos</h2>
        <p className="text-white/60 text-sm mb-4">Adicione todos os custos fixos anuais do seu SaaS.</p>
        
        {state.annualCosts.map((cost) => (
          <div key={cost.id} className="cost-item">
            <input
              type="text"
              value={cost.name}
              readOnly
              className="form-input"
            />
            <input
              type="number"
              value={cost.value}
              readOnly
              className="form-input"
            />
            <select
              value={cost.currency}
              disabled
              className="currency-select"
            >
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
            </select>
            <button
              onClick={() => removeAnnualCost(cost.id)}
              className="delete-button"
              aria-label="Remove cost"
            >
              <Trash2 size={18} className="text-white/70" />
            </button>
          </div>
        ))}
        
        <div className="cost-item">
          <input
            type="text"
            value={newAnnualCostName}
            onChange={(e) => setNewAnnualCostName(e.target.value)}
            className="form-input"
            placeholder="Nome do custo"
          />
          <input
            type="number"
            value={newAnnualCostValue}
            onChange={(e) => setNewAnnualCostValue(e.target.value)}
            className="form-input"
            placeholder="Valor"
            step="0.01"
            min="0"
          />
          <select
            value={newAnnualCostCurrency}
            onChange={(e) => setNewAnnualCostCurrency(e.target.value as Currency)}
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
          onClick={handleAddAnnualCost}
          className="add-button"
        >
          <Plus size={18} className="mr-2" /> Adicionar Custo Anual
        </button>
      </div>
      
      {/* Per User Costs */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Custos Mensais Fixos Por Usuário</h2>
        <p className="text-white/60 text-sm mb-4">
          Adicione custos que são aplicados para cada usuário. Estes custos serão deduzidos da mensalidade.
        </p>
        
        {state.perUserCosts.map((cost) => (
          <div key={cost.id} className="cost-item">
            <input
              type="text"
              value={cost.name}
              readOnly
              className="form-input"
            />
            <input
              type="number"
              value={cost.value}
              readOnly
              className="form-input"
            />
            <select
              value={cost.currency}
              disabled
              className="currency-select"
            >
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
            </select>
            <button
              onClick={() => removePerUserCost(cost.id)}
              className="delete-button"
              aria-label="Remove cost"
            >
              <Trash2 size={18} className="text-white/70" />
            </button>
          </div>
        ))}
        
        <div className="cost-item">
          <input
            type="text"
            value={newPerUserCostName}
            onChange={(e) => setNewPerUserCostName(e.target.value)}
            className="form-input"
            placeholder="Nome do custo"
          />
          <input
            type="number"
            value={newPerUserCostValue}
            onChange={(e) => setNewPerUserCostValue(e.target.value)}
            className="form-input"
            placeholder="Valor"
            step="0.01"
            min="0"
          />
          <select
            value={newPerUserCostCurrency}
            onChange={(e) => setNewPerUserCostCurrency(e.target.value as Currency)}
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
          onClick={handleAddPerUserCost}
          className="add-button"
        >
          <Plus size={18} className="mr-2" /> Adicionar Custo Por Usuário
        </button>
      </div>
    </div>
  );
};

export default CostsTab;
