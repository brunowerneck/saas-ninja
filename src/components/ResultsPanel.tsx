
import React from "react";
import { useCalculator } from "@/context/CalculatorContext";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Percent, Clock, TrendingUp } from "lucide-react";

const ResultsPanel: React.FC = () => {
  const { results, state } = useCalculator();
  
  // Calculate the weighted distribution
  const totalWeight = state.subscriptionPlans.reduce(
    (sum, plan) => sum + (plan.weight || 1),
    0
  );
  
  // Get rating for LTV:CAC ratio
  const getLTVCACRating = (ratio: number): { label: string; color: string } => {
    if (ratio < 1) return { label: "Insustentável", color: "text-red-500" };
    if (ratio < 3) return { label: "Preocupante", color: "text-orange-400" };
    if (ratio < 5) return { label: "Bom", color: "text-yellow-400" };
    return { label: "Excelente", color: "text-green-400" };
  };

  // Get rating for payback period
  const getPaybackRating = (months: number): { label: string; color: string } => {
    if (months === Infinity) return { label: "Nunca", color: "text-red-500" };
    if (months > 18) return { label: "Ruim", color: "text-red-500" };
    if (months > 12) return { label: "Preocupante", color: "text-orange-400" };
    if (months > 6) return { label: "Bom", color: "text-yellow-400" };
    return { label: "Excelente", color: "text-green-400" };
  };

  return (
    <div className="bg-app-card border border-app-border rounded-lg overflow-hidden h-full animate-fade-in">
      <div className="p-5">
        <h2 className="text-xl font-semibold mb-1">Resultados</h2>
        <p className="text-white/60 text-sm mb-5">
          Análise de viabilidade do seu SaaS
        </p>

        {/* Break Even Point */}
        <div className="result-card">
          <h3 className="text-lg font-medium mb-3">Ponto de Equilíbrio</h3>
          <div className="flex justify-between items-center">
            <span className="text-white/80">Assinantes necessários:</span>
            <span className="text-3xl font-bold">
              {results.breakEvenUsers === Infinity
                ? "∞"
                : results.breakEvenUsers}
            </span>
          </div>
        </div>

        {/* Distribution info */}
        {state.subscriptionPlans.length > 0 && (
          <div className="result-card">
            <h3 className="text-lg font-medium mb-3">Distribuição de Planos</h3>
            {state.subscriptionPlans.map(plan => (
              <div key={plan.id} className="flex justify-between items-center mb-2 last:mb-0">
                <span className="text-white/80">{plan.name}:</span>
                <span className="text-white font-medium">
                  {totalWeight > 0 ? 
                    `${Math.round(((plan.weight || 1) / totalWeight) * 100)}%` : 
                    '0%'}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {/* Customer metrics */}
        <div className="result-card">
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Métricas de Clientes</span>
          </h3>
          
          <div className="mb-2 flex justify-between items-center">
            <span className="text-white/80">Valor do Cliente (LTV):</span>
            <span className="text-white font-medium">
              {formatCurrency(results.customerLifetimeValue)}
            </span>
          </div>
          
          <div className="mb-2 flex justify-between items-center">
            <span className="text-white/80">Custo de Aquisição (CAC):</span>
            <span className="text-white font-medium">
              {formatCurrency(state.acquisitionCostPerUser)}
            </span>
          </div>
          
          <div className="mb-2 flex justify-between items-center">
            <span className="text-white/80">LTV:CAC:</span>
            <span className={`font-medium ${getLTVCACRating(results.ltv2CacRatio).color}`}>
              {results.ltv2CacRatio === Infinity ? "∞" : `${results.ltv2CacRatio.toFixed(1)}x`}
              <Badge variant="outline" className={`ml-2 ${getLTVCACRating(results.ltv2CacRatio).color} border-current bg-transparent`}>
                {getLTVCACRating(results.ltv2CacRatio).label}
              </Badge>
            </span>
          </div>
          
          <div className="mb-2 flex justify-between items-center">
            <span className="text-white/80">Período de Recuperação:</span>
            <span className={`font-medium ${getPaybackRating(results.paybackPeriodMonths).color}`}>
              {results.paybackPeriodMonths === Infinity ? 
                "∞" : 
                `${results.paybackPeriodMonths.toFixed(1)} meses`}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white/80">Tempo até Churn:</span>
            <span className="text-white font-medium">
              {state.monthlyChurnRate > 0 
                ? `${(1 / (state.monthlyChurnRate / 100)).toFixed(1)} meses` 
                : "∞"}
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

          <div className="mb-2 flex justify-between items-center">
            <span className="text-white/80">Tributos Mensais:</span>
            <span className="text-white font-medium">
              {formatCurrency(results.monthlyTaxes)}
            </span>
          </div>

          <div className="mb-2 flex justify-between items-center">
            <span className="text-white/80">Gateway Mensal:</span>
            <span className="text-white font-medium">
              {formatCurrency(results.monthlyGateway)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/80">Lucro Mensal:</span>
            <span
              className={`font-medium ${
                results.monthlyProfit >= 0 ? "text-success" : "text-red-500"
              }`}
            >
              {formatCurrency(results.monthlyProfit)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;
