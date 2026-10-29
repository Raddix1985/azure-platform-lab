"use client";

import { useCallback, useEffect, useState } from "react";

type ApiStatus = {
  status: "healthy" | "unhealthy" | "unavailable";
  version: string | null;
  environment: string | null;
  checkedAt: string | null;
  error: string | null;
};

type Section = "overview" | "services" | "deployments" | "activity";

type ActivityEntry = {
  id: string;
  checkedAt: string;
  status: ApiStatus["status"];
  message: string;
  version: string | null;
  responseTimeMs: number;
};

const initialStatus: ApiStatus = {
  status: "unavailable",
  version: null,
  environment: null,
  checkedAt: null,
  error: null,
};

const navItems: { id: Section; label: string }[] = [
  { id: "overview", label: "Platform Overview" },
  { id: "services", label: "Services" },
  { id: "deployments", label: "Deployments" },
  { id: "activity", label: "Activity" },
];

const sectionCopy: Record<
  Section,
  { title: string; eyebrow: string; description: string }
> = {
  overview: {
    title: "Platform Overview",
    eyebrow: "INFRASTRUCTURE AT A GLANCE",
    description:
      "Monitor the health of your services and cloud platform from one central dashboard.",
  },
  services: {
    title: "Services",
    eyebrow: "SERVICE INVENTORY",
    description:
      "Review the services connected to this dashboard and their reported health.",
  },
  deployments: {
    title: "Deployments",
    eyebrow: "DEPLOYMENT INFORMATION",
    description:
      "Inspect the version and environment reported by the running Platform API.",
  },
  activity: {
    title: "Activity",
    eyebrow: "SESSION HEALTH ACTIVITY",
    description:
      "Review health checks recorded during this browser session. This is not an Azure audit log.",
  },
};

