import React, { useState } from "react";
import { Plus, Trash2, Info } from "lucide-react";
import { useCalculator } from "@/context/CalculatorContext";
import { Currency } from "@/types/calculator";
import { Tooltip } from "@/components/ui/tooltip";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatCurrency";

const SubscriptionsTab: React.FC = () => {
  const {
    state,
    updateDollarRate,
    addSubscriptionPlan,
    removeSubscriptionPlan,
  } = useCalculator();

  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanPrice, setNewPlanPrice] = useState("");
  const [newPlanCurrency, setNewPlanCurrency] = useState<Currency>("BRL");

  const handleAddPlan = () => {
    if (newPlanName && newPlanPrice) {
      addSubscriptionPlan(
        newPlanName,
        parseFloat(newPlanPrice),
        newPlanCurrency
      );
      setNewPlanName("");
      setNewPlanPrice("");
    }
  };

  return (
    <div className="bg-app-card border border-app-border rounded-lg p-5 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Planos de Assinatura</h2>
        <p className="text-white/60 text-sm mb-4">
          Adicione os planos de assinatura do seu SaaS.
        </p>

        <div className="mb-5">
          <label
            htmlFor="dollarRate"
            className="flex items-center text-sm font-medium mb-2"
          >
            Taxa do Dólar:
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Info size={16} className="ml-1.5 info-icon" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Taxa de conversão do dólar para o real. Utilizada para
                    calcular custos em dólar.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 bg-black/30 border border-app-border border-r-0 rounded-l-md">
              R$
            </span>
            <input
              id="dollarRate"
              type="number"
              value={state.dollarRate}
              onChange={(e) =>
                updateDollarRate(parseFloat(e.target.value) || 0)
              }
              className="form-input rounded-l-none"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[250px]">Plano</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-center">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.subscriptionPlans.map((plan) => (
              <TableRow key={plan.id} className="hover:bg-white/10">
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(plan.price, plan.currency)}
                </TableCell>
                <TableCell className="text-center">
                  <button
                    onClick={() => removeSubscriptionPlan(plan.id)}
                    className="delete-button"
                    aria-label="Remove plan"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog>
          <DialogTrigger asChild>
            <button className="add-button">
              <Plus size={18} className="mr-2" /> Adicionar Plano
            </button>
          </DialogTrigger>
          <DialogContent className="bg-app-dark max-w-[750px]">
            <div className="cost-item">
              <input
                type="text"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                className="form-input flex-1"
                placeholder="Nome do plano"
              />
              <select
                value={newPlanCurrency}
                onChange={(e) => setNewPlanCurrency(e.target.value as Currency)}
                className="currency-select flex-none w-16"
              >
                <option value="BRL" className="bg-app-dark text-white">
                  R$
                </option>
                <option value="USD" className="bg-app-dark text-white">
                  US$
                </option>
              </select>
              <input
                type="number"
                value={newPlanPrice}
                onChange={(e) => setNewPlanPrice(e.target.value)}
                className="form-input flex-1"
                placeholder="Valor"
                step="0.01"
                min="0"
              />
              <button
                onClick={() => {}}
                className="opacity-0 pointer-events-none delete-button"
                aria-label="Placeholder button"
              >
                <Trash2 size={18} className="text-white/70" />
              </button>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <button className="add-button" onClick={handleAddPlan}>
                  <Plus size={18} className="mr-2" /> Adicionar Plano
                </button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SubscriptionsTab;
