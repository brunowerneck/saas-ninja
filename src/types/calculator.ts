
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

  // Churn and growth
  monthlyChurnRate: number;
  acquisitionCostPerUser: number;
  
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
  customerLifetimeValue: number;
  customerAcquisitionCost: number;
  ltv2CacRatio: number;
  paybackPeriodMonths: number;
}

export interface ProjectionPoint {
  users: number;
  revenue: number;
  costs: number;
  profit: number;
  month?: number;
  costPercentage?: number; // Percentage of costs over revenue
  is40RuleCompliant?: boolean; // Whether it meets the 40% rule
  churnedUsers?: number;
  newUsers?: number;
  retainedUsers?: number;
  cumulativeChurnRate?: number;
}

export interface EditableItemState {
  id: string | null;
  field: string | null;
}

// Unit economics metrics
export interface UnitEconomics {
  arpu: number; // Average Revenue Per User
  cac: number; // Customer Acquisition Cost
  ltv: number; // Lifetime Value
  paybackPeriod: number; // Months to recover CAC
  grossMargin: number; // Percentage
  ltv2CacRatio: number; // LTV:CAC ratio
}

