import { Settings } from "lucide-react";

import ThemeToggle from "@/app/_components/ThemeToggle";

export default function SettingsPage() {
  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-background px-5 py-8 text-foreground sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Settings className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your Siteon workspace preferences.
            </p>
          </div>
        </div>

        <section className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div>
            <h2 className="font-medium">Appearance</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose how Siteon looks across your workspace.
            </p>
          </div>
          <ThemeToggle />
        </section>
      </div>
    </main>
  );
}
