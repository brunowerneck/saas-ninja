import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  CalculatorState,
  CalculationResults,
  Currency,
  CostItem,
  SubscriptionPlan,
} from "@/types/calculator";

interface CalculatorContextType {
  state: CalculatorState;
  results: CalculationResults;
  updateDollarRate: (rate: number) => void;
  addSubscriptionPlan: (
    name: string,
    price: number,
    currency: Currency,
    weight: number
  ) => void;
  removeSubscriptionPlan: (id: string) => void;
  updateSubscriptionPlanWeight: (id: string, weight: number) => void;
  updateSubscriptionPlanName: (id: string, name: string) => void;
  updateSubscriptionPlanPrice: (id: string, price: number) => void;
  updateSubscriptionPlanCurrency: (id: string, currency: Currency) => void;
  addMonthlyCost: (name: string, value: number, currency: Currency) => void;
  removeMonthlyCost: (id: string) => void;
  updateMonthlyCostName: (id: string, name: string) => void;
  updateMonthlyCostValue: (id: string, value: number) => void;
  updateMonthlyCostCurrency: (id: string, currency: Currency) => void;
  addAnnualCost: (name: string, value: number, currency: Currency) => void;
  removeAnnualCost: (id: string) => void;
  updateAnnualCostName: (id: string, name: string) => void;
  updateAnnualCostValue: (id: string, value: number) => void;
  updateAnnualCostCurrency: (id: string, currency: Currency) => void;
  addPerUserCost: (name: string, value: number, currency: Currency) => void;
  removePerUserCost: (id: string) => void;
  updatePerUserCostName: (id: string, name: string) => void;
  updatePerUserCostValue: (id: string, value: number) => void;
  updatePerUserCostCurrency: (id: string, currency: Currency) => void;
  updatePaymentGatewayPercentage: (value: number) => void;
  updatePaymentGatewayFixed: (value: number) => void;
  updateTaxRate: (value: number) => void;
  updateMonthlyChurnRate: (value: number) => void;
  updateAcquisitionCostPerUser: (value: number) => void;
  setActiveTab: (
    tab: "subscriptions" | "costs" | "payment" | "taxes" | "projections"
  ) => void;
}

const initialState: CalculatorState = {
  dollarRate: 5.73,
  subscriptionPlans: [
    { id: uuidv4(), name: "Basic Plan", price: 14.9, currency: "BRL", weight: 80 },
    { id: uuidv4(), name: "Premium Plan", price: 34.9, currency: "BRL", weight: 20 },
  ],
  monthlyCosts: [
    { id: uuidv4(), name: "Hosting", value: 10, currency: "USD" },
    { id: uuidv4(), name: "Database", value: 25, currency: "USD" },
    { id: uuidv4(), name: "Ferramentas DEV", value: 50, currency: "USD" },
    { id: uuidv4(), name: "Contador", value: 250, currency: "BRL" },
    { id: uuidv4(), name: "Publicidade", value: 1500, currency: "BRL" },
  ],
  annualCosts: [
    { id: uuidv4(), name: "Domínio", value: 24.9, currency: "USD" },
  ],
  perUserCosts: [{ id: uuidv4(), name: "OpenAI", value: 1, currency: "USD" }],
  paymentGatewayPercentage: 3.99,
  paymentGatewayFixed: 0.39,
  taxRate: 15.5,
  monthlyChurnRate: 5,
  acquisitionCostPerUser: 50,
  activeTab: "subscriptions",
};

const initialResults: CalculationResults = {
  breakEvenUsers: 0,
  workingCapital: 0,
  monthlyRevenue: 0,
  monthlyCosts: 0,
  monthlyProfit: 0,
  monthlyTaxes: 0,
  monthlyGateway: 0,
  customerLifetimeValue: 0,
  customerAcquisitionCost: 0,
  ltv2CacRatio: 0,
  paybackPeriodMonths: 0,
};

