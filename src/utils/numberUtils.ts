
export const formatNumberInput = (value: string): string => {
  // Remove tudo que não é número, ponto ou vírgula
  let cleaned = value.replace(/[^\d.,]/g, '');
  
  // Se tem ponto, converte para vírgula
  cleaned = cleaned.replace('.', ',');
  
  // Garante apenas uma vírgula
  const parts = cleaned.split(',');
  if (parts.length > 2) {
    cleaned = parts[0] + ',' + parts.slice(1).join('');
  }
  
  return cleaned;
};

export const parseNumberInput = (value: string): number => {
  if (!value) return 0;
  
  // Aceita tanto vírgula quanto ponto como separador decimal
  const normalized = value.replace(',', '.');
  const parsed = parseFloat(normalized);
  
  return isNaN(parsed) ? 0 : parsed;
};

export const formatNumberDisplay = (value: number): string => {
  return value.toString().replace('.', ',');
};
