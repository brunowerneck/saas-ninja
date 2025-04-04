
import React, { useState } from "react";
import { Plus, Trash2, Info, Pencil } from "lucide-react";
import { useCalculator } from "@/context/CalculatorContext";
import { Currency, EditableItemState } from "@/types/calculator";
import { Tooltip } from "@/components/ui/tooltip";
import EditableCell from "./EditableCell";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
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
    updateSubscriptionPlanWeight,
    updateSubscriptionPlanName,
    updateSubscriptionPlanPrice,
    updateSubscriptionPlanCurrency,
  } = useCalculator();

  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanPrice, setNewPlanPrice] = useState("");
  const [newPlanCurrency, setNewPlanCurrency] = useState<Currency>("BRL");
  const [newPlanWeight, setNewPlanWeight] = useState("1");
  const [editingItem, setEditingItem] = useState<EditableItemState>({ id: null, field: null });

  const handleAddPlan = () => {
    if (newPlanName && newPlanPrice) {
      addSubscriptionPlan(
        newPlanName,
        parseFloat(newPlanPrice),
        newPlanCurrency,
        parseFloat(newPlanWeight) || 1
      );
      setNewPlanName("");
      setNewPlanPrice("");
      setNewPlanWeight("1");
    }
  };

  const totalWeight = state.subscriptionPlans.reduce(
    (sum, plan) => sum + (plan.weight || 1),
    0
  );

  const startEditing = (id: string, field: string) => {
    setEditingItem({ id, field });
  };

  const cancelEditing = () => {
    setEditingItem({ id: null, field: null });
  };

  return (
    <div className="bg-app-card border border-app-border rounded-lg p-5 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Planos de Assinatura</h2>
        <p className="text-white/60 text-sm mb-4">
          Adicione os planos de assinatura do seu SaaS e defina a proporção de usuários em cada plano.
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
              <TableHead className="text-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center justify-center">
                        Peso <Info size={14} className="ml-1 info-icon" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">
                        Proporção de usuários em cada plano. Um peso maior significa mais usuários neste plano.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="text-center">Distribuição</TableHead>
              <TableHead className="text-center">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.subscriptionPlans.map((plan) => (
              <TableRow key={plan.id} className="hover:bg-white/10">
                <TableCell className="font-medium">
                  {editingItem.id === plan.id && editingItem.field === 'name' ? (
                    <EditableCell 
                      value={plan.name}
                      onSave={(value) => {
                        updateSubscriptionPlanName(plan.id, String(value));
                        cancelEditing();
                      }}
                      onCancel={cancelEditing}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      {plan.name}
                      <button 
                        onClick={() => startEditing(plan.id, 'name')} 
                        className="ml-2 opacity-30 hover:opacity-100"
                        aria-label="Edit name"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editingItem.id === plan.id && editingItem.field === 'price' ? (
                    <EditableCell 
                      value={plan.price}
                      onSave={(value) => {
                        updateSubscriptionPlanPrice(plan.id, Number(value));
                        cancelEditing();
                      }}
                      onCancel={cancelEditing}
                      type="currency"
                      min={0}
                      currencyValue={plan.currency}
                      onCurrencyChange={(currency) => updateSubscriptionPlanCurrency(plan.id, currency)}
                    />
                  ) : (
                    <div className="flex items-center justify-end">
                      <button 
                        onClick={() => startEditing(plan.id, 'price')} 
                        className="mr-2 opacity-30 hover:opacity-100"
                        aria-label="Edit price"
                      >
                        <Pencil size={14} />
                      </button>
                      {formatCurrency(plan.price, plan.currency)}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {editingItem.id === plan.id && editingItem.field === 'weight' ? (
                    <EditableCell 
                      value={plan.weight || 1}
                      onSave={(value) => {
                        updateSubscriptionPlanWeight(plan.id, Number(value) || 1);
                        cancelEditing();
                      }}
                      onCancel={cancelEditing}
                      type="number"
                      min={1}
                      step="1"
                    />
                  ) : (
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={() => startEditing(plan.id, 'weight')} 
                        className="mr-1 opacity-30 hover:opacity-100"
                        aria-label="Edit weight"
                      >
                        <Pencil size={14} />
                      </button>
                      {plan.weight || 1}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {totalWeight > 0 ? 
                    `${Math.round(((plan.weight || 1) / totalWeight) * 100)}%` : 
                    '0%'}
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
            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Nome do plano</label>
                  <input
                    type="text"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    className="form-input w-full"
                    placeholder="Nome do plano"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="w-1/3">
                    <label className="text-sm font-medium mb-1 block">Moeda</label>
                    <select
                      value={newPlanCurrency}
                      onChange={(e) => setNewPlanCurrency(e.target.value as Currency)}
                      className="currency-select w-full"
                    >
                      <option value="BRL" className="bg-app-dark text-white">
                        R$
                      </option>
                      <option value="USD" className="bg-app-dark text-white">
                        US$
                      </option>
                    </select>
                  </div>
                  <div className="w-2/3">
                    <label className="text-sm font-medium mb-1 block">Valor</label>
                    <input
                      type="number"
                      value={newPlanPrice}
                      onChange={(e) => setNewPlanPrice(e.target.value)}
                      className="form-input w-full"
                      placeholder="Valor"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center">
                  Peso de distribuição
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Info size={14} className="ml-1.5 info-icon" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">
                          Define a proporção de usuários em cada plano. Um peso 2 significa o dobro de usuários em relação a um peso 1.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </label>
                <input
                  type="number"
                  value={newPlanWeight}
                  onChange={(e) => setNewPlanWeight(e.target.value)}
                  className="form-input w-full"
                  placeholder="Peso"
                  min="1"
                  step="1"
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
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
