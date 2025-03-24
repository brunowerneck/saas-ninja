import React from "react";
import { CalculatorProvider } from "@/context/CalculatorContext";
import Tabs from "@/components/Tabs";
import SubscriptionsTab from "@/components/SubscriptionsTab";
import CostsTab from "@/components/CostsTab";
import PaymentTab from "@/components/PaymentTab";
import TaxesTab from "@/components/TaxesTab";
import ResultsPanel from "@/components/ResultsPanel";
import { useCalculator } from "@/context/CalculatorContext";

const TabContent: React.FC = () => {
  const { state } = useCalculator();

  return (
    <>
      {state.activeTab === "subscriptions" && <SubscriptionsTab />}
      {state.activeTab === "costs" && <CostsTab />}
      {state.activeTab === "payment" && <PaymentTab />}
      {state.activeTab === "taxes" && <TaxesTab />}
    </>
  );
};

const SaasCalculatorInner: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Calculadora de Viabilidade de SaaS
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-4">
          <Tabs />
          <TabContent />
        </div>

        <div className="lg:col-span-2">
          <ResultsPanel />
        </div>
      </div>
    </div>
  );
};

const SaasCalculator: React.FC = () => {
  return (
    <CalculatorProvider>
      <SaasCalculatorInner />
    </CalculatorProvider>
  );
};

export default SaasCalculator;
