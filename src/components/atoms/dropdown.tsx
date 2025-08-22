"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Dot } from "lucide-react";
import { RequestStatus } from "@/lib/types/request";

export interface DropdownProps {
  value: RequestStatus;
  onValueChange: (value: RequestStatus) => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const statusToName: Record<RequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  completed: "Completed",
  rejected: "Rejected",
};

const statusToStyles: Record<RequestStatus, { pill: string; dot: string }> = {
  pending: {
    pill: "bg-negative-fill text-negative-text", // your palette mapping
    dot: "text-negative-indicator",
  },
  approved: {
    pill: "bg-warning-fill text-warning-text",
    dot: "text-warning-indicator",
  },
  completed: {
    pill: "bg-success-fill text-success-text",
    dot: "text-success-indicator",
  },
  rejected: {
    pill: "bg-danger-fill text-danger-text",
    dot: "text-danger-indicator",
  },
};

export default function Dropdown({
  value,
  onValueChange,
  loading = false,
  disabled = false,
  className = "",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [menuWidth, setMenuWidth] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (!triggerRef.current) return;
    const ro = new ResizeObserver(() => {
      setMenuWidth(triggerRef.current!.getBoundingClientRect().width);
    });
    ro.observe(triggerRef.current);
    setMenuWidth(triggerRef.current.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const items = useMemo(
    () =>
      [
        RequestStatus.PENDING,
        RequestStatus.APPROVED,
        RequestStatus.COMPLETED,
        RequestStatus.REJECTED,
      ] as RequestStatus[],
    [],
  );
  const currentIndex = items.indexOf(value);

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (!open && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (open) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = items[(currentIndex + 1) % items.length];
        onValueChange(next);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev =
          items[(currentIndex - 1 + items.length) % items.length];
        onValueChange(prev);
      } else if (e.key === "Enter") {
        e.preventDefault();
        setOpen(false);
      }
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={`relative inline-block ${className}`}
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        onClick={() => !disabled && setOpen((s) => !s)}
        className={[
          "flex w-full items-center gap-3 rounded-md border border-gray-stroke px-2 py-2",
          "bg-white text-gray-900 transition",
          "hover:bg-primary-fill",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          loading ? "bg-warning-fill" : "",
        ].join(" ")}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className={[
            "flex items-center rounded-full pl-3 pr-4 py-1",
            "text-xs font-medium",
            statusToStyles[value].pill,
          ].join(" ")}
        >
          <Dot className={`-ml-1 mr-1.5 h-4 w-4 ${statusToStyles[value].dot}`} />
          {statusToName[value]}
        </span>
        <ChevronDown
          className={[
            "ml-auto h-4 w-4 shrink-0 text-gray-text transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden="true"
        />
      </button>

      {open && !disabled && (
        <div
          className={[
            "absolute left-0 z-50 mt-2 overflow-hidden rounded-xl border border-gray-stroke/60 bg-white shadow-lg",
          ].join(" ")}
          style={{ width: menuWidth }}
          role="listbox"
        >
          <ul className="max-h-64 overflow-y-auto p-2">
            {items.map((s) => {
              const isSelected = s === value;
              return (
                <li key={s} className="p-1">
                  <button
                    type="button"
                    onClick={() => {
                      onValueChange(s);
                      setOpen(false);
                    }}
                    className={[
                      "flex w-full items-center rounded-full px-3 py-2 text-left",
                      "text-xs font-medium transition",
                      statusToStyles[s].pill,
                      isSelected
                        ? "ring-2 ring-primary/50"
                        : "hover:ring-2 hover:ring-primary/30",
                      // keep pill compact and avoid huge blobs
                    ].join(" ")}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <Dot
                      className={`mr-2 h-4 w-4 ${statusToStyles[s].dot}`}
                      aria-hidden="true"
                    />
                    {statusToName[s]}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
