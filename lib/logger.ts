type LogLevel = "info" | "warn" | "error";

export function agentLog(level: LogLevel, event: string, details: Record<string, unknown> = {}) {
  const record = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...details,
  });

  if (level === "error") console.error(record);
  else if (level === "warn") console.warn(record);
  else console.info(record);
}

export function shouldLogRawAgentResponse() {
  return process.env.NODE_ENV !== "production" && process.env.AGENT_LOG_RAW_RESPONSE === "true";
}
