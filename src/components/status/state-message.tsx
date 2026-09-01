import { cn } from "@/lib/utils";
import { AlertCircle, Loader2, Inbox, WifiOff, ShieldX } from "lucide-react";

type StateType = "loading" | "empty" | "error" | "offline" | "denied";

interface StateMessageProps {
  type: StateType;
  title?: string;
  message?: string;
  className?: string;
}

const defaults: Record<
  StateType,
  { icon: React.ReactNode; title: string; message: string }
> = {
  loading: {
    icon: <Loader2 className="h-8 w-8 animate-spin text-sage" />,
    title: "Loading",
    message: "Please wait...",
  },
  empty: {
    icon: <Inbox className="h-8 w-8 text-sage" />,
    title: "Nothing here yet",
    message: "No items to display.",
  },
  error: {
    icon: <AlertCircle className="h-8 w-8 text-rescue" />,
    title: "Something went wrong",
    message: "Please try again later.",
  },
  offline: {
    icon: <WifiOff className="h-8 w-8 text-ochre" />,
    title: "You're offline",
    message: "Check your connection and try again.",
  },
  denied: {
    icon: <ShieldX className="h-8 w-8 text-rescue" />,
    title: "Access denied",
    message: "You don't have permission to view this.",
  },
};

export function StateMessage({
  type,
  title,
  message,
  className,
}: StateMessageProps) {
  const d = defaults[type];
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 text-center",
        className,
      )}
    >
      {d.icon}
      <h3 className="font-medium text-graphite">{title ?? d.title}</h3>
      <p className="text-sm text-graphite/70 max-w-sm">
        {message ?? d.message}
      </p>
    </div>
  );
}
