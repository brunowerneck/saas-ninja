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
    currency: Currency
  ) => void;
  removeSubscriptionPlan: (id: string) => void;
  addMonthlyCost: (name: string, value: number, currency: Currency) => void;
  removeMonthlyCost: (id: string) => void;
  addAnnualCost: (name: string, value: number, currency: Currency) => void;
  removeAnnualCost: (id: string) => void;
  addPerUserCost: (name: string, value: number, currency: Currency) => void;
  removePerUserCost: (id: string) => void;
  updatePaymentGatewayPercentage: (value: number) => void;
  updatePaymentGatewayFixed: (value: number) => void;
  updateTaxRate: (value: number) => void;
  setActiveTab: (tab: "subscriptions" | "costs" | "payment" | "taxes") => void;
}

const initialState: CalculatorState = {
  dollarRate: 5.73,
  subscriptionPlans: [
    { id: uuidv4(), name: "Basic Plan", price: 14.9, currency: "BRL" },
    { id: uuidv4(), name: "Premium Plan", price: 34.9, currency: "BRL" },
  ],
  monthlyCosts: [
    { id: uuidv4(), name: "Hosting", value: 19, currency: "USD" },
    { id: uuidv4(), name: "Database", value: 25, currency: "USD" },
    { id: uuidv4(), name: "Ferramentas DEV", value: 50, currency: "USD" },
    { id: uuidv4(), name: "Contador", value: 207.9, currency: "BRL" },
  ],
  annualCosts: [
    { id: uuidv4(), name: "Domínio", value: 49.9, currency: "USD" },
  ],
  perUserCosts: [{ id: uuidv4(), name: "OpenAI", value: 1, currency: "USD" }],
  paymentGatewayPercentage: 3.99,
  paymentGatewayFixed: 0.39,
  taxRate: 15.5,
  activeTab: "subscriptions",
};

const initialResults: CalculationResults = {
  breakEvenUsers: 0,
  workingCapital: 0,
  monthlyRevenue: 0,
  monthlyCosts: 0,
  monthlyProfit: 0,
};

const CalculatorContext = createContext<CalculatorContextType>({
  state: initialState,
  results: initialResults,
  updateDollarRate: () => {},
  addSubscriptionPlan: () => {},
  removeSubscriptionPlan: () => {},
  addMonthlyCost: () => {},
  removeMonthlyCost: () => {},
  addAnnualCost: () => {},
  removeAnnualCost: () => {},
  addPerUserCost: () => {},
  removePerUserCost: () => {},
  updatePaymentGatewayPercentage: () => {},
  updatePaymentGatewayFixed: () => {},
  updateTaxRate: () => {},
  setActiveTab: () => {},
});

export const useCalculator = () => useContext(CalculatorContext);

