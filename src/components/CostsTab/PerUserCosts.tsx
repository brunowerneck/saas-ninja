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

export const PerUserCosts: React.FC = () => {
  const { state, addPerUserCost, removePerUserCost } = useCalculator();
  const [newPerUserCostName, setNewPerUserCostName] = useState("");
  const [newPerUserCostValue, setNewPerUserCostValue] = useState("");
  const [newPerUserCostCurrency, setNewPerUserCostCurrency] =
    useState<Currency>("BRL");

  const handleAddPerUserCost = () => {
    if (newPerUserCostName && newPerUserCostValue) {
      addPerUserCost(
        newPerUserCostName,
        parseFloat(newPerUserCostValue),
        newPerUserCostCurrency
      );
      setNewPerUserCostName("");
      setNewPerUserCostValue("");
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">
        Custos Mensais Fixos Por Usuário
      </h2>
      <p className="text-white/60 text-sm mb-4">
        Adicione custos que são aplicados para cada usuário. Estes custos serão
        deduzidos da mensalidade.
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
          {state.perUserCosts.map((cost) => (
            <TableRow key={cost.id} className="hover:bg-white/10">
              <TableCell className="font-medium">{cost.name}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(cost.value, cost.currency)}
              </TableCell>
              <TableCell className="text-center">
                <button
                  onClick={() => removePerUserCost(cost.id)}
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
            <Plus size={18} className="mr-2" /> Adicionar Custo Por Usuário
          </button>
        </DialogTrigger>
        <DialogContent className="bg-app-dark max-w-[750px]">
          <div className="cost-item">
            <input
              type="text"
              value={newPerUserCostName}
              onChange={(e) => setNewPerUserCostName(e.target.value)}
              className="form-input flex-1"
              placeholder="Nome do custo"
            />
            <select
              value={newPerUserCostCurrency}
              onChange={(e) =>
                setNewPerUserCostCurrency(e.target.value as Currency)
              }
              className="currency-select w-16 flex-none"
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
              value={newPerUserCostValue}
              onChange={(e) => setNewPerUserCostValue(e.target.value)}
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
              <button onClick={handleAddPerUserCost} className="add-button">
                <Plus size={18} className="mr-2" /> Adicionar Custo Por Usuário
              </button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
