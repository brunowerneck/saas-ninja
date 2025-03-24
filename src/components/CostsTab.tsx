import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonthyCosts } from "@/components/CostsTab/MonthyCosts";
import { AnnualCosts } from "./CostsTab/AnnualCosts";
import { PerUserCosts } from "./CostsTab/PerUserCosts";

const CostsTab = () => {
  return (
    <div className="bg-app-card border border-app-border rounded-lg p-5 animate-fade-in">
      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="bg-white/20 w-full grid grid-cols-3">
          <TabsTrigger value="monthly">Mensais</TabsTrigger>
          <TabsTrigger value="annual">Anuais</TabsTrigger>
          <TabsTrigger value="perUser">Por Usuário</TabsTrigger>
        </TabsList>
        <TabsContent className="w-full" value="monthly">
          {/* Monthly Costs */}
          <MonthyCosts />
        </TabsContent>
        <TabsContent className="w-full" value="annual">
          {/* Annual Costs */}
          <AnnualCosts />
        </TabsContent>
        <TabsContent className="w-full" value="perUser">
          {/* Per User Costs */}
          <PerUserCosts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CostsTab;
