'use client';

import { useState, useCallback } from 'react';
import { formatNumber } from '@/lib/utils/format';

export type Operation = '+' | '-' | '×' | '÷' | null;

export interface UseCalculatorOptions {
  initialValue?: string;
}

export interface UseCalculatorReturn {
  displayValue: string;
  previousValue: string | null;
  operation: Operation;
  formatDisplay: (val: string) => string;
  handleNumber: (num: string) => void;
  handleDecimal: () => void;
  handleOperation: (op: Operation) => void;
  handleEquals: () => void;
  handleClear: () => void;
  handleBackspace: () => void;
  setDisplayValue: (value: string) => void;
  reset: () => void;
}

export function useCalculator(options: UseCalculatorOptions = {}): UseCalculatorReturn {
  const { initialValue = '0' } = options;

  const [displayValue, setDisplayValue] = useState(initialValue);
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);

  const calculate = useCallback(() => {
    if (!previousValue || !operation) return displayValue;

    const prev = parseFloat(previousValue);
    const current = parseFloat(displayValue);

    let result: number;
    switch (operation) {
      case '+': result = prev + current; break;
      case '-': result = prev - current; break;
      case '×': result = prev * current; break;
      case '÷': result = current !== 0 ? prev / current : 0; break;
      default: return displayValue;
    }

    return result.toString();
  }, [previousValue, displayValue, operation]);

  const handleNumber = useCallback((num: string) => {
    let newValue: string;

    if (shouldResetDisplay || displayValue === '0') {
      newValue = num;
      setShouldResetDisplay(false);
    } else {
      if (displayValue.replace('.', '').length >= 12) return;
      newValue = displayValue + num;
    }

    setDisplayValue(newValue);
  }, [shouldResetDisplay, displayValue]);

  const handleDecimal = useCallback(() => {
    if (shouldResetDisplay) {
      setDisplayValue('0.');
      setShouldResetDisplay(false);
      return;
    }
    if (displayValue.includes('.')) return;
    setDisplayValue(displayValue + '.');
  }, [shouldResetDisplay, displayValue]);

  const handleOperation = useCallback((op: Operation) => {
    if (previousValue && operation && !shouldResetDisplay) {
      const result = calculate();
      setDisplayValue(result);
      setPreviousValue(result);
    } else {
      setPreviousValue(displayValue);
    }
    setOperation(op);
    setShouldResetDisplay(true);
  }, [previousValue, operation, shouldResetDisplay, calculate, displayValue]);

  const handleEquals = useCallback(() => {
    if (!previousValue || !operation) return;

    const result = calculate();
    setDisplayValue(result);
    setPreviousValue(null);
    setOperation(null);
    setShouldResetDisplay(true);
  }, [previousValue, operation, calculate]);

  const handleClear = useCallback(() => {
    setDisplayValue('0');
    setPreviousValue(null);
    setOperation(null);
    setShouldResetDisplay(false);
  }, []);

  const handleBackspace = useCallback(() => {
    if (shouldResetDisplay || displayValue === '0' || displayValue.length === 1) {
      setDisplayValue('0');
      return;
    }
    setDisplayValue(displayValue.slice(0, -1) || '0');
  }, [shouldResetDisplay, displayValue]);

  const formatDisplay = useCallback((val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '0';
    if (val.endsWith('.')) return formatNumber(num) + '.';
    if (val.includes('.')) {
      const parts = val.split('.');
      return formatNumber(parseFloat(parts[0])) + '.' + parts[1];
    }
    return formatNumber(num);
  }, []);

  const reset = useCallback(() => {
    setDisplayValue('0');
    setPreviousValue(null);
    setOperation(null);
    setShouldResetDisplay(false);
  }, []);

  return {
    displayValue,
    previousValue,
    operation,
    formatDisplay,
    handleNumber,
    handleDecimal,
    handleOperation,
    handleEquals,
    handleClear,
    handleBackspace,
    setDisplayValue,
    reset,
  };
}
