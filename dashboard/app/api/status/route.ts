import { connection, NextResponse } from "next/server";

function getApiBaseUrl(): string {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("API_BASE_URL environment variable is not configured.");
  }

  return apiBaseUrl;
}

export async function GET() {
  await connection();

  const API_BASE_URL = getApiBaseUrl();
  const checkedAt = new Date().toISOString();


  try {
    // Check both Azure endpoints independently.
    const [healthResult, versionResult] = await Promise.allSettled([
      fetch(`${API_BASE_URL}/health`, {
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      }),
      fetch(`${API_BASE_URL}/version`, {
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      }),
    ]);

    // Without a health response, we cannot verify the API's condition.
    if (healthResult.status === "rejected") {
      throw healthResult.reason;
    }

    const healthResponse = healthResult.value;

    // A reachable health endpoint returning an HTTP error indicates
    // that the service is not reporting a healthy condition.
    if (!healthResponse.ok) {
      console.error("Azure health endpoint returned HTTP", healthResponse.status);

      return NextResponse.json({
        status: "unhealthy",
        version: null,
        environment: null,
        checkedAt,
        error: `Health endpoint returned HTTP ${healthResponse.status}.`,
      });
    }

    const health = await healthResponse.json();

    // The endpoint responded, but its payload must confirm health.
    const healthy = health.status === "healthy";

    let version: string | null = null;
    let environment: string | null = null;
    let error: string | null = null;

    // Version information is useful, but it must not override
    // the result of the health check.
    if (versionResult.status === "fulfilled") {
      const versionResponse = versionResult.value;

      if (versionResponse.ok) {
        const versionData = await versionResponse.json();

        version = versionData.version ?? "Unknown";
        environment = versionData.environment ?? "Unknown";
      } else {
        error = `Version endpoint returned HTTP ${versionResponse.status}.`;
      }
    } else {
      error = "Could not retrieve deployment version information.";
    }

    return NextResponse.json({
      status: healthy ? "healthy" : "unhealthy",
      version,
      environment,
      checkedAt,
      error,
    });
  } catch (error) {
    console.error("Azure status check failed:", error);

    return NextResponse.json(
      {
        status: "unavailable",
        version: null,
        environment: null,
        checkedAt,
        error:
          error instanceof Error
            ? `${error.name}: ${error.message}`
            : "Unknown error while contacting Azure.",
      },
      { status: 502 }
    );
  }
}