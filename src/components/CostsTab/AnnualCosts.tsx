
import React, { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useCalculator } from "@/context/CalculatorContext";
import { Currency, EditableItemState } from "@/types/calculator";
import EditableCell from "../EditableCell";
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
  const { 
    state, 
    addAnnualCost, 
    removeAnnualCost,
    updateAnnualCostName,
    updateAnnualCostValue,
    updateAnnualCostCurrency
  } = useCalculator();
  
  const [newAnnualCostName, setNewAnnualCostName] = useState("");
  const [newAnnualCostValue, setNewAnnualCostValue] = useState("");
  const [newAnnualCostCurrency, setNewAnnualCostCurrency] = useState<Currency>("BRL");
  const [editingItem, setEditingItem] = useState<EditableItemState>({ id: null, field: null });

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

  const startEditing = (id: string, field: string) => {
    setEditingItem({ id, field });
  };

  const cancelEditing = () => {
    setEditingItem({ id: null, field: null });
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
              <TableCell className="font-medium">
                {editingItem.id === cost.id && editingItem.field === 'name' ? (
                  <EditableCell 
                    value={cost.name}
                    onSave={(value) => {
                      updateAnnualCostName(cost.id, String(value));
                      cancelEditing();
                    }}
                    onCancel={cancelEditing}
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    {cost.name}
                    <button 
                      onClick={() => startEditing(cost.id, 'name')} 
                      className="ml-2 opacity-30 hover:opacity-100"
                      aria-label="Edit name"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                {editingItem.id === cost.id && editingItem.field === 'value' ? (
                  <EditableCell 
                    value={cost.value}
                    onSave={(value) => {
                      updateAnnualCostValue(cost.id, Number(value));
                      cancelEditing();
                    }}
                    onCancel={cancelEditing}
                    type="currency"
                    min={0}
                    currencyValue={cost.currency}
                    onCurrencyChange={(currency) => updateAnnualCostCurrency(cost.id, currency)}
                  />
                ) : (
                  <div className="flex items-center justify-end">
                    <button 
                      onClick={() => startEditing(cost.id, 'value')} 
                      className="mr-2 opacity-30 hover:opacity-100"
                      aria-label="Edit value"
                    >
                      <Pencil size={14} />
                    </button>
                    {formatCurrency(cost.value, cost.currency)}
                  </div>
                )}
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
