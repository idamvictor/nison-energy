"use client";

import { useEffect, useRef, useState } from "react";

// Keeps an OZEV guide's progress across the sign-in detour: when a signed-out
// customer hits "Generate My Quote", the guide saves its state (answers,
// charger, works rows, …) plus every named form field to sessionStorage, the
// sign-in page sends them back here, and the guide restores it all — then
// submits the form once by itself, so the quote is made without a 2nd click.

const PREFIX = "ozev-guide-draft:";
const MAX_AGE_MS = 2 * 60 * 60 * 1000; // stale after 2 hours
const SKIP_FIELDS = new Set(["company_website"]); // honeypot

type Draft<S> = {
  state: S;
  fields: Record<string, string>;
  savedAt: number;
  /** Generate the quote automatically once they're back and signed in. */
  autoSubmit?: boolean;
};

function readDraft<S>(key: string): Draft<S> | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Draft<S>;
    if (Date.now() - draft.savedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(PREFIX + key);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function useGuideDraft<S>({
  key,
  onRestore,
  autoSubmit = false,
}: {
  /** One per guide, e.g. "renters". */
  key: string;
  /** Put the saved guide state back (called once, on mount). */
  onRestore: (state: S) => void;
  /** True once the customer is signed in (the session loads after mount). */
  autoSubmit?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const pendingFields = useRef<Record<string, string> | null>(null);
  const onRestoreRef = useRef(onRestore);
  const [restored, setRestored] = useState(false);
  // Set once the restored fields are back in the form, if the draft asked for it.
  const [readyToSubmit, setReadyToSubmit] = useState(false);
  const wantsSubmit = useRef(false);

  // Restore on mount (sessionStorage isn't available during SSR).
  useEffect(() => {
    const draft = readDraft<S>(key);
    if (!draft) return;
    onRestoreRef.current(draft.state);
    pendingFields.current = draft.fields;
    wantsSubmit.current = draft.autoSubmit === true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off restore from sessionStorage
    setRestored(true);
  }, [key]);

  // The form only renders once the restored answers pass eligibility, so fill
  // its fields (uncontrolled inputs) on the first commit where it exists.
  // Runs every commit on purpose; the body only acts once (pendingFields).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const form = formRef.current;
    const fields = pendingFields.current;
    if (!form || !fields) return;
    pendingFields.current = null;
    for (const [name, value] of Object.entries(fields)) {
      const el = form.elements.namedItem(name);
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
        el.value = value;
      }
    }
    if (wantsSubmit.current) setReadyToSubmit(true);
    // After the guide's own "scroll to the guide" animation.
    window.setTimeout(() => form.scrollIntoView({ behavior: "smooth", block: "start" }), 450);
  });

  // Submit once: fields are back and the session has loaded. The flag is
  // cleared first so a refresh or a failed attempt never fires it again.
  useEffect(() => {
    if (!readyToSubmit || !autoSubmit || !wantsSubmit.current) return;
    wantsSubmit.current = false;
    try {
      const draft = readDraft<S>(key);
      if (draft) sessionStorage.setItem(PREFIX + key, JSON.stringify({ ...draft, autoSubmit: false }));
    } catch {
      // ignore
    }
    // Let the restored charger / works state render before submitting.
    window.setTimeout(() => formRef.current?.requestSubmit(), 600);
  }, [readyToSubmit, autoSubmit, key]);

  /** Save everything before sending the customer to sign in. */
  function saveDraft(state: S) {
    const fields: Record<string, string> = {};
    if (formRef.current) {
      for (const [name, value] of new FormData(formRef.current)) {
        if (typeof value === "string" && !SKIP_FIELDS.has(name)) fields[name] = value;
      }
    }
    try {
      sessionStorage.setItem(PREFIX + key, JSON.stringify({ state, fields, savedAt: Date.now(), autoSubmit: true }));
    } catch {
      // Storage blocked (private mode) — the customer just re-enters details.
    }
  }

  /** Forget the draft once the quote has been generated. */
  function clearDraft() {
    try {
      sessionStorage.removeItem(PREFIX + key);
    } catch {
      // ignore
    }
    setRestored(false);
  }

  return { formRef, restored, saveDraft, clearDraft };
}