export const CalculatorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<CalculatorState>(initialState);
  const [results, setResults] = useState<CalculationResults>(initialResults);

  // Helper function to normalize amount to BRL
  const normalizeAmount = (amount: number, currency: Currency): number => {
    return currency === "USD" ? amount * state.dollarRate : amount;
  };

  // Calculate total monthly cost
  const calculateMonthlyCosts = (userCount: number): number => {
    // Fixed monthly costs
    const fixedMonthlyCosts = state.monthlyCosts.reduce(
      (sum, cost) => sum + normalizeAmount(cost.value, cost.currency),
      0
    );

    // Annual costs converted to monthly
    const monthlyAnnualCosts = state.annualCosts.reduce(
      (sum, cost) => sum + normalizeAmount(cost.value, cost.currency) / 12,
      0
    );

    // Per user costs
    const totalPerUserCosts = state.perUserCosts.reduce(
      (sum, cost) =>
        sum + normalizeAmount(cost.value, cost.currency) * userCount,
      0
    );

    return fixedMonthlyCosts + monthlyAnnualCosts + totalPerUserCosts;
  };

  // Calculate average revenue per user
  const calculateAverageRevenuePerUser = (): number => {
    if (state.subscriptionPlans.length === 0) return 0;

    const totalRevenue = state.subscriptionPlans.reduce(
      (sum, plan) => sum + normalizeAmount(plan.price, plan.currency),
      0
    );

    return totalRevenue / state.subscriptionPlans.length;
  };

  // Calculate net revenue after payment gateway and taxes
  const calculateNetRevenuePerUser = (grossRevenue: number): number => {
    // Apply payment gateway fees
    const afterGatewayPercentage =
      grossRevenue * (1 - state.paymentGatewayPercentage / 100);
    const afterGatewayFixed =
      afterGatewayPercentage - state.paymentGatewayFixed;

    // Apply taxes
    const afterTaxes = afterGatewayFixed * (1 - state.taxRate / 100);

    return afterTaxes;
  };

  // Main calculation function
  const performCalculations = () => {
    // Calculate average subscription revenue
    const avgGrossRevenuePerUser = calculateAverageRevenuePerUser();
    const avgNetRevenuePerUser = calculateNetRevenuePerUser(
      avgGrossRevenuePerUser
    );

    // Calculate per-user costs
    const perUserVariableCosts = state.perUserCosts.reduce(
      (sum, cost) => sum + normalizeAmount(cost.value, cost.currency),
      0
    );

    // Calculate fixed costs (monthly + annual/12)
    const fixedMonthlyCosts = state.monthlyCosts.reduce(
      (sum, cost) => sum + normalizeAmount(cost.value, cost.currency),
      0
    );
    const monthlyAnnualCosts = state.annualCosts.reduce(
      (sum, cost) => sum + normalizeAmount(cost.value, cost.currency) / 12,
      0
    );
    const totalFixedCosts = fixedMonthlyCosts + monthlyAnnualCosts;

    // Calculate break-even point (users)
    // Formula: Fixed Costs / (Net Revenue per User - Variable Costs per User)
    let breakEvenUsers = 0;
    if (avgNetRevenuePerUser > perUserVariableCosts) {
      breakEvenUsers = Math.ceil(
        totalFixedCosts / (avgNetRevenuePerUser - perUserVariableCosts)
      );
    } else {
      breakEvenUsers = Infinity; // Not possible to break even
    }

    // Working capital (3 months of costs)
    const monthlyTotalCosts = calculateMonthlyCosts(breakEvenUsers);
    const workingCapital = monthlyTotalCosts * 3;

    // Calculate monthly revenue, costs and profit at break-even point
    const monthlyRevenue = breakEvenUsers * avgGrossRevenuePerUser;
    const monthlyProfit =
      (avgNetRevenuePerUser - perUserVariableCosts) * breakEvenUsers -
      totalFixedCosts;

    setResults({
      breakEvenUsers,
      workingCapital,
      monthlyRevenue,
      monthlyCosts: monthlyTotalCosts,
      monthlyProfit,
    });
  };

  // Run calculations whenever state changes
  useEffect(() => {
    performCalculations();
  }, [state]);

  // Context methods
  const updateDollarRate = (rate: number) => {
    setState((prev) => ({ ...prev, dollarRate: rate }));
  };

  const addSubscriptionPlan = (
    name: string,
    price: number,
    currency: Currency
  ) => {
    setState((prev) => ({
      ...prev,
      subscriptionPlans: [
        ...prev.subscriptionPlans,
        { id: uuidv4(), name, price, currency },
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

  const updatePaymentGatewayPercentage = (value: number) => {
    setState((prev) => ({ ...prev, paymentGatewayPercentage: value }));
  };

  const updatePaymentGatewayFixed = (value: number) => {
    setState((prev) => ({ ...prev, paymentGatewayFixed: value }));
  };

  const updateTaxRate = (value: number) => {
    setState((prev) => ({ ...prev, taxRate: value }));
  };

  const setActiveTab = (
    tab: "subscriptions" | "costs" | "payment" | "taxes"
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
        addMonthlyCost,
        removeMonthlyCost,
        addAnnualCost,
        removeAnnualCost,
        addPerUserCost,
        removePerUserCost,
        updatePaymentGatewayPercentage,
        updatePaymentGatewayFixed,
        updateTaxRate,
        setActiveTab,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
};
