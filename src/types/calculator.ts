
export type Currency = "BRL" | "USD";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: Currency;
  weight: number; // Added weight property for distribution ratio
}

export interface CostItem {
  id: string;
  name: string;
  value: number;
  currency: Currency;
}

export interface CalculatorState {
  // Exchange rate
  dollarRate: number;
  
  // Subscription plans
  subscriptionPlans: SubscriptionPlan[];
  
  // Cost items
  monthlyCosts: CostItem[];
  annualCosts: CostItem[];
  perUserCosts: CostItem[];
  
  // Payment gateway
  paymentGatewayPercentage: number;
  paymentGatewayFixed: number;
  
  // Tax rate
  taxRate: number;
  
  // Active tab
  activeTab: 'subscriptions' | 'costs' | 'payment' | 'taxes' | 'projections';
}

export interface CalculationResults {
  breakEvenUsers: number;
  workingCapital: number;
  monthlyRevenue: number;
  monthlyCosts: number;
  monthlyProfit: number;
  monthlyTaxes: number;
  monthlyGateway: number;
}

export interface ProjectionPoint {
  users: number;
  revenue: number;
  costs: number;
  profit: number;
  month?: number;
  costPercentage?: number; // Percentage of costs over revenue
  is40RuleCompliant?: boolean; // Whether it meets the 40% rule
}
