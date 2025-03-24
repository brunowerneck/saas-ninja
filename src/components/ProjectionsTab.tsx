
import React, { useMemo, useState } from 'react';
import { useCalculator } from '@/context/CalculatorContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { ProjectionPoint } from '@/types/calculator';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp } from 'lucide-react';

const ProjectionsTab: React.FC = () => {
  const { state, results } = useCalculator();
  const [growthRate, setGrowthRate] = useState<number>(15);
  const [initialUsers, setInitialUsers] = useState<number>(10);
  
  const projections = useMemo(() => {
    if (results.breakEvenUsers === Infinity) {
      return {
        monthsToBreakEven: Infinity,
        projectionPoints: [],
        milestonePoints: []
      };
    }

    const breakEvenUsers = results.breakEvenUsers;
    const points: ProjectionPoint[] = [];
    const milestones = [100, 500, 1000, 5000, 10_000, 100_000];
    const milestonePoints: ProjectionPoint[] = [];
    
    // Calculate how many months to reach break-even
    let monthsToBreakEven = 0;
    let currentUsers = initialUsers;
    
    while (currentUsers < breakEvenUsers && monthsToBreakEven < 120) { // Max 10 years
      monthsToBreakEven++;
      currentUsers += currentUsers * (growthRate / 100);
    }
    
    // Generate projection points for 24 months
    currentUsers = initialUsers;
    for (let month = 0; month <= 24; month++) {
      const point = calculateProjectionPoint(currentUsers);
      points.push({
        ...point,
        month
      });
      
      if (month < 24) {
        currentUsers += currentUsers * (growthRate / 100);
      }
    }
    
    // Generate milestone projections
    milestones.forEach(userCount => {
      const point = calculateProjectionPoint(userCount);
      milestonePoints.push({
        ...point,
        users: userCount
      });
    });
    
    return {
      monthsToBreakEven: monthsToBreakEven === 120 ? Infinity : monthsToBreakEven,
      projectionPoints: points,
      milestonePoints
    };
  }, [state, results, growthRate, initialUsers]);
  
  // Helper function to calculate financial metrics for a given number of users
  function calculateProjectionPoint(users: number): ProjectionPoint {
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
    
    return {
      users,
      revenue: monthlyRevenue,
      costs: totalCosts,
      profit
    };
  }

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

  // Custom tooltip content component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="text-white font-medium mb-1">{`Mês ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
          <p className="text-gray-300 text-sm mt-1">{`Assinantes: ${Math.round(payload[0]?.payload?.users || 0)}`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom milestone tooltip component
  const MilestoneTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="text-white font-medium mb-1">{`${payload[0]?.payload?.users} assinantes`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-app-card border border-app-border rounded-lg p-5 animate-fade-in">
      <h2 className="text-xl font-semibold mb-1">Projeções Financeiras</h2>
      <p className="text-white/60 text-sm mb-5">
        Visualize receitas, custos e lucros com base no crescimento da base de assinantes
      </p>
      
      {projections.projectionPoints.length > 0 ? (
        <>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 mb-8">
            <div>
              <div className="mb-4">
                <Label htmlFor="initialUsers" className="block text-sm font-medium mb-2">
                  Assinantes iniciais
                </Label>
                <Input 
                  id="initialUsers"
                  type="number"
                  min="1"
                  max="1000"
                  value={initialUsers}
                  onChange={(e) => setInitialUsers(Math.max(1, Math.min(1000, Number(e.target.value))))}
                  className="max-w-xs text-white bg-app-card"
                />
              </div>
              
              <div className="mb-4">
                <Label htmlFor="growthRate" className="block text-sm font-medium mb-2">
                  Taxa de crescimento mensal (%)
                </Label>
                <Input 
                  id="growthRate"
                  type="number"
                  min="0"
                  max="100"
                  value={growthRate}
                  onChange={(e) => setGrowthRate(Math.max(0, Math.min(100, Number(e.target.value))))}
                  className="max-w-xs text-white bg-app-card"
                />
              </div>
            </div>
            
            <div className="bg-app-dark rounded-lg p-4 border border-app-border">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <span>Tempo até o ponto de equilíbrio</span>
              </h3>
              
              {projections.monthsToBreakEven === Infinity ? (
                <div className="text-orange-400">
                  Com essa taxa de crescimento, o ponto de equilíbrio não será atingido em tempo razoável.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Meses necessários:</span>
                    <span className="text-2xl font-bold">{Math.ceil(projections.monthsToBreakEven)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Assinantes no ponto de equilíbrio:</span>
                    <span className="text-lg font-semibold">{Math.ceil(results.breakEvenUsers)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Projeção para 24 meses</h3>
            <ChartContainer 
              config={chartConfig} 
              className="h-80 w-full mt-4"
            >
              <LineChart data={projections.projectionPoints} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  label={{ value: 'Meses', position: 'insideBottom', offset: -15 }} 
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value, 'BRL').split(' ')[0]}
                  label={{ value: 'Valor (BRL)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
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
          
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Projeções por marco de assinantes</h3>
            <ChartContainer 
              config={chartConfig} 
              className="h-80 w-full mt-4"
            >
              <LineChart data={projections.milestonePoints} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="users" 
                  label={{ value: 'Assinantes', position: 'insideBottom', offset: -30 }} 
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value, 'BRL').split(' ')[0]}
                  label={{ value: 'Valor (BRL)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<MilestoneTooltip />} />
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
          
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-medium">Tabela de Marcos</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assinantes</TableHead>
                  <TableHead>Receita Mensal</TableHead>
                  <TableHead>Custos Mensais</TableHead>
                  <TableHead>Lucro Mensal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projections.milestonePoints.map((point, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{point.users}</TableCell>
                    <TableCell>{formatCurrency(point.revenue)}</TableCell>
                    <TableCell>{formatCurrency(point.costs)}</TableCell>
                    <TableCell className={point.profit >= 0 ? 'text-success' : 'text-red-500'}>
                      {formatCurrency(point.profit)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <div className="bg-orange-500/20 text-orange-200 p-4 rounded-md mb-4">
          <p className="font-medium">Não é possível calcular o ponto de equilíbrio com os valores atuais.</p>
          <p className="text-sm mt-1">Verifique se você tem planos de assinatura e se suas receitas cobrem os custos variáveis por usuário.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectionsTab;
