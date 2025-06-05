import React, { useMemo, useState } from "react";
import { useCalculator } from "@/context/CalculatorContext";
import { formatCurrency } from "@/lib/utils";
import { ProjectionPoint, UnitEconomics } from "@/types/calculator";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  AlertCircle,
  Users,
  DollarSign,
  Percent,
  Clock,
  BarChart3,
  UserMinus,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FormattedNumberInput from "@/components/FormattedNumberInput";

const ProjectionsTab: React.FC = () => {
  const {
    state,
    results,
    updateMonthlyChurnRate,
    updateAcquisitionCostPerUser,
  } = useCalculator();
  const [growthRate, setGrowthRate] = useState<number>(50);
  const [initialUsers, setInitialUsers] = useState<number>(2);
  const [projectionTab, setProjectionTab] = useState<string>("time");
  const [fortyPercentUsers, setFortyPercentUsers] = useState<number>(1000);
  const [macroUsers, setMacroUsers] = useState<number>(1000);

  // Unit economics calculation
  const unitEconomics: UnitEconomics = useMemo(() => {
    const avgRevenuePerUser = calculateAverageRevenuePerUser();
    const grossMargin = calculateGrossMarginPercentage();

    return {
      arpu: avgRevenuePerUser,
      cac: state.acquisitionCostPerUser,
      ltv: results.customerLifetimeValue,
      paybackPeriod: results.paybackPeriodMonths,
      grossMargin: grossMargin,
      ltv2CacRatio: results.ltv2CacRatio,
    };
  }, [state, results]);

  function calculateAverageRevenuePerUser(): number {
    if (state.subscriptionPlans.length === 0) return 0;

    const totalWeight = state.subscriptionPlans.reduce(
      (sum, plan) => sum + (plan.weight || 1),
      0
    );

    if (totalWeight === 0) return 0;

    const weightedTotalRevenue = state.subscriptionPlans.reduce(
      (sum, plan) =>
        sum + normalizeAmount(plan.price, plan.currency) * (plan.weight || 1),
      0
    );

    return weightedTotalRevenue / totalWeight;
  }

  function normalizeAmount(amount: number, currency: string): number {
    return currency === "USD" ? amount * state.dollarRate : amount;
  }

  function calculateGrossMarginPercentage(): number {
    const avgRevenuePerUser = calculateAverageRevenuePerUser();
    if (avgRevenuePerUser === 0) return 0;

    const perUserVariableCosts = state.perUserCosts.reduce(
      (sum, cost) => sum + normalizeAmount(cost.value, cost.currency),
      0
    );

    const grossProfit = avgRevenuePerUser - perUserVariableCosts;
    return (grossProfit / avgRevenuePerUser) * 100;
  }

  const projections = useMemo(() => {
    if (results.breakEvenUsers === Infinity) {
      return {
        monthsToBreakEven: Infinity,
        projectionPoints: [],
        milestonePoints: [],
        cohortRetention: [],
      };
    }

    const breakEvenUsers = results.breakEvenUsers;
    const points: ProjectionPoint[] = [];
    const milestones = [
      100, 200, 300, 400, 500, 1000, 5000, 10_000, 50_000, 100_000,
    ];
    const milestonePoints: ProjectionPoint[] = [];

    // Calculate how many months to reach break-even
    let monthsToBreakEven = 0;
    let currentUsers = initialUsers;

    while (currentUsers < breakEvenUsers && monthsToBreakEven < 120) {
      // Max 10 years
      monthsToBreakEven++;
      const newUsers = Math.floor(currentUsers * (growthRate / 100));
      const churnedUsers = Math.floor(
        currentUsers * (state.monthlyChurnRate / 100)
      );
      currentUsers += newUsers - churnedUsers;
    }

    // Generate projection points for 36 months with churn
    currentUsers = initialUsers;
    const cohortRetention = [];

    for (let month = 0; month <= 36; month++) {
      // Calculate users retention and churn
      const churnRateDecimal = state.monthlyChurnRate / 100;
      const growthRateDecimal = growthRate / 100;

      let newUsers = 0;
      let churnedUsers = 0;
      let retainedUsers = currentUsers;

      if (month > 0) {
        newUsers = Math.floor(points[month - 1].users * growthRateDecimal);
        churnedUsers = Math.floor(points[month - 1].users * churnRateDecimal);
        retainedUsers = points[month - 1].users + newUsers - churnedUsers;
      }

      const point = calculateProjectionPoint(Math.max(0, retainedUsers));
      points.push({
        ...point,
        month,
        churnedUsers: month === 0 ? 0 : churnedUsers,
        newUsers: month === 0 ? initialUsers : newUsers,
        retainedUsers,
        cumulativeChurnRate:
          month === 0
            ? 0
            : (points.reduce((sum, p) => sum + (p.churnedUsers || 0), 0) /
                (initialUsers +
                  points.reduce((sum, p) => sum + (p.newUsers || 0), 0) -
                  initialUsers)) *
              100,
      });

      // For cohort retention analysis (starting cohort of 100)
      if (month < 13) {
        // Track first 12 months
        const cohortSize = 100;
        const retainedAfterMonths =
          cohortSize * Math.pow(1 - churnRateDecimal, month);
        cohortRetention.push({
          month,
          retainedUsers: Math.round(retainedAfterMonths),
          retentionRate: Math.round(retainedAfterMonths),
        });
      }
    }

    // Generate milestone projections
    milestones.forEach((userCount) => {
      const point = calculateProjectionPoint(userCount);
      milestonePoints.push({
        ...point,
        users: userCount,
      });
    });

    return {
      monthsToBreakEven:
        monthsToBreakEven === 120 ? Infinity : monthsToBreakEven,
      projectionPoints: points,
      milestonePoints,
      cohortRetention,
    };
  }, [state, results, growthRate, initialUsers]);

  // Helper function to calculate financial metrics for a given number of users
  function calculateProjectionPoint(users: number): ProjectionPoint {
    // Calculate revenue
    const avgRevenuePerUser = calculateAverageRevenuePerUser();

    const monthlyRevenue = users * avgRevenuePerUser;

    // Calculate costs
    const fixedMonthlyCosts = state.monthlyCosts.reduce(
      (sum, cost) => sum + normalizeAmount(cost.value, cost.currency),
      0
    );

    const monthlyAnnualCosts = state.annualCosts.reduce(
      (sum, cost) => sum + normalizeAmount(cost.value, cost.currency) / 12,
      0
    );

    const variableCosts = state.perUserCosts.reduce(
      (sum, cost) => sum + normalizeAmount(cost.value, cost.currency) * users,
      0
    );

    const totalCosts = fixedMonthlyCosts + monthlyAnnualCosts + variableCosts;

    // Calculate profit
    const grossRevenue = monthlyRevenue;
    const afterGatewayPercentage =
      grossRevenue * (1 - state.paymentGatewayPercentage / 100);
    const afterGatewayFixed =
      users === 0
        ? 0
        : afterGatewayPercentage - state.paymentGatewayFixed * users;
    const netRevenue = afterGatewayFixed * (1 - state.taxRate / 100);
    const profit = netRevenue - totalCosts;

    return {
      users,
      revenue: monthlyRevenue,
      costs: totalCosts,
      profit,
    };
  }

  // Calculate the 40% rule analysis for specific user count
  const fortyPercentRuleAnalysis = useMemo(() => {
    const point = calculateProjectionPoint(fortyPercentUsers);
    const annualRevenue = point.revenue * 12;
    const costPercentage = point.revenue > 0 ? (point.costs / point.revenue) * 100 : 0;
    const isCompliant = costPercentage <= 40;

    return {
      users: fortyPercentUsers,
      annualRevenue,
      costPercentage,
      isCompliant,
    };
  }, [fortyPercentUsers, state, results]);

  // Calculate macro analysis for specific user count
  const macroAnalysis = useMemo(() => {
    return calculateProjectionPoint(macroUsers);
  }, [macroUsers, state, results]);

  const chartConfig = {
    revenue: {
      label: "Receita",
      theme: {
        light: "#4ade80",
        dark: "#4ade80",
      },
    },
    costs: {
      label: "Custos",
      theme: {
        light: "#f87171",
        dark: "#f87171",
      },
    },
    profit: {
      label: "Lucro",
      theme: {
        light: "#60a5fa",
        dark: "#60a5fa",
      },
    },
    users: {
      label: "Usuários",
      theme: {
        light: "#c084fc",
        dark: "#c084fc",
      },
    },
    newUsers: {
      label: "Novos Usuários",
      theme: {
        light: "#34d399",
        dark: "#34d399",
      },
    },
    churnedUsers: {
      label: "Usuários Cancelados",
      theme: {
        light: "#fb7185",
        dark: "#fb7185",
      },
    },
    retainedUsers: {
      label: "Usuários Retidos",
      theme: {
        light: "#60a5fa",
        dark: "#60a5fa",
      },
    },
    retentionRate: {
      label: "Taxa de Retenção",
      theme: {
        light: "#60a5fa",
        dark: "#60a5fa",
      },
    },
  };

  // Custom tooltip content component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="text-white font-medium mb-1">{`Mês ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={`item-${index}`}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {`${entry.name}: ${
                entry.dataKey === "users" ||
                entry.dataKey === "newUsers" ||
                entry.dataKey === "churnedUsers" ||
                entry.dataKey === "retainedUsers"
                  ? Math.round(entry.value)
                  : formatCurrency(entry.value)
              }`}
            </p>
          ))}
          {payload[0]?.payload?.cumulativeChurnRate !== undefined && (
            <p className="text-gray-300 text-sm mt-1">
              {`Taxa de Churn Acumulada: ${payload[0].payload.cumulativeChurnRate.toFixed(
                1
              )}%`}
            </p>
          )}
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
            <p
              key={`item-${index}`}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Retention chart tooltip
  const RetentionTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="text-white font-medium mb-1">{`Mês ${payload[0]?.payload?.month}`}</p>
          <p className="text-sm" style={{ color: "#60a5fa" }}>
            {`Usuários retidos: ${payload[0]?.payload?.retainedUsers}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleChurnRateChange = (value: number[]) => {
    updateMonthlyChurnRate(value[0]);
  };

  const handleAcquisitionCostChange = (value: number[]) => {
    updateAcquisitionCostPerUser(value[0]);
  };

  // Get rating for LTV:CAC ratio
  const getLTVCACRating = (ratio: number): { label: string; color: string } => {
    if (ratio < 1) return { label: "Insustentável", color: "text-red-500" };
    if (ratio < 3) return { label: "Preocupante", color: "text-orange-400" };
    if (ratio < 5) return { label: "Bom", color: "text-yellow-400" };
    return { label: "Excelente", color: "text-green-400" };
  };

  // Get rating for payback period
  const getPaybackRating = (
    months: number
  ): { label: string; color: string } => {
    if (months === Infinity) return { label: "Nunca", color: "text-red-500" };
    if (months > 18) return { label: "Ruim", color: "text-red-500" };
    if (months > 12) return { label: "Preocupante", color: "text-orange-400" };
    if (months > 6) return { label: "Bom", color: "text-yellow-400" };
    return { label: "Excelente", color: "text-green-400" };
  };

  return (
    <div className="bg-app-card border border-app-border rounded-lg p-5 animate-fade-in space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Projeções Financeiras</h2>
        <p className="text-white/60 text-sm mb-5">
          Visualize receitas, custos, lucros e métricas de negócio com base no
          crescimento e churn
        </p>
      </div>

      {projections.projectionPoints.length > 0 ? (
        <>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 mb-8">
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="initialUsers"
                  className="block text-sm font-medium mb-2"
                >
                  Assinantes iniciais
                </Label>
                <Input
                  id="initialUsers"
                  type="number"
                  min="1"
                  max="1000"
                  value={initialUsers}
                  onChange={(e) =>
                    setInitialUsers(
                      Math.max(1, Math.min(1000, Number(e.target.value)))
                    )
                  }
                  className="max-w-xs text-white bg-app-card"
                />
              </div>

              <div>
                <Label
                  htmlFor="growthRate"
                  className="block text-sm font-medium mb-2"
                >
                  Taxa de crescimento mensal (%)
                </Label>
                <Input
                  id="growthRate"
                  type="number"
                  min="0"
                  max="100"
                  value={growthRate}
                  onChange={(e) =>
                    setGrowthRate(
                      Math.max(0, Math.min(100, Number(e.target.value)))
                    )
                  }
                  className="max-w-xs text-white bg-app-card"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">
                  Taxa de cancelamento mensal (%)
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[state.monthlyChurnRate]}
                    min={0}
                    max={30}
                    step={0.1}
                    onValueChange={handleChurnRateChange}
                    className="max-w-xs"
                  />
                  <span className="min-w-[3rem] text-center">
                    {state.monthlyChurnRate.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">
                  Custo de aquisição por cliente (CAC)
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[state.acquisitionCostPerUser]}
                    min={0}
                    max={500}
                    step={5}
                    onValueChange={handleAcquisitionCostChange}
                    className="max-w-xs"
                  />
                  <span className="min-w-[5rem] text-center">
                    {formatCurrency(state.acquisitionCostPerUser)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-app-dark rounded-lg p-4 border border-app-border">
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  <span>Tempo até o ponto de equilíbrio</span>
                </h3>

                {projections.monthsToBreakEven === Infinity ? (
                  <div className="text-orange-400">
                    Com essa taxa de crescimento e churn, o ponto de equilíbrio
                    não será atingido em tempo razoável.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Meses necessários:</span>
                      <span className="text-2xl font-bold">
                        {Math.ceil(projections.monthsToBreakEven)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">
                        Assinantes no ponto de equilíbrio:
                      </span>
                      <span className="text-lg font-semibold">
                        {Math.ceil(results.breakEvenUsers)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-app-dark rounded-lg p-4 border border-app-border">
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-400" />
                  <span>Vida útil do cliente (LTV)</span>
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Tempo médio:</span>
                      <span className="text-lg font-medium">
                        {state.monthlyChurnRate > 0
                          ? `${(1 / (state.monthlyChurnRate / 100)).toFixed(
                              1
                            )} meses`
                          : "∞"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">LTV:</span>
                      <span className="text-lg font-medium">
                        {formatCurrency(results.customerLifetimeValue)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">CAC:</span>
                      <span className="text-lg font-medium">
                        {formatCurrency(state.acquisitionCostPerUser)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Payback:</span>
                      <span
                        className={`text-lg font-medium ${
                          getPaybackRating(results.paybackPeriodMonths).color
                        }`}
                      >
                        {results.paybackPeriodMonths === Infinity
                          ? "∞"
                          : `${results.paybackPeriodMonths.toFixed(1)} meses`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">
              Métricas de Saúde do Negócio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-app-dark border-app-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span className="text-white">LTV:CAC</span>
                    <Badge
                      className={`${
                        getLTVCACRating(results.ltv2CacRatio).color
                      } bg-transparent`}
                    >
                      {getLTVCACRating(results.ltv2CacRatio).label}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Valor do cliente vs. custo de aquisição
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-white font-bold">
                    {results.ltv2CacRatio === Infinity
                      ? "∞"
                      : results.ltv2CacRatio.toFixed(1)}
                    x
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    Ideal: &gt; 3x, Ótimo: &gt; 5x
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-app-dark border-app-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span className="text-white">Payback Period</span>
                    <Badge
                      className={`${
                        getPaybackRating(results.paybackPeriodMonths).color
                      } bg-transparent`}
                    >
                      {getPaybackRating(results.paybackPeriodMonths).label}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Tempo para recuperar custo de aquisição
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-white font-bold">
                    {results.paybackPeriodMonths === Infinity
                      ? "∞"
                      : `${results.paybackPeriodMonths.toFixed(1)}`}
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    Meses | Ideal: &lt; 12, Ótimo: &lt; 6
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-app-dark border-app-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span className="text-white">Margem Bruta</span>
                    <Badge
                      className={`${
                        unitEconomics.grossMargin > 70
                          ? "text-green-400"
                          : unitEconomics.grossMargin > 40
                          ? "text-yellow-400"
                          : "text-red-500"
                      } bg-transparent`}
                    >
                      {unitEconomics.grossMargin > 70
                        ? "Excelente"
                        : unitEconomics.grossMargin > 40
                        ? "Bom"
                        : "Baixa"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Margem antes de gastos fixos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-white font-bold">
                    {unitEconomics.grossMargin.toFixed(1)}%
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    Ideal: &gt; 40%, Ótimo: &gt; 70%
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs
            defaultValue="time"
            value={projectionTab}
            onValueChange={setProjectionTab}
            className="w-full mb-8"
          >
            <TabsList>
              <TabsTrigger value="time">Projeção Temporal</TabsTrigger>
              <TabsTrigger value="users">Projeção por Usuários</TabsTrigger>
              <TabsTrigger value="retention">Retenção de Clientes</TabsTrigger>
            </TabsList>
            <TabsContent value="time" className="pt-4">
              <h3 className="text-lg font-medium mb-3">
                Projeção para 36 meses
              </h3>
              <ChartContainer config={chartConfig} className="h-80 w-full mt-4">
                <LineChart
                  data={projections.projectionPoints}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    label={{
                      value: "Meses",
                      position: "insideBottom",
                      offset: -30,
                    }}
                  />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={(value) =>
                      formatCurrency(value, "BRL").split(" ")[0]
                    }
                    label={{
                      value: "Valor (BRL)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(value) => `${Math.round(value)}`}
                    label={{
                      value: "Usuários",
                      angle: 90,
                      position: "insideRight",
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    name="Receita"
                    stroke="var(--color-revenue)"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="costs"
                    name="Custos"
                    stroke="var(--color-costs)"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="profit"
                    name="Lucro"
                    stroke="var(--color-profit)"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="users"
                    name="Usuários"
                    stroke="var(--color-users)"
                    activeDot={{ r: 8 }}
                  />
                  <Legend />
                </LineChart>
              </ChartContainer>

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-3">
                  Aquisição vs. Perda de Clientes
                </h3>
                <ChartContainer
                  config={chartConfig}
                  className="h-80 w-full mt-4"
                >
                  <AreaChart
                    data={projections.projectionPoints}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      label={{
                        value: "Meses",
                        position: "insideBottom",
                        offset: -30,
                      }}
                    />
                    <YAxis
                      tickFormatter={(value) => `${Math.round(value)}`}
                      label={{
                        value: "Usuários",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="newUsers"
                      name="Novos Usuários"
                      stackId="1"
                      stroke="var(--color-newUsers)"
                      fill="var(--color-newUsers)"
                    />
                    <Area
                      type="monotone"
                      dataKey="churnedUsers"
                      name="Usuários Cancelados"
                      stackId="2"
                      stroke="var(--color-churnedUsers)"
                      fill="var(--color-churnedUsers)"
                    />
                    <Legend />
                  </AreaChart>
                </ChartContainer>
              </div>
            </TabsContent>

            <TabsContent value="users" className="pt-4">
              <h3 className="text-lg font-medium mb-3">
                Projeções por marco de assinantes
              </h3>
              <ChartContainer config={chartConfig} className="h-80 w-full mt-4">
                <LineChart
                  data={projections.milestonePoints}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="users"
                    label={{
                      value: "Assinantes",
                      position: "insideBottom",
                      offset: -30,
                    }}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      formatCurrency(value, "BRL").split(" ")[0]
                    }
                    label={{
                      value: "Valor (BRL)",
                      angle: -90,
                      position: "insideLeft",
                    }}
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
            </TabsContent>

            <TabsContent value="retention" className="pt-4">
              <h3 className="text-lg font-medium mb-3">
                Análise de Retenção de Coorte
              </h3>
              <p className="text-sm text-white/70 mb-4">
                Retenção de uma coorte de 100 clientes ao longo do tempo com
                taxa de churn de {state.monthlyChurnRate}%
              </p>
              <ChartContainer config={chartConfig} className="h-80 w-full mt-4">
                <AreaChart
                  data={projections.cohortRetention}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    label={{
                      value: "Mês",
                      position: "insideBottom",
                      offset: -30,
                    }}
                  />
                  <YAxis
                    label={{
                      value: "Clientes Retidos (%)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip content={<RetentionTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="retainedUsers"
                    name="Usuários Retidos"
                    stroke="var(--color-retainedUsers)"
                    fill="var(--color-retainedUsers)"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ChartContainer>
            </TabsContent>
          </Tabs>

          {/* 40% Rule Analysis - Dynamic Input */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <span>Regra dos 40% - Análise Dinâmica</span>
            </h3>
            <div className="bg-app-dark/50 p-4 rounded-lg mb-4">
              <p className="text-sm text-white/80">
                A Regra dos 40% é uma métrica usada por investidores para
                avaliar o desempenho de SaaS. Ela sugere que a soma dos custos
                não deve ultrapassar 40% da receita. Uma empresa saudável mantém
                seus custos totais abaixo de 40% de sua receita.
              </p>
            </div>
            
            <Card className="bg-app-dark border-app-border">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Análise para Número Específico de Usuários
                </CardTitle>
                <CardDescription>
                  Digite o número de usuários para ver a análise da regra dos 40%
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fortyPercentUsers" className="block text-sm font-medium mb-2">
                    Número de usuários
                  </Label>
                  <FormattedNumberInput
                    value={fortyPercentUsers}
                    onChange={setFortyPercentUsers}
                    className="max-w-xs text-white bg-app-card border border-white/20 rounded px-3 py-2"
                    placeholder="1000"
                    min={1}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="bg-app-card p-4 rounded-lg border border-app-border">
                    <div className="text-sm text-white/80 mb-1">Receita Anual</div>
                    <div className="text-xl font-bold text-white">
                      {formatCurrency(fortyPercentRuleAnalysis.annualRevenue)}
                    </div>
                  </div>
                  
                  <div className="bg-app-card p-4 rounded-lg border border-app-border">
                    <div className="text-sm text-white/80 mb-1">Custos (% da Receita)</div>
                    <div className="text-xl font-bold text-white">
                      {fortyPercentRuleAnalysis.costPercentage.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="bg-app-card p-4 rounded-lg border border-app-border">
                    <div className="text-sm text-white/80 mb-1">Status</div>
                    <div className={`flex items-center gap-2 ${
                      fortyPercentRuleAnalysis.isCompliant ? "text-success" : "text-red-500"
                    }`}>
                      <div className={`h-2 w-2 rounded-full ${
                        fortyPercentRuleAnalysis.isCompliant ? "bg-success" : "bg-red-500"
                      }`}></div>
                      <span className="text-lg font-medium">
                        {fortyPercentRuleAnalysis.isCompliant ? "Saudável" : "Acima do recomendado"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Macro Analysis - Dynamic Input */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <span>Análise de Macros Financeiros</span>
            </h3>
            
            <Card className="bg-app-dark border-app-border">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Análise Financeira por Número de Usuários
                </CardTitle>
                <CardDescription>
                  Digite o número de usuários para ver os macros financeiros mensais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="macroUsers" className="block text-sm font-medium mb-2">
                    Número de usuários
                  </Label>
                  <FormattedNumberInput
                    value={macroUsers}
                    onChange={setMacroUsers}
                    className="max-w-xs text-white bg-app-card border border-white/20 rounded px-3 py-2"
                    placeholder="1000"
                    min={1}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="bg-app-card p-4 rounded-lg border border-app-border">
                    <div className="text-sm text-white/80 mb-1">Receita Mensal</div>
                    <div className="text-xl font-bold text-success">
                      {formatCurrency(macroAnalysis.revenue)}
                    </div>
                  </div>
                  
                  <div className="bg-app-card p-4 rounded-lg border border-app-border">
                    <div className="text-sm text-white/80 mb-1">Custos Mensais</div>
                    <div className="text-xl font-bold text-red-400">
                      {formatCurrency(macroAnalysis.costs)}
                    </div>
                  </div>
                  
                  <div className="bg-app-card p-4 rounded-lg border border-app-border">
                    <div className="text-sm text-white/80 mb-1">Lucro Mensal</div>
                    <div className={`text-xl font-bold ${
                      macroAnalysis.profit >= 0 ? "text-success" : "text-red-500"
                    }`}>
                      {formatCurrency(macroAnalysis.profit)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="bg-orange-500/20 text-orange-200 p-4 rounded-md mb-4">
          <p className="font-medium">
            Não é possível calcular o ponto de equilíbrio com os valores atuais.
          </p>
          <p className="text-sm mt-1">
            Verifique se você tem planos de assinatura e se suas receitas cobrem
            os custos variáveis por usuário.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectionsTab;
