import React, { useState, useRef, useEffect } from "react";

type DropdownOption = {
  label: string;
  value: string;
};

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  label?: string;
  disabled?: boolean;
}

export default function Dropdown({
  options,
  value,
  placeholder = "Select...",
  onChange,
  label,
  disabled = false,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown if you click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selected = options.find((opt) => opt.value === value);

  const baseStyles =
    "w-full py-2 px-4 rounded-md border text-left bg-white transition";
  const disabledStyles = "bg-gray-100 text-gray-400 cursor-not-allowed";
  const activeStyles = "hover:bg-gray-100 cursor-pointer";

  return (
    <div ref={ref} className="relative w-full">
      {label && <label className="block mb-1">{label}</label>}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`${baseStyles} ${disabled ? disabledStyles : ""}`}
      >
        {selected ? selected.label : <span className="text-gray-400">{placeholder}</span>}
      </button>

      {open && !disabled && (
        <ul className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                onChange?.(opt.value);
                setOpen(false);
              }}
              className={`${activeStyles} px-4 py-2 ${
                value === opt.value ? "bg-primary-fill text-primary" : ""
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
