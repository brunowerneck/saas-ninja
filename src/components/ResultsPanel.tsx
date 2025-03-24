
import React from 'react';
import { useCalculator } from '@/context/CalculatorContext';
import { formatCurrency } from '@/utils/formatCurrency';

const ResultsPanel: React.FC = () => {
  const { results } = useCalculator();
  
  return (
    <div className="bg-app-card border border-app-border rounded-lg overflow-hidden h-full animate-fade-in">
      <div className="p-5">
        <h2 className="text-xl font-semibold mb-1">Resultados</h2>
        <p className="text-white/60 text-sm mb-5">Análise de viabilidade do seu SaaS</p>
        
        {/* Break Even Point */}
        <div className="result-card">
          <h3 className="text-lg font-medium mb-3">Ponto de Equilíbrio</h3>
          <div className="flex justify-between items-center">
            <span className="text-white/80">Assinantes necessários:</span>
            <span className="text-3xl font-bold">
              {results.breakEvenUsers === Infinity ? '∞' : results.breakEvenUsers}
            </span>
          </div>
        </div>
        
        {/* Working Capital */}
        <div className="result-card">
          <h3 className="text-lg font-medium mb-3">Capital de Giro</h3>
          <div className="flex justify-between items-center">
            <span className="text-white/80">Necessário (3 meses):</span>
            <span className="text-xl font-semibold">
              {formatCurrency(results.workingCapital)}
            </span>
          </div>
        </div>
        
        {/* Break Even Financials */}
        <div className="result-card">
          <h3 className="text-lg font-medium mb-3">No Ponto de Equilíbrio:</h3>
          
          <div className="mb-2 flex justify-between items-center">
            <span className="text-white/80">Receita Mensal:</span>
            <span className="text-white font-medium">
              {formatCurrency(results.monthlyRevenue)}
            </span>
          </div>
          
          <div className="mb-2 flex justify-between items-center">
            <span className="text-white/80">Custos Mensais:</span>
            <span className="text-white font-medium">
              {formatCurrency(results.monthlyCosts)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white/80">Lucro Mensal:</span>
            <span className={`font-medium ${results.monthlyProfit >= 0 ? 'text-success' : 'text-red-500'}`}>
              {formatCurrency(results.monthlyProfit)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;
