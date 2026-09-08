import { Phone, Mail, MessageSquare, Ban } from "lucide-react";
import { formatDateTime, formatStatus } from "@/lib/utils";
import { telHref } from "@/lib/maps/shelter-links";
import { cn } from "@/lib/utils";

export interface ReporterDetailsProps {
  name: string;
  contactPreference: string;
  phone?: string | null;
  email?: string | null;
  reportedAt?: string | null;
  className?: string;
}

function preferenceHint(preference: string): string {
  switch (preference) {
    case "phone":
      return "Prefers a phone call";
    case "email":
      return "Prefers email";
    case "in_app":
      return "Prefers in-app messages";
    case "no_contact":
      return "Asked not to be contacted unless needed";
    default:
      return formatStatus(preference);
  }
}

export function ReporterDetails({
  name,
  contactPreference,
  phone,
  email,
  reportedAt,
  className,
}: ReporterDetailsProps) {
  const phoneValue = phone?.trim() || "";
  const emailValue = email?.trim() || "";
  const phoneLink = phoneValue ? telHref(phoneValue) : null;
  const emailLink = emailValue ? `mailto:${emailValue}` : null;

  return (
    <div className={cn("space-y-3 text-sm", className)}>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-graphite/45">
          Name
        </p>
        <p className="mt-0.5 font-medium text-graphite">{name}</p>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-graphite/45">
          Preferred contact
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-graphite">
          {contactPreference === "phone" ? (
            <Phone className="h-3.5 w-3.5 shrink-0 text-evergreen" aria-hidden />
          ) : null}
          {contactPreference === "email" ? (
            <Mail className="h-3.5 w-3.5 shrink-0 text-evergreen" aria-hidden />
          ) : null}
          {contactPreference === "in_app" ? (
            <MessageSquare
              className="h-3.5 w-3.5 shrink-0 text-evergreen"
              aria-hidden
            />
          ) : null}
          {contactPreference === "no_contact" ? (
            <Ban className="h-3.5 w-3.5 shrink-0 text-graphite/50" aria-hidden />
          ) : null}
          {preferenceHint(contactPreference)}
        </p>
      </div>

      {phoneValue ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-graphite/45">
            Phone
          </p>
          <p className="mt-0.5 font-medium tabular-nums text-graphite">
            {phoneValue}
          </p>
        </div>
      ) : null}

      {emailValue ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-graphite/45">
            Email
          </p>
          <p className="mt-0.5 break-all text-graphite/80">{emailValue}</p>
        </div>
      ) : null}

      {phoneLink || emailLink ? (
        <div
          className={cn(
            "grid gap-2",
            phoneLink && emailLink ? "grid-cols-2" : "grid-cols-1",
          )}
        >
          {phoneLink ? (
            <a
              href={phoneLink}
              aria-label={`Call ${phoneValue}`}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-evergreen px-3 text-sm font-semibold text-white active:bg-evergreen/90"
            >
              <Phone className="h-4 w-4 shrink-0" aria-hidden />
              Call
            </a>
          ) : null}
          {emailLink ? (
            <a
              href={emailLink}
              aria-label={`Email ${emailValue}`}
              className={cn(
                "inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold",
                phoneLink
                  ? "border border-sage/30 bg-white text-evergreen active:bg-bone"
                  : "bg-evergreen text-white active:bg-evergreen/90",
              )}
            >
              <Mail className="h-4 w-4 shrink-0" aria-hidden />
              Email
            </a>
          ) : null}
        </div>
      ) : (
        <p className="rounded-xl bg-rescue/10 px-3 py-2 text-xs text-rescue">
          No phone or email is on file for this reporter. Ask shelter staff to
          update the profile.
        </p>
      )}

      {reportedAt ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-graphite/45">
            Reported
          </p>
          <p className="mt-0.5 text-graphite/80">{formatDateTime(reportedAt)}</p>
        </div>
      ) : null}
    </div>
  );
}
