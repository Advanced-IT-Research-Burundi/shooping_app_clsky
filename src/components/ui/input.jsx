import { cn } from "./utils";

function Input({ className, type, icon, ...props }) {
  return (
    <div className="relative w-full">
      {icon && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
      )}

      <input
        type={type}
        data-slot="input"
        className={cn(
          "flex h-12 w-full rounded-2xl border border-gray-200 bg-white py-2 text-base",
          "px-4", // default padding
          icon && "pl-12", // extra left padding when icon exists
          "placeholder:text-gray-400",
          "shadow-sm",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
          "focus-visible:border-orange-400",
          "hover:border-gray-300",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export { Input };
