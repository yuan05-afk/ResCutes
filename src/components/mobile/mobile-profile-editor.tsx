"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionPending } from "@/components/shared/useActionPending";
import { updateProfileAction } from "@/app/actions/profile";
import { validatePhoneRequired } from "@/lib/forms/animal-field-options";

export function MobileProfileEditor({
  initialPhone,
}: {
  initialPhone?: string | null;
}) {
  const { pending, error, setError, run } = useActionPending();
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    setError(null);
    const phoneErr = validatePhoneRequired(phone);
    if (phoneErr) {
      setError(phoneErr);
      return;
    }
    const ok = await run(
      () => updateProfileAction({ phone: phone.trim() }),
      { rewarm: ["/mobile/profile"] },
    );
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="space-y-3 rounded-2xl border border-sage/25 bg-white p-5 shadow-card"
    >
      <div>
        <h3 className="text-sm font-semibold text-graphite">Contact</h3>
        <p className="mt-0.5 text-xs leading-snug text-graphite/55">
          Required so rescuers and shelter staff can reach you.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="mobile-phone">Phone</Label>
        <Input
          id="mobile-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setError(null);
          }}
          placeholder="+63 9XX XXX XXXX"
          className="h-11 rounded-xl"
        />
      </div>
      {error ? (
        <p className="text-xs text-rescue" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="text-xs text-evergreen" role="status">
          Profile saved.
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-full"
      >
        {pending ? "Saving..." : "Save contact"}
      </Button>
    </form>
  );
}
