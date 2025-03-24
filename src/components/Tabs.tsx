
import React from 'react';
import { useCalculator } from '@/context/CalculatorContext';
import { cn } from '@/lib/utils';

const Tabs: React.FC = () => {
  const { state, setActiveTab } = useCalculator();
  
  const tabs = [
    { id: 'subscriptions', label: 'Assinaturas' },
    { id: 'costs', label: 'Custos' },
    { id: 'payment', label: 'Pagamento' },
    { id: 'taxes', label: 'Tributos' },
  ] as const;

  return (
    <div className="flex space-x-1 overflow-x-auto bg-app-card border border-app-border rounded-lg mb-5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "tab-button",
            state.activeTab === tab.id && "active"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