const CalculatorContext = createContext<CalculatorContextType>({
  state: initialState,
  results: initialResults,
  updateDollarRate: () => {},
  addSubscriptionPlan: () => {},
  removeSubscriptionPlan: () => {},
  updateSubscriptionPlanWeight: () => {},
  updateSubscriptionPlanName: () => {},
  updateSubscriptionPlanPrice: () => {},
  updateSubscriptionPlanCurrency: () => {},
  addMonthlyCost: () => {},
  removeMonthlyCost: () => {},
  updateMonthlyCostName: () => {},
  updateMonthlyCostValue: () => {},
  updateMonthlyCostCurrency: () => {},
  addAnnualCost: () => {},
  removeAnnualCost: () => {},
  updateAnnualCostName: () => {},
  updateAnnualCostValue: () => {},
  updateAnnualCostCurrency: () => {},
  addPerUserCost: () => {},
  removePerUserCost: () => {},
  updatePerUserCostName: () => {},
  updatePerUserCostValue: () => {},
  updatePerUserCostCurrency: () => {},
  updatePaymentGatewayPercentage: () => {},
  updatePaymentGatewayFixed: () => {},
  updateTaxRate: () => {},
  updateMonthlyChurnRate: () => {},
  updateAcquisitionCostPerUser: () => {},
  setActiveTab: () => {},
});

export const useCalculator = () => useContext(CalculatorContext);

