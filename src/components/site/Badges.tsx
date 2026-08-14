import { BadgeCheck, Clock, ShieldAlert } from "lucide-react";

type Verification = "pending" | "verified" | "suspended";

export function VerificationBadge({ status }: { status: Verification }) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
        <BadgeCheck className="size-3.5" /> Verified
      </span>
    );
  }
  if (status === "suspended") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
        <ShieldAlert className="size-3.5" /> Suspended
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning-foreground">
      <Clock className="size-3.5" /> Pending verification
    </span>
  );
}

export type AvailabilityMode =
  | "live"
  | "verified_schedule"
  | "confirmation_required"
  | "unavailable";

const availabilityCopy: Record<AvailabilityMode, { dot: string; label: string }> = {
  live: { dot: "bg-success", label: "Live availability" },
  verified_schedule: { dot: "bg-info", label: "Verified schedule" },
  confirmation_required: { dot: "bg-warning", label: "Confirmation required" },
  unavailable: { dot: "bg-destructive", label: "Unavailable" },
};

export function AvailabilityBadge({ mode }: { mode: AvailabilityMode }) {
  const item = availabilityCopy[mode];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
      <span className={`size-2 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
}

export function DataSourceNote({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}