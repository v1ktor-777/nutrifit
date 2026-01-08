export function logError(context: string, err: unknown): void {
  if (err instanceof Error) {
    console.error(`[${context}]`, err);
    return;
  }
  console.error(`[${context}]`, err);
}

export function toUserError(err: unknown, t: (k: string) => string): string {
  const status = getStatus(err);
  if (status === 401 || status === 403) return t("errors.unauthorized");
  if (status === 400 || status === 422) return t("errors.validation");
  if (status && status >= 500) return t("errors.generic");

  if (err instanceof Error) {
    const message = err.message.toLowerCase();
    if (message.includes("failed to fetch") || message.includes("network")) {
      return t("errors.network");
    }
    if (message.includes("unauthorized") || message.includes("401")) {
      return t("errors.unauthorized");
    }
    if (message.includes("invalid") || message.includes("validation") || message.includes("400")) {
      return t("errors.validation");
    }
  }

  return t("errors.generic");
}

function getStatus(err: unknown): number | null {
  if (!err || typeof err !== "object") return null;
  const maybeStatus = (err as { status?: unknown }).status;
  return typeof maybeStatus === "number" ? maybeStatus : null;
}