export const CalculatorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<CalculatorState>(initialState);
  const [results, setResults] = useState<CalculationResults>(initialResults);

  const normalizeAmount = (amount: number, currency: Currency): number => {
    return currency === "USD" ? amount * state.dollarRate : amount;
  };

  const calculateMonthlyCosts = (userCount: number): number => {
    const fixedMonthlyCosts = state.monthlyCosts.reduce(
      (sum, cost) => sum + normalizeAmount(cost.value, cost.currency),
      0
    );

    const monthlyAnnualCosts = state.annualCosts.reduce(
      (sum, cost) => sum + normalizeAmount(cost.value, cost.currency) / 12,
      0
    );

    const totalPerUserCosts = state.perUserCosts.reduce(
      (sum, cost) =>
        sum + normalizeAmount(cost.value, cost.currency) * userCount,
      0
    );

    return fixedMonthlyCosts + monthlyAnnualCosts + totalPerUserCosts;
  };

  const calculateAverageRevenuePerUser = (): number => {
    if (state.subscriptionPlans.length === 0) return 0;

    const totalWeight = state.subscriptionPlans.reduce(
      (sum, plan) => sum + (plan.weight || 1),
      0
    );

    if (totalWeight === 0) return 0;

    const weightedTotalRevenue = state.subscriptionPlans.reduce(
      (sum, plan) => sum + normalizeAmount(plan.price, plan.currency) * (plan.weight || 1),
      0
    );

    return weightedTotalRevenue / totalWeight;
  };

  const calculateNetRevenuePerUser = (grossRevenue: number): number => {
    const taxAmount = (grossRevenue * state.taxRate) / 100;
    const gatewayPercentageAmount =
      (grossRevenue * state.paymentGatewayPercentage) / 100;

    return (
      grossRevenue -
      (taxAmount + gatewayPercentageAmount + state.paymentGatewayFixed)
    );
  };

  const performCalculations = () => {
    const avgGrossRevenuePerUser = calculateAverageRevenuePerUser();
    const avgNetRevenuePerUser = calculateNetRevenuePerUser(avgGrossRevenuePerUser);

    const perUserVariableCosts = state.perUserCosts.reduce(
      (sum, cost) => sum + normalizeAmount(cost.value, cost.currency),
      0
    );

    const fixedMonthlyCosts = state.monthlyCosts.reduce(
      (sum, cost) => sum + normalizeAmount(cost.value, cost.currency),
      0
    );
    const monthlyAnnualCosts = state.annualCosts.reduce(
      (sum, cost) => sum + normalizeAmount(cost.value, cost.currency) / 12,
      0
    );
    const totalFixedCosts = fixedMonthlyCosts + monthlyAnnualCosts;

    let breakEvenUsers = 0;
    if (avgNetRevenuePerUser > perUserVariableCosts) {
      breakEvenUsers = Math.ceil(
        totalFixedCosts / (avgNetRevenuePerUser - perUserVariableCosts)
      );
    } else {
      breakEvenUsers = Infinity;
    }

    const monthlyTotalCosts = calculateMonthlyCosts(breakEvenUsers);
    const workingCapital = monthlyTotalCosts * 3;

    const monthlyRevenue = breakEvenUsers * avgGrossRevenuePerUser;
    const monthlyProfit =
      (avgNetRevenuePerUser - perUserVariableCosts) * breakEvenUsers -
      totalFixedCosts;
    const monthlyTaxes =
      ((avgGrossRevenuePerUser * state.taxRate) / 100) * breakEvenUsers;
    const monthlyGateway =
      ((avgGrossRevenuePerUser * state.paymentGatewayPercentage) / 100) *
        breakEvenUsers +
      state.paymentGatewayFixed * breakEvenUsers;
    
    const churnRateAsDecimal = state.monthlyChurnRate / 100;
    const averageLifetimeMonths = churnRateAsDecimal > 0 ? 1 / churnRateAsDecimal : Infinity;
    const customerLifetimeValue = avgNetRevenuePerUser * averageLifetimeMonths;
    
    const customerAcquisitionCost = state.acquisitionCostPerUser;
    const ltv2CacRatio = customerAcquisitionCost > 0 ? customerLifetimeValue / customerAcquisitionCost : Infinity;
    
    const monthlyContributionMargin = avgNetRevenuePerUser - perUserVariableCosts;
    const paybackPeriodMonths = monthlyContributionMargin > 0 
      ? customerAcquisitionCost / monthlyContributionMargin 
      : Infinity;
    
    setResults({
      breakEvenUsers,
      workingCapital,
      monthlyRevenue,
      monthlyCosts: monthlyTotalCosts,
      monthlyProfit,
      monthlyTaxes,
      monthlyGateway,
      customerLifetimeValue,
      customerAcquisitionCost,
      ltv2CacRatio,
      paybackPeriodMonths
    });
  };

  useEffect(() => {
    performCalculations();
  }, [state]);

  const updateDollarRate = (rate: number) => {
    setState((prev) => ({ ...prev, dollarRate: rate }));
  };

  const addSubscriptionPlan = (
    name: string,
    price: number,
    currency: Currency,
    weight: number = 1
  ) => {
    setState((prev) => ({
      ...prev,
      subscriptionPlans: [
        ...prev.subscriptionPlans,
        { id: uuidv4(), name, price, currency, weight },
      ],
    }));
  };

  const removeSubscriptionPlan = (id: string) => {
    setState((prev) => ({
      ...prev,
      subscriptionPlans: prev.subscriptionPlans.filter(
        (plan) => plan.id !== id
      ),
    }));
  };

  const updateSubscriptionPlanWeight = (id: string, weight: number) => {
    setState((prev) => ({
      ...prev,
      subscriptionPlans: prev.subscriptionPlans.map((plan) =>
        plan.id === id ? { ...plan, weight } : plan
      ),
    }));
  };

  const updateSubscriptionPlanName = (id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      subscriptionPlans: prev.subscriptionPlans.map((plan) =>
        plan.id === id ? { ...plan, name } : plan
      ),
    }));
  };

  const updateSubscriptionPlanPrice = (id: string, price: number) => {
    setState((prev) => ({
      ...prev,
      subscriptionPlans: prev.subscriptionPlans.map((plan) =>
        plan.id === id ? { ...plan, price } : plan
      ),
    }));
  };

  const updateSubscriptionPlanCurrency = (id: string, currency: Currency) => {
    setState((prev) => ({
      ...prev,
      subscriptionPlans: prev.subscriptionPlans.map((plan) =>
        plan.id === id ? { ...plan, currency } : plan
      ),
    }));
  };

  const addMonthlyCost = (name: string, value: number, currency: Currency) => {
    setState((prev) => ({
      ...prev,
      monthlyCosts: [
        ...prev.monthlyCosts,
        { id: uuidv4(), name, value, currency },
      ],
    }));
  };

  const removeMonthlyCost = (id: string) => {
    setState((prev) => ({
      ...prev,
      monthlyCosts: prev.monthlyCosts.filter((cost) => cost.id !== id),
    }));
  };

  const updateMonthlyCostName = (id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      monthlyCosts: prev.monthlyCosts.map((cost) =>
        cost.id === id ? { ...cost, name } : cost
      ),
    }));
  };

  const updateMonthlyCostValue = (id: string, value: number) => {
    setState((prev) => ({
      ...prev,
      monthlyCosts: prev.monthlyCosts.map((cost) =>
        cost.id === id ? { ...cost, value } : cost
      ),
    }));
  };

  const updateMonthlyCostCurrency = (id: string, currency: Currency) => {
    setState((prev) => ({
      ...prev,
      monthlyCosts: prev.monthlyCosts.map((cost) =>
        cost.id === id ? { ...cost, currency } : cost
      ),
    }));
  };

  const addAnnualCost = (name: string, value: number, currency: Currency) => {
    setState((prev) => ({
      ...prev,
      annualCosts: [
        ...prev.annualCosts,
        { id: uuidv4(), name, value, currency },
      ],
    }));
  };

  const removeAnnualCost = (id: string) => {
    setState((prev) => ({
      ...prev,
      annualCosts: prev.annualCosts.filter((cost) => cost.id !== id),
    }));
  };

  const updateAnnualCostName = (id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      annualCosts: prev.annualCosts.map((cost) =>
        cost.id === id ? { ...cost, name } : cost
      ),
    }));
  };

  const updateAnnualCostValue = (id: string, value: number) => {
    setState((prev) => ({
      ...prev,
      annualCosts: prev.annualCosts.map((cost) =>
        cost.id === id ? { ...cost, value } : cost
      ),
    }));
  };

  const updateAnnualCostCurrency = (id: string, currency: Currency) => {
    setState((prev) => ({
      ...prev,
      annualCosts: prev.annualCosts.map((cost) =>
        cost.id === id ? { ...cost, currency } : cost
      ),
    }));
  };

  const addPerUserCost = (name: string, value: number, currency: Currency) => {
    setState((prev) => ({
      ...prev,
      perUserCosts: [
        ...prev.perUserCosts,
        { id: uuidv4(), name, value, currency },
      ],
    }));
  };

  const removePerUserCost = (id: string) => {
    setState((prev) => ({
      ...prev,
      perUserCosts: prev.perUserCosts.filter((cost) => cost.id !== id),
    }));
  };

  const updatePerUserCostName = (id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      perUserCosts: prev.perUserCosts.map((cost) =>
        cost.id === id ? { ...cost, name } : cost
      ),
    }));
  };

  const updatePerUserCostValue = (id: string, value: number) => {
    setState((prev) => ({
      ...prev,
      perUserCosts: prev.perUserCosts.map((cost) =>
        cost.id === id ? { ...cost, value } : cost
      ),
    }));
  };

  const updatePerUserCostCurrency = (id: string, currency: Currency) => {
    setState((prev) => ({
      ...prev,
      perUserCosts: prev.perUserCosts.map((cost) =>
        cost.id === id ? { ...cost, currency } : cost
      ),
    }));
  };

  const updatePaymentGatewayPercentage = (value: number) => {
    setState((prev) => ({ ...prev, paymentGatewayPercentage: value }));
  };

  const updatePaymentGatewayFixed = (value: number) => {
    setState((prev) => ({ ...prev, paymentGatewayFixed: value }));
  };

  const updateTaxRate = (value: number) => {
    setState((prev) => ({ ...prev, taxRate: value }));
  };

  const updateMonthlyChurnRate = (value: number) => {
    setState((prev) => ({ ...prev, monthlyChurnRate: value }));
  };

  const updateAcquisitionCostPerUser = (value: number) => {
    setState((prev) => ({ ...prev, acquisitionCostPerUser: value }));
  };

  const setActiveTab = (
    tab: "subscriptions" | "costs" | "payment" | "taxes" | "projections"
  ) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  };

  return (
    <CalculatorContext.Provider
      value={{
        state,
        results,
        updateDollarRate,
        addSubscriptionPlan,
        removeSubscriptionPlan,
        updateSubscriptionPlanWeight,
        updateSubscriptionPlanName,
        updateSubscriptionPlanPrice,
        updateSubscriptionPlanCurrency,
        addMonthlyCost,
        removeMonthlyCost,
        updateMonthlyCostName,
        updateMonthlyCostValue,
        updateMonthlyCostCurrency,
        addAnnualCost,
        removeAnnualCost,
        updateAnnualCostName,
        updateAnnualCostValue,
        updateAnnualCostCurrency,
        addPerUserCost,
        removePerUserCost,
        updatePerUserCostName,
        updatePerUserCostValue,
        updatePerUserCostCurrency,
        updatePaymentGatewayPercentage,
        updatePaymentGatewayFixed,
        updateTaxRate,
        updateMonthlyChurnRate,
        updateAcquisitionCostPerUser,
        setActiveTab,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
};
