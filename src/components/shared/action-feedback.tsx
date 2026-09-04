import { cn } from "@/lib/utils";

interface ActionFeedbackProps {
  error?: string | null;
  success?: string | null;
  className?: string;
  size?: "sm" | "md";
}

export function ActionFeedback({
  error,
  success,
  className,
  size = "sm",
}: ActionFeedbackProps) {
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <>
      {error ? (
        <p
          role="alert"
          className={cn(
            "rounded-lg border border-rescue/25 bg-rescue/8 px-2.5 py-2 text-rescue",
            textClass,
            className,
          )}
        >
          {error}
        </p>
      ) : null}
      {success ? (
        <p
          role="status"
          className={cn(
            "rounded-lg border border-evergreen/25 bg-evergreen/8 px-2.5 py-2 font-medium text-evergreen",
            textClass,
            className,
          )}
        >
          {success}
        </p>
      ) : null}
    </>
  );
}