function formatDate(value: string | null): string {
  if (!value) return "Not checked yet";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusLabel(status: ApiStatus["status"]): string {
  switch (status) {
    case "healthy":
      return "Healthy";
    case "unhealthy":
      return "Unhealthy";
    default:
      return "Unavailable";
  }
}

function StatusBadge({ status }: { status: ApiStatus["status"] }) {
  const styles: Record<ApiStatus["status"], string> = {
    healthy: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    unhealthy: "border-rose-400/20 bg-rose-400/10 text-rose-300",
    unavailable: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  };

  const dotStyles: Record<ApiStatus["status"], string> = {
    healthy: "bg-emerald-300",
    unhealthy: "bg-rose-300",
    unavailable: "bg-amber-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[status]}`} />
      {statusLabel(status)}
    </span>
  );
}

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-black/10 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          {description && (
            <p className="mt-1 text-sm leading-6 text-slate-400">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function MetricCard({
  label,
  value,
  detail,
  marker,
}: {
  label: string;
  value: string;
  detail: string;
  marker: "cyan" | "green" | "purple";
}) {
  const markerStyles = {
    cyan: "bg-cyan-300",
    green: "bg-emerald-300",
    purple: "bg-violet-300",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-black/10">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <span className={`h-2 w-2 rounded-full ${markerStyles[marker]}`} />
      </div>
      <p className="mt-4 break-words text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}

export default function Home() {
  const [api, setApi] = useState<ApiStatus>(initialStatus);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [copyMessage, setCopyMessage] = useState("");

  const checkApi = useCallback(async () => {
    let result: ApiStatus;
    const startTime = performance.now();

    try {
      const response = await fetch("/api/status", {
        cache: "no-store",
      });

      const data = (await response.json()) as ApiStatus;
      result = data;

      if (!response.ok && data.status !== "unavailable") {
        result = {
          ...data,
          status: "unavailable",
          error:
            data.error ?? `Status endpoint returned HTTP ${response.status}.`,
        };
      }
    } catch {
      result = {
        status: "unavailable",
        version: null,
        environment: null,
        checkedAt: new Date().toISOString(),
        error: "Unable to contact the dashboard status endpoint.",
      };
    }

    if (!result.checkedAt) {
      result = {
        ...result,
        checkedAt: new Date().toISOString(),
      };
    }

    const responseTimeMs = Math.round(performance.now() - startTime);

    setApi(result);

    setActivity((previous) =>
      [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          checkedAt: result.checkedAt!,
          status: result.status,
          message:
            result.error ??
            (result.status === "healthy"
              ? "Health endpoint reports healthy."
              : result.status === "unhealthy"
                ? "Health endpoint reports unhealthy."
                : "API status is unavailable."),
          version: result.version,
          responseTimeMs,
        },
        ...previous,
      ].slice(0, 50),
    );

    setLoading(false);
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

  async function copyVersion() {
    if (!api.version) return;

    try {
      await navigator.clipboard.writeText(api.version);
      setCopyMessage("Version copied");
    } catch {
      setCopyMessage("Clipboard access unavailable");
    }

    window.setTimeout(() => setCopyMessage(""), 2500);
  }

  const totalChecks = activity.length;

  const successfulChecks = activity.filter(
    (entry) => entry.status === "healthy",
  ).length;

  const failedChecks = activity.filter(
    (entry) => entry.status === "unhealthy" || entry.status === "unavailable",
  ).length;

  const averageResponseTimeMs =
  activity.length > 0
    ? Math.round(
        activity.reduce(
          (total, entry) => total + entry.responseTimeMs,
          0,
        ) / activity.length,
      )
    : null;

  const currentSection = sectionCopy[activeSection];
  const lastChecked = formatDate(api.checkedAt);

  const operationalLabel =
    api.status === "healthy"
      ? "Operational"
      : api.status === "unhealthy"
        ? "Needs attention"
        : "Awaiting connection";

  function refreshButton() {
    return (
      <button
        type="button"
        onClick={() => {
          setLoading(true);
          void checkApi();
        }}
        disabled={loading}
        className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? "Checking..." : "Check now"}
      </button>
    );
  }

  return (
    <main className="min-h-screen bg-[#070d19] text-slate-100">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#090f1d] px-5 py-6 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300 font-black tracking-tight text-slate-950">
              SC
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide text-white">
                SimpliCreate
              </p>
              <p className="mt-0.5 text-xs text-slate-500">Platform Console</p>
            </div>
          </div>

          <p className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Workspace
          </p>

          <nav aria-label="Main navigation" className="mt-3 space-y-1">
            {navItems.map((item, index) => {
              const selected = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  aria-current={selected ? "page" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${
                    selected
                      ? "border-cyan-300/15 bg-cyan-300/10 font-semibold text-cyan-200"
                      : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold ${
                      selected
                        ? "bg-cyan-300/15 text-cyan-200"
                        : "bg-white/5 text-slate-500"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  api.status === "healthy"
                    ? "bg-emerald-300"
                    : api.status === "unhealthy"
                      ? "bg-rose-300"
                      : "bg-amber-200"
                }`}
              />
              <p className="text-xs font-semibold text-slate-200">
                API {operationalLabel.toLowerCase()}
              </p>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Automatic health checks every 30 seconds.
            </p>
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <header className="border-b border-white/10 bg-[#090f1d]/90 px-4 py-4 backdrop-blur sm:px-7 lg:px-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300 text-xs font-black text-slate-950">
                  SC
                </div>
                <div>
                  <p className="text-sm font-bold text-white">SimpliCreate</p>
                  <p className="text-xs text-slate-500">Platform Console</p>
                </div>
              </div>

              <div className="hidden lg:block">
                <p className="text-xs text-slate-500">Workspace / Platform</p>
                <p className="mt-1 text-sm font-semibold text-slate-200">
                  Cloud operations
                </p>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-slate-500">Last checked</p>
                  <p className="mt-1 text-xs font-medium text-slate-300">
                    {lastChecked}
                  </p>
                </div>
                {refreshButton()}
              </div>
            </div>

            {/* Mobile navigation */}
            <nav
              aria-label="Mobile navigation"
              className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden"
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  aria-current={activeSection === item.id ? "page" : undefined}
                  className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    activeSection === item.id
                      ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-100"
                      : "border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </header>

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-7 sm:py-10 lg:px-10">
            <div className="mb-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
                {currentSection.eyebrow}
              </p>

              <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {currentSection.title}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                    {currentSection.description}
                  </p>
                </div>
                <StatusBadge status={api.status} />
              </div>
            </div>

            {/* PLATFORM OVERVIEW */}
            {activeSection === "overview" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    label="Platform API"
                    value={operationalLabel}
                    detail="Latest health endpoint response"
                    marker={api.status === "healthy" ? "green" : "cyan"}
                  />
                  <MetricCard
                    label="API version"
                    value={
                      api.version ? `${api.version.slice(0, 12)}…` : "Unknown"
                    }
                    detail="Reported by the running API"
                    marker="purple"
                  />
                  <MetricCard
                    label="Environment"
                    value={api.environment ?? "Unknown"}
                    detail="Runtime environment reported by the API"
                    marker="cyan"
                  />
                  <MetricCard
                    label="Health checks"
                    value="30 sec"
                    detail="Automatic refresh interval"
                    marker="green"
                  />
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
                  <Panel
                    title="Service health"
                    description="Current status of the service connected to this dashboard."
                    action={<StatusBadge status={api.status} />}
                  >
                    <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/10 text-xs font-bold text-cyan-200">
                          API
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            Platform API
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Health and version endpoints
                          </p>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-sm font-medium text-slate-200">
                          {operationalLabel}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Checked {lastChecked}
                        </p>
                      </div>
                    </div>

                    {api.error && (
                      <div
                        role="status"
                        className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/5 px-4 py-3 text-sm leading-6 text-amber-100"
                      >
                        {api.error}
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                      <span>Updates automatically every 30 seconds.</span>
                      <button
                        type="button"
                        onClick={() => setActiveSection("services")}
                        className="font-semibold text-cyan-200 hover:text-cyan-100"
                      >
                        View service details
                      </button>
                    </div>
                  </Panel>

                  <Panel
                    title="Platform details"
                    description="Runtime information returned by the API."
                  >
                    <dl className="divide-y divide-white/10">
                      <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
                        <dt className="text-sm text-slate-400">Version</dt>
                        <dd className="flex items-center gap-2 text-sm font-medium text-white">
                          <span>{api.version ?? "Not reported"}</span>
                          {api.version && (
                            <button
                              type="button"
                              onClick={() => void copyVersion()}
                              className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-semibold text-slate-300 hover:bg-white/5"
                              aria-label="Copy API version"
                            >
                              Copy
                            </button>
                          )}
                        </dd>
                      </div>

                      <div className="flex items-center justify-between gap-4 py-3">
                        <dt className="text-sm text-slate-400">Environment</dt>
                        <dd className="text-sm font-medium text-white">
                          {api.environment ?? "Not reported"}
                        </dd>
                      </div>

                      <div className="flex items-center justify-between gap-4 py-3">
                        <dt className="text-sm text-slate-400">Last checked</dt>
                        <dd className="text-right text-sm font-medium text-white">
                          {lastChecked}
                        </dd>
                      </div>

                      <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
                        <dt className="text-sm text-slate-400">Refresh</dt>
                        <dd className="text-sm font-medium text-white">
                          Every 30 seconds
                        </dd>
                      </div>
                    </dl>

                    {copyMessage && (
                      <p role="status" className="mt-3 text-xs text-cyan-200">
                        {copyMessage}
                      </p>
                    )}
                  </Panel>
                </div>
              </>
            )}

            {/* SERVICES */}
            {activeSection === "services" && (
              <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
                <Panel
                  title="Connected services"
                  description="Services with configured status reporting."
                  action={<StatusBadge status={api.status} />}
                >
                  <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/10 text-xs font-bold text-cyan-200">
                          API
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">
                            Platform API
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            Application health and version reporting
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={api.status} />
                    </div>

                    <dl className="mt-5 grid gap-4 border-t border-white/10 pt-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-slate-500">Version</dt>
                        <dd className="mt-1 text-sm font-medium text-slate-200">
                          {api.version ?? "Not reported"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Environment</dt>
                        <dd className="mt-1 text-sm font-medium text-slate-200">
                          {api.environment ?? "Not reported"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Last checked</dt>
                        <dd className="mt-1 text-sm font-medium text-slate-200">
                          {lastChecked}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">
                          Check interval
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-200">
                          30 seconds
                        </dd>
                      </div>
                    </dl>

                    {api.error && (
                      <p className="mt-4 text-sm leading-6 text-amber-200">
                        {api.error}
                      </p>
                    )}
                  </div>
                </Panel>

                <Panel
                  title="Monitoring scope"
                  description="What this dashboard currently monitors."
                >
                  <ul className="space-y-3 text-sm leading-6 text-slate-300">
                    <li className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                      Platform API health response
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                      API version and runtime environment
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                      Browser-session health-check activity
                    </li>
                  </ul>

                  <p className="mt-5 rounded-xl border border-amber-300/15 bg-amber-300/5 p-4 text-xs leading-5 text-amber-100">
                    Other Azure resources are not automatically monitored by
                    this page unless additional integrations are configured.
                  </p>
                </Panel>
              </div>
            )}

            {/* DEPLOYMENTS */}
            {activeSection === "deployments" && (
              <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
                <Panel
                  title="Running API details"
                  description="Values reported by the live Platform API."
                  action={<StatusBadge status={api.status} />}
                >
                  <dl className="divide-y divide-white/10">
                    <div className="grid gap-2 py-4 first:pt-0 sm:grid-cols-[160px_1fr]">
                      <dt className="text-sm text-slate-400">Application</dt>
                      <dd className="text-sm font-medium text-white">
                        Platform API
                      </dd>
                    </div>
                    <div className="grid gap-2 py-4 sm:grid-cols-[160px_1fr]">
                      <dt className="text-sm text-slate-400">
                        Reported version
                      </dt>
                      <dd className="break-words text-sm font-medium text-white">
                        {api.version ?? "Not reported"}
                      </dd>
                    </div>
                    <div className="grid gap-2 py-4 sm:grid-cols-[160px_1fr]">
                      <dt className="text-sm text-slate-400">Environment</dt>
                      <dd className="text-sm font-medium text-white">
                        {api.environment ?? "Not reported"}
                      </dd>
                    </div>
                    <div className="grid gap-2 py-4 last:pb-0 sm:grid-cols-[160px_1fr]">
                      <dt className="text-sm text-slate-400">
                        Last status check
                      </dt>
                      <dd className="text-sm font-medium text-white">
                        {lastChecked}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5">{refreshButton()}</div>
                </Panel>

                <Panel
                  title="Deployment visibility"
                  description="Current data boundaries."
                >
                  <div className="space-y-4 text-sm leading-6 text-slate-300">
                    <p>
                      This section displays the version and environment exposed
                      by the API&apos;s version endpoint.
                    </p>
                    <p>
                      It does not yet query Azure Container Apps revisions,
                      GitHub Actions workflow runs, image digests, or deployment
                      history.
                    </p>
                    <p className="rounded-xl border border-white/10 bg-black/10 p-4 text-xs text-slate-400">
                      This is live API-reported metadata, not a complete
                      deployment audit trail.
                    </p>
                  </div>
                </Panel>
              </div>
            )}

            {/* ACTIVITY */}
            {activeSection === "activity" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <MetricCard
                    label="Total checks"
                    value={totalChecks.toString()}
                    detail="Recorded in this browser session"
                    marker="cyan"
                  />

                  <MetricCard
                    label="Successful checks"
                    value={successfulChecks.toString()}
                    detail="Health endpoint responded successfully"
                    marker="green"
                  />

                  <MetricCard
                    label="Failed checks"
                    value={failedChecks.toString()}
                    detail="Unhealthy or unavailable responses"
                    marker="purple"
                  />
                </div>

                <Panel
                  title="Recent health checks"
                  description={`${activity.length} checks in this browser session (maximum 50).`}
                  action={
                    <button
                      type="button"
                      onClick={() => setActivity([])}
                      disabled={activity.length === 0}
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Clear history
                    </button>
                  }
                >
                  {activity.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/15 px-5 py-12 text-center">
                      <p className="text-sm font-semibold text-white">
                        No activity recorded
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        A new entry appears when the next health check
                        completes.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activity.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/10 p-4 sm:flex-row sm:items-start sm:justify-between"
                        >
                          <div className="flex min-w-0 items-start gap-3">
                            <span
                              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                entry.status === "healthy"
                                  ? "bg-emerald-300"
                                  : entry.status === "unhealthy"
                                    ? "bg-rose-300"
                                    : "bg-amber-200"
                              }`}
                            />
                            <div className="min-w-0">
                              <p className="break-words text-sm font-medium text-slate-200">
                                {entry.message}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {entry.version
                                  ? `API version ${entry.version}`
                                  : "No API version reported"}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                            <StatusBadge status={entry.status} />
                            <time
                              dateTime={entry.checkedAt}
                              className="text-xs text-slate-500"
                            >
                              {formatDate(entry.checkedAt)}
                            </time>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="mt-5 text-xs leading-5 text-slate-500">
                    Activity is stored only in the current page session. It is
                    not retrieved from Azure logs and is not a persistent audit
                    history.
                  </p>
                </Panel>
              </div>
            )}

            <footer className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>SimpliCreate Platform Console</p>
              <p>API monitoring refreshes every 30 seconds</p>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}
