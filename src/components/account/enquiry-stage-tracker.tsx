import { Check } from "lucide-react";

import { installationStages, type InstallationDetails } from "@/lib/admin-leads";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function EnquiryStageTracker({
  installation,
}: {
  installation: InstallationDetails;
}) {
  const currentIndex = installationStages.indexOf(installation.stage);

  const details = [
    installation.surveyDate && {
      label: "Survey",
      value: formatDate(installation.surveyDate),
    },
    installation.grantStatus && {
      label: "OZEV grant",
      value: installation.grantStatus,
    },
    installation.installDate && {
      label: "Installed on",
      value: formatDate(installation.installDate),
    },
    installation.engineer && {
      label: "Engineer",
      value: installation.engineer,
    },
  ].filter((detail): detail is { label: string; value: string } => Boolean(detail));

  return (
    <div className="mt-4 border-t border-border pt-4">
      <ol className="flex items-center">
        {installationStages.map((stage, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li key={stage} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    done && "bg-primary text-primary-foreground",
                    active && "bg-accent text-accent-foreground",
                    !done && !active && "bg-muted text-muted-foreground"
                  )}
                >
                  {done ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "max-w-20 text-[0.7rem] leading-tight",
                    active
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {stage}
                </span>
              </div>
              {index < installationStages.length - 1 && (
                <span
                  className={cn(
                    "mx-1 h-0.5 flex-1 rounded-full",
                    done ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {details.length > 0 && (
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt className="text-xs text-muted-foreground">{detail.label}</dt>
              <dd className="text-sm font-medium text-foreground">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
