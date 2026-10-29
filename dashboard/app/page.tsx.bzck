"use client";

import { useCallback, useEffect, useState } from "react";

type ApiStatus = {
  status: "healthy" | "unhealthy" | "unavailable";
  version: string | null;
  environment: string | null;
  checkedAt: string | null;
  error: string | null;
};

const initialStatus: ApiStatus = {
  status: "unavailable",
  version: null,
  environment: null,
  checkedAt: null,
  error: null,
};

export default function Home() {
  const [api, setApi] = useState<ApiStatus>(initialStatus);
  const [loading, setLoading] = useState(true);

  const checkApi = useCallback(async () => {
    try {
      const response = await fetch("/api/status", {
        cache: "no-store",
      });

      const data = (await response.json()) as ApiStatus;
      setApi(data);
    } catch {
      setApi({
        status: "unavailable",
        version: null,
        environment: null,
        checkedAt: new Date().toISOString(),
        error: "Unable to contact the dashboard status endpoint.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  const initialCheck = window.setTimeout(() => {
    void checkApi();
  }, 0);

  const interval = window.setInterval(() => {
    void checkApi();
  }, 30_000);

  return () => {
    window.clearTimeout(initialCheck);
    window.clearInterval(interval);
  };
}, [checkApi]);

  const operational = api.status === "healthy";

  const statusLabel = loading
    ? "Checking..."
    : api.status === "healthy"
      ? "Operational"
      : api.status === "unhealthy"
        ? "Unhealthy"
        : "Monitoring unavailable";

  const statusColor =
    api.status === "healthy"
      ? "text-emerald-400"
      : api.status === "unhealthy"
        ? "text-red-400"
        : "text-amber-400";

  const statusBadgeColor =
    api.status === "healthy"
      ? "bg-emerald-400/10 text-emerald-300"
      : api.status === "unhealthy"
        ? "bg-red-400/10 text-red-300"
        : "bg-amber-400/10 text-amber-300";

  const checkedTime = api.checkedAt
    ? new Date(api.checkedAt).toLocaleTimeString("en-ZA", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Africa/Johannesburg",
      })
    : "Not checked yet";

  return (
    <main className="min-h-screen bg-[#0b1020] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#0d1426] p-6 md:block">
          <div className="mb-12">
            <div className="text-xl font-bold tracking-wide">
              SIMPLI<span className="text-cyan-400">CREATE</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              CLOUD &amp; PLATFORM ENGINEERING
            </p>
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>

          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-300">
            ◈ Platform Overview
          </div>

          <div className="mt-3 rounded-xl px-4 py-3 text-sm text-slate-400">
            ◉ Services
          </div>

          <div className="rounded-xl px-4 py-3 text-sm text-slate-400">
            ↗ Deployments
          </div>

          <div className="rounded-xl px-4 py-3 text-sm text-slate-400">
            ◷ Activity
          </div>

          <div className="absolute bottom-6 text-xs text-slate-600">
            SIMPLICREATE PLATFORM LAB
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5 md:px-10">
            <div>
              <p className="text-xs text-slate-500">SIMPLICREATE / WORKSPACE</p>
              <h1 className="mt-1 text-xl font-semibold md:text-2xl">
                Platform Overview
              </h1>
            </div>

            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  operational ? "bg-emerald-400" : "bg-red-400"
                }`}
              />
              <span className="text-sm text-slate-300">
                {api.environment ?? "Connecting to Azure"}
              </span>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
            <div>
              <p className="text-sm text-cyan-400">
                INFRASTRUCTURE AT A GLANCE
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                Your platform, at a glance.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Monitor the health of your services, deployment pipeline, and
                cloud platform from one central dashboard.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Services"
                value="01"
                caption="Live API connected"
              />
              <SummaryCard
                label="API Status"
                value={loading ? "..." : statusLabel}
                caption="Live health endpoint"
                accent={statusColor}
              />
              <SummaryCard
                label="Environment"
                value={api.environment ?? "Unknown"}
                caption="Reported by the API"
                accent="text-cyan-400"
                compact
              />
              <SummaryCard
                label="Last checked"
                value={api.checkedAt ? checkedTime : "Pending"}
                caption="Automatic checks every 30 seconds"
                compact
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
              <section className="rounded-2xl border border-white/10 bg-[#111a2e] p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">Service health</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Live status from Azure
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${statusBadgeColor}`}
                  >
                    {loading ? "Checking..." : statusLabel}
                  </span>
                </div>

                <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-lg text-cyan-300">
                        ◈
                      </div>
                      <div>
                        <p className="text-sm font-medium">Platform API</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Azure Container Apps
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-sm ${statusColor}`}>
                        ● {statusLabel}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {loading
                          ? "Checking health endpoint..."
                          : api.status === "healthy"
                            ? "Health endpoint reports healthy"
                            : (api.error ?? "API is not reporting healthy")}
                      </p>
                    </div>
                  </div>
                </div>

                {api.error && (
                  <div
                    role="status"
                    className={`mt-4 rounded-xl border p-4 text-sm ${
                      api.status === "unhealthy"
                        ? "border-red-400/20 bg-red-400/5 text-red-300"
                        : api.status === "unavailable"
                          ? "border-amber-400/20 bg-amber-400/5 text-amber-300"
                          : "border-cyan-400/20 bg-cyan-400/5 text-cyan-300"
                    }`}
                  >
                    <p className="mb-1 font-medium">
                      {api.status === "unhealthy"
                        ? "Service health issue"
                        : api.status === "unavailable"
                          ? "Monitoring issue"
                          : "Monitoring warning"}
                    </p>
                    <p>{api.error}</p>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">
                    Last checked: {checkedTime}
                  </p>
                  <button
                    onClick={() => {
                      setLoading(true);
                      void checkApi();
                    }}
                    disabled={loading}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Checking..." : "Check now ↻"}
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-[#111a2e] p-6">
                <h3 className="text-lg font-semibold">Platform details</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Information reported by your deployment
                </p>

                <div className="mt-6 space-y-5">
                  <DetailRow label="Cloud provider" value="Microsoft Azure" />
                  <DetailRow label="Compute" value="Azure Container Apps" />
                  <DetailRow
                    label="Environment"
                    value={api.environment ?? "Unknown"}
                  />
                  <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3">
                    <span className="text-sm text-slate-400">
                      Deployment version
                    </span>

                    {api.version ? (
                      <button
                        type="button"
                        title={`Full version: ${api.version}`}
                        onClick={() =>
                          navigator.clipboard.writeText(api.version!)
                        }
                        className="max-w-[60%] truncate rounded-md border border-white/10 px-3 py-1.5 font-mono text-xs text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/5"
                      >
                        {api.version.slice(0, 12)}…{" "}
                        <span className="font-sans">Copy</span>
                      </button>
                    ) : (
                      <span className="text-sm text-slate-400">
                        Unavailable
                      </span>
                    )}
                  </div>
                  <DetailRow label="Source control" value="GitHub" />
                  <DetailRow label="Infrastructure" value="Terraform" />
                </div>

                <div className="mt-7 rounded-xl border border-cyan-400/15 bg-cyan-400/5 p-4">
                  <p className="text-sm font-medium text-cyan-300">
                    Live monitoring enabled
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    The API status and deployment version are retrieved from
                    Azure and refreshed automatically every 30 seconds.
                  </p>
                </div>
              </section>
            </div>

            <footer className="flex flex-wrap justify-between gap-2 border-t border-white/10 pt-5 text-xs text-slate-600">
              <span>Simplicreate Platform Lab</span>
              <span>Platform Operations Dashboard</span>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  caption,
  accent = "text-white",
  compact = false,
}: {
  label: string;
  value: string;
  caption: string;
  accent?: string;
  compact?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-[#111a2e] p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p
        className={`mt-4 break-words font-semibold tracking-tight ${accent} ${
          compact ? "text-lg" : "text-2xl"
        }`}
      >
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-500">{caption}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  breakWord = false,
}: {
  label: string;
  value: string;
  breakWord?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
      <span className="text-sm text-slate-400">{label}</span>
      <span
        className={`max-w-[65%] text-right text-sm font-medium text-slate-200 ${
          breakWord ? "break-all" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
