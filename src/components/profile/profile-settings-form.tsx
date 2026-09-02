"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { useActionPending } from "@/components/shared/useActionPending";
import { updateProfileAction } from "@/app/actions/profile";
import { hexclaveClientApp } from "@/stack/client";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import type { Role } from "@/lib/auth/permissions";
import type { UserProfilePrefs } from "@/lib/data/user-profile";
import {
  Bell,
  LogOut,
  Mail,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileSettingsFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    roles: Role[];
  };
  prefs: UserProfilePrefs;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ProfileSettingsForm({ user, prefs }: ProfileSettingsFormProps) {
  const { pending, run } = useActionPending();
  const [phone, setPhone] = useState(prefs.phone);
  const [department, setDepartment] = useState(prefs.department);
  const [timezone, setTimezone] = useState(prefs.timezone);
  const [notifyEmail, setNotifyEmail] = useState(prefs.notifyEmail);
  const [notifyUrgentCases, setNotifyUrgentCases] = useState(
    prefs.notifyUrgentCases,
  );
  const [notifyAssignments, setNotifyAssignments] = useState(
    prefs.notifyAssignments,
  );
  const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(
    prefs.notifyWeeklyDigest,
  );
  const [saved, setSaved] = useState(false);

  const isDirty =
    phone !== prefs.phone ||
    department !== prefs.department ||
    timezone !== prefs.timezone ||
    notifyEmail !== prefs.notifyEmail ||
    notifyUrgentCases !== prefs.notifyUrgentCases ||
    notifyAssignments !== prefs.notifyAssignments ||
    notifyWeeklyDigest !== prefs.notifyWeeklyDigest;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await run(
      () =>
        updateProfileAction({
          phone,
          department,
          timezone,
          notifyEmail,
          notifyUrgentCases,
          notifyAssignments,
          notifyWeeklyDigest,
        }),
      { rewarm: ["/profile"] },
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4 lg:min-h-0 lg:flex-1 lg:flex-row lg:overflow-hidden">
      {/* Identity card */}
      <aside className="shrink-0 lg:w-72">
        <div className="rounded-xl border border-sage/25 bg-white p-5 shadow-card">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-evergreen to-evergreen/70 text-2xl font-bold text-white shadow-card">
              {initials(user.name)}
            </div>
            <h2 className="mt-4 text-lg font-bold text-graphite">{user.name}</h2>
            <p className="mt-0.5 text-sm text-graphite/55">{user.email}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {user.roles.map((role) => (
                <span
                  key={role}
                  className="rounded-full bg-evergreen/10 px-2.5 py-1 text-[11px] font-semibold text-evergreen"
                >
                  {ROLE_LABELS[role]}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-2 border-t border-sage/15 pt-4">
            <button
              type="button"
              onClick={() => void hexclaveClientApp.redirectToSignOut()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-sage/25 px-4 py-2.5 text-sm font-medium text-graphite/70 transition hover:border-rescue/30 hover:bg-rescue/5 hover:text-rescue"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Settings panels */}
      <div className="rc-scroll space-y-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        <section className="rounded-xl border border-sage/25 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-evergreen" />
            <div>
              <h3 className="text-sm font-semibold text-graphite">
                Personal information
              </h3>
              <p className="text-xs text-graphite/50">
                Contact details used for shelter operations
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="profile-email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite/40" />
                <Input
                  id="profile-email"
                  value={user.email}
                  disabled
                  className="h-10 rounded-xl pl-10 bg-bone/50"
                />
              </div>
              <p className="text-[11px] text-graphite/45">
                Managed by your sign-in provider
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-phone">Phone number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite/40" />
                <Input
                  id="profile-phone"
                  type="tel"
                  placeholder="+63 9XX XXX XXXX"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setSaved(false);
                  }}
                  className="h-10 rounded-xl pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-department">Department / team</Label>
              <Input
                id="profile-department"
                placeholder="e.g. Intake, Medical, Operations"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setSaved(false);
                }}
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="profile-timezone">Timezone</Label>
              <select
                id="profile-timezone"
                value={timezone}
                onChange={(e) => {
                  setTimezone(e.target.value);
                  setSaved(false);
                }}
                className="flex h-10 w-full rounded-xl border border-sage/30 bg-white px-3 text-sm text-graphite focus:border-evergreen focus:outline-none focus:ring-2 focus:ring-evergreen/20"
              >
                <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
                <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-sage/25 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-evergreen" />
            <div>
              <h3 className="text-sm font-semibold text-graphite">
                Notifications
              </h3>
              <p className="text-xs text-graphite/50">
                Choose what updates you receive
              </p>
            </div>
          </div>

          <div className="divide-y divide-sage/15">
            <div className="py-3 first:pt-0">
              <Toggle
                id="notify-email"
                checked={notifyEmail}
                onChange={(v) => {
                  setNotifyEmail(v);
                  setSaved(false);
                }}
                label="Email notifications"
                description="Receive case updates and daily summaries by email"
              />
            </div>
            <div className="py-3">
              <Toggle
                id="notify-urgent"
                checked={notifyUrgentCases}
                onChange={(v) => {
                  setNotifyUrgentCases(v);
                  setSaved(false);
                }}
                label="Urgent case alerts"
                description="Immediate alerts for critical and high-priority rescues"
              />
            </div>
            <div className="py-3">
              <Toggle
                id="notify-assignments"
                checked={notifyAssignments}
                onChange={(v) => {
                  setNotifyAssignments(v);
                  setSaved(false);
                }}
                label="Assignment updates"
                description="When rescuers are assigned or cases change status"
              />
            </div>
            <div className="py-3 last:pb-0">
              <Toggle
                id="notify-digest"
                checked={notifyWeeklyDigest}
                onChange={(v) => {
                  setNotifyWeeklyDigest(v);
                  setSaved(false);
                }}
                label="Weekly digest"
                description="Summary of shelter activity every Monday morning"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-sage/25 bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-evergreen" />
            <div>
              <h3 className="text-sm font-semibold text-graphite">Account security</h3>
              <p className="text-xs text-graphite/50">
                Password and authentication are managed securely
              </p>
            </div>
          </div>
          <p className="text-sm text-graphite/60">
            To change your password or manage connected accounts, use your
            organization&apos;s sign-in settings when signing out and back in.
          </p>
        </section>

        <div className="flex items-center justify-between rounded-xl border border-sage/20 bg-bone/40 px-4 py-3">
          <p
            className={cn(
              "text-xs",
              saved ? "text-evergreen font-medium" : "text-graphite/50",
            )}
          >
            {saved
              ? "Profile saved successfully"
              : isDirty
                ? "You have unsaved changes"
                : "All changes saved"}
          </p>
          <Button
            type="submit"
            disabled={pending || !isDirty}
            className="rounded-full px-6"
          >
            {pending ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </div>
    </form>
  );
}
