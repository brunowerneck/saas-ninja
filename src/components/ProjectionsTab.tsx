
import React, { useMemo, useState } from 'react';
import { useCalculator } from '@/context/CalculatorContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { ProjectionPoint } from '@/types/calculator';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { Input } from '@/components/ui/input';

const ProjectionsTab: React.FC = () => {
  const { state, results } = useCalculator();
  const [projectionSize, setProjectionSize] = useState<number>(10);
  
  const projectionPoints = useMemo(() => {
    if (results.breakEvenUsers === Infinity) {
      return [];
    }

    const points: ProjectionPoint[] = [];
    const breakEven = results.breakEvenUsers;
    const step = Math.max(1, Math.ceil(breakEven / 1));
    
    // Calculate projection points
    for (let i = 0; i < projectionSize; i++) {
      const users = i === 0 ? 0 : breakEven + (i - 1) * step;
      
      // Calculate revenue
      const avgRevenuePerUser = state.subscriptionPlans.reduce(
        (sum, plan) => sum + (plan.currency === 'USD' ? plan.price * state.dollarRate : plan.price),
        0
      ) / Math.max(1, state.subscriptionPlans.length);
      
      const monthlyRevenue = users * avgRevenuePerUser;
      
      // Calculate costs
      const fixedMonthlyCosts = state.monthlyCosts.reduce(
        (sum, cost) => sum + (cost.currency === 'USD' ? cost.value * state.dollarRate : cost.value),
        0
      );
      
      const monthlyAnnualCosts = state.annualCosts.reduce(
        (sum, cost) => sum + (cost.currency === 'USD' ? cost.value * state.dollarRate : cost.value) / 12,
        0
      );
      
      const variableCosts = state.perUserCosts.reduce(
        (sum, cost) => sum + (cost.currency === 'USD' ? cost.value * state.dollarRate : cost.value) * users,
        0
      );
      
      const totalCosts = fixedMonthlyCosts + monthlyAnnualCosts + variableCosts;
      
      // Calculate profit
      const grossRevenue = monthlyRevenue;
      const afterGatewayPercentage = grossRevenue * (1 - state.paymentGatewayPercentage / 100);
      const afterGatewayFixed = users === 0 ? 0 : afterGatewayPercentage - (state.paymentGatewayFixed * users);
      const netRevenue = afterGatewayFixed * (1 - state.taxRate / 100);
      const profit = netRevenue - totalCosts;
      
      points.push({
        users,
        revenue: monthlyRevenue,
        costs: totalCosts,
        profit
      });
    }
    
    return points;
  }, [state, results, projectionSize]);

  const chartConfig = {
    revenue: {
      label: 'Receita',
      theme: {
        light: '#4ade80',
        dark: '#4ade80'
      }
    },
    costs: {
      label: 'Custos',
      theme: {
        light: '#f87171',
        dark: '#f87171'
      }
    },
    profit: {
      label: 'Lucro',
      theme: {
        light: '#60a5fa',
        dark: '#60a5fa'
      }
    }
  };

  return (
    <div className="bg-app-card border border-app-border rounded-lg p-5 animate-fade-in">
      <h2 className="text-xl font-semibold mb-1">Projeções Financeiras</h2>
      <p className="text-white/60 text-sm mb-5">
        Visualize receitas, custos e lucros com base no número de assinantes
      </p>
      
      <div className="mb-6">
        <label htmlFor="projectionSize" className="block text-sm font-medium mb-2">
          Número de pontos de projeção
        </label>
        <Input 
          id="projectionSize"
          type="number"
          min="2"
          max="20"
          value={projectionSize}
          onChange={(e) => setProjectionSize(Math.max(2, Math.min(20, Number(e.target.value))))}
          className="w-full max-w-xs text-slate-900 bg-app-card"
        />
      </div>
      
      {projectionPoints.length > 0 ? (
        <div className="mt-6">
          <ChartContainer 
            config={chartConfig} 
            className="h-80 w-full mt-4"
          >
            <LineChart data={projectionPoints} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="users" 
                label={{ value: 'Assinantes', position: 'insideBottom', offset: -15 }} 
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value, 'BRL').split(' ')[1]}
                label={{ value: 'Valor (BRL)', angle: -90, position: 'insideLeft' }}
              />
              <ChartTooltip 
                content={({active, payload}) => (
                  <ChartTooltipContent 
                    active={active}
                    payload={payload}
                    formatter={(value, name) => {
                      if (name === 'revenue') return ['Receita', formatCurrency(value as number)];
                      if (name === 'costs') return ['Custos', formatCurrency(value as number)];
                      if (name === 'profit') return ['Lucro', formatCurrency(value as number)];
                      return [name, value];
                    }}
                    labelFormatter={(label) => `${label} assinantes`}
                  />
                )}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name="Receita" 
                stroke="var(--color-revenue)" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="costs" 
                name="Custos" 
                stroke="var(--color-costs)" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                name="Lucro" 
                stroke="var(--color-profit)" 
                activeDot={{ r: 8 }} 
              />
              <Legend />
            </LineChart>
          </ChartContainer>
        </div>
      ) : (
        <div className="bg-orange-500/20 text-orange-200 p-4 rounded-md mb-4">
          <p className="font-medium">Não é possível calcular o ponto de equilíbrio com os valores atuais.</p>
          <p className="text-sm mt-1">Verifique se você tem planos de assinatura e se suas receitas cobrem os custos variáveis por usuário.</p>
        </div>
      )}
      
      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-medium">Tabela de Projeções</h3>
        <div className="rounded-md border overflow-hidden">
          <table className="min-w-full divide-y divide-app-border">
            <thead className="bg-app-card">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold">Assinantes</th>
                <th className="py-3 px-4 text-left text-sm font-semibold">Receita</th>
                <th className="py-3 px-4 text-left text-sm font-semibold">Custos</th>
                <th className="py-3 px-4 text-left text-sm font-semibold">Lucro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {projectionPoints.map((point, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-app-dark' : 'bg-app-card'}>
                  <td className="py-2 px-4 text-sm">{point.users}</td>
                  <td className="py-2 px-4 text-sm">{formatCurrency(point.revenue)}</td>
                  <td className="py-2 px-4 text-sm">{formatCurrency(point.costs)}</td>
                  <td className={`py-2 px-4 text-sm ${point.profit >= 0 ? 'text-success' : 'text-red-500'}`}>
                    {formatCurrency(point.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectionsTab;
