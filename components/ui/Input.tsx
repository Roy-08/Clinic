import type { ComponentProps, ReactNode } from "react";

export function Input({
  label,
  error,
  className = "",
  id,
  ...rest
}: ComponentProps<"input"> & { label?: string; error?: string }) {
  const inputId = id || rest.name;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-medium text-slate-600"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...rest}
        className={`h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#1e7fd6] focus:ring-2 focus:ring-[#1e7fd6]/20 ${className}`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  className = "",
  id,
  ...rest
}: ComponentProps<"textarea"> & { label?: string; error?: string }) {
  const inputId = id || rest.name;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-medium text-slate-600"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        {...rest}
        className={`min-h-[88px] w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-[#1e7fd6] focus:ring-2 focus:ring-[#1e7fd6]/20 ${className}`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function FormRow({ children }: { children: ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}