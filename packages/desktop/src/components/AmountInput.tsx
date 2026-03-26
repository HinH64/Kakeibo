import { useState, useCallback } from "react";
import { useCurrencyStore } from "../stores/currencyStore";

interface AmountInputProps {
  value: number;
  onChange: (value: number) => void;
  currencyCode: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function AmountInput({ value, onChange, currencyCode, disabled, autoFocus }: AmountInputProps) {
  const { getCurrency } = useCurrencyStore();
  const currency = getCurrency(currencyCode);
  const decimalPlaces = currency?.decimalPlaces ?? 0;

  const formatDisplay = (val: number) => {
    if (val === 0) return "";
    return val.toFixed(decimalPlaces);
  };

  const [display, setDisplay] = useState(formatDisplay(value));

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // Allow empty
      if (raw === "") {
        setDisplay("");
        onChange(0);
        return;
      }

      // Validate: only digits and optional one decimal point
      const regex = decimalPlaces > 0 ? /^\d*\.?\d*$/ : /^\d*$/;
      if (!regex.test(raw)) return;

      // Limit decimal places
      if (decimalPlaces > 0) {
        const parts = raw.split(".");
        if (parts[1] && parts[1].length > decimalPlaces) return;
      }

      setDisplay(raw);
      const num = parseFloat(raw) || 0;
      onChange(num);
    },
    [decimalPlaces, onChange],
  );

  const handleBlur = () => {
    const num = parseFloat(display) || 0;
    if (num > 0) {
      setDisplay(num.toFixed(decimalPlaces));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[18px] text-text-tertiary font-medium">{currency?.symbol ?? currencyCode}</span>
      <input
        type="text"
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder="0"
        className="flex-1 bg-transparent text-[28px] font-bold text-text-primary amount-large outline-none placeholder:text-text-muted"
      />
    </div>
  );
}
