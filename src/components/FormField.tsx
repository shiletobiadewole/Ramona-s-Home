import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function FormField({
  id,
  label,
  required = false,
  hint,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[#151513]"
      >
        {label}
        {required ? (
          <span className="ml-1 text-[#57482D]" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-2 text-xs font-normal text-[#534F46]">
            Optional
          </span>
        )}
      </label>

      {children}

      {hint && (
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-[#534F46]">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-start gap-2 text-xs sm:text-sm font-medium text-[#9B1C1C]"
        >
          <AlertCircle
            className="w-4 h-4 shrink-0 mt-0.5 text-[#9B1C1C]"
            aria-hidden="true"
          />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
