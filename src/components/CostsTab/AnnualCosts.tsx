import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useCalculator } from "@/context/CalculatorContext";
import { Currency } from "@/types/calculator";
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatCurrency";

export const AnnualCosts: React.FC = () => {
  const { state, addAnnualCost, removeAnnualCost } = useCalculator();
  const [newAnnualCostName, setNewAnnualCostName] = useState("");
  const [newAnnualCostValue, setNewAnnualCostValue] = useState("");
  const [newAnnualCostCurrency, setNewAnnualCostCurrency] =
    useState<Currency>("BRL");

  const handleAddAnnualCost = () => {
    if (newAnnualCostName && newAnnualCostValue) {
      addAnnualCost(
        newAnnualCostName,
        parseFloat(newAnnualCostValue),
        newAnnualCostCurrency
      );
      setNewAnnualCostName("");
      setNewAnnualCostValue("");
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Custos Anuais Fixos</h2>
      <p className="text-white/60 text-sm mb-4">
        Adicione todos os custos fixos anuais do seu SaaS.
      </p>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[250px]">Descrição</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-center">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {state.annualCosts.map((cost) => (
            <TableRow key={cost.id} className="hover:bg-white/10">
              <TableCell className="font-medium">{cost.name}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(cost.value, cost.currency)}
              </TableCell>
              <TableCell className="text-center">
                <button
                  onClick={() => removeAnnualCost(cost.id)}
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
            <Plus size={18} className="mr-2" /> Adicionar Custo Anual
          </button>
        </DialogTrigger>
        <DialogContent className="bg-app-dark max-w-[750px]">
          <div className="cost-item">
            <input
              type="text"
              value={newAnnualCostName}
              onChange={(e) => setNewAnnualCostName(e.target.value)}
              className="form-input flex-1"
              placeholder="Nome do custo"
            />
            <select
              value={newAnnualCostCurrency}
              onChange={(e) =>
                setNewAnnualCostCurrency(e.target.value as Currency)
              }
              className="currency-select w-16"
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
              value={newAnnualCostValue}
              onChange={(e) => setNewAnnualCostValue(e.target.value)}
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
              <button onClick={handleAddAnnualCost} className="add-button">
                <Plus size={18} className="mr-2" /> Adicionar Custo Anual
              </button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
