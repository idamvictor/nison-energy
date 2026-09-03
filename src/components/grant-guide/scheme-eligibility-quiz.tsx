"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { AlertTriangle, ArrowRight, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuizOption = { label: string; value: string };
export type QuizQuestion = { key: string; label: string; options: QuizOption[] };

export type QuizOutcome =
  | { status: "pass" }
  | { status: "warn"; message: ReactNode; actions?: ReactNode }
  | { status: "fail"; message: ReactNode; actions?: ReactNode };

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-foreground/80 hover:border-primary/40"
      )}
    >
      {label}
    </button>
  );
}

// Generic, config-driven eligibility quiz shared by every grant flow —
// same pill UI/interaction across all schemes, only the questions and
// pass/warn/fail evaluation differ.
export function SchemeEligibilityQuiz({
  questions,
  evaluate,
  onPass,
}: {
  questions: QuizQuestion[];
  evaluate: (answers: Record<string, string>) => QuizOutcome | null;
  onPass: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(questions.map((q) => [q.key, null]))
  );

  function handleAnswer(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  const allAnswered = questions.every((q) => answers[q.key]);
  const outcome = allAnswered
    ? evaluate(Object.fromEntries(questions.map((q) => [q.key, answers[q.key]!])))
    : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-7">
      <div className="flex flex-col gap-5">
        {questions.map((question) => (
          <div key={question.key}>
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {question.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {question.options.map((option) => (
                <Pill
                  key={option.value}
                  label={option.label}
                  active={answers[question.key] === option.value}
                  onClick={() => handleAnswer(question.key, option.value)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {outcome && outcome.status !== "pass" && (
        <>
          <div
            className={cn(
              "mt-5 flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm",
              outcome.status === "warn" && "border-accent/30 bg-accent/5",
              outcome.status === "fail" && "border-destructive/30 bg-destructive/5"
            )}
          >
            {outcome.status === "warn" && (
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent" />
            )}
            {outcome.status === "fail" && <X className="mt-0.5 size-4 shrink-0 text-destructive" />}
            <p className="text-foreground/80">{outcome.message}</p>
          </div>
          {outcome.actions && (
            <div className="mt-4 flex flex-wrap gap-3">{outcome.actions}</div>
          )}
        </>
      )}

      {outcome && outcome.status === "pass" && (
        <>
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 px-4 py-3.5 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-success" />
            <p className="text-foreground/80">
              You&apos;re likely eligible — nothing is charged until OZEV
              approves.
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={onPass} className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90">
              Next
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
