// Captures the original Error out-of-band so server.ts can recover the stack
// when h3 has already swallowed the throw into a generic 500 Response.

let lastCapturedError: { error: unknown; at: number } | undefined;
const TTL_MS = 5_000;

function record(error: unknown) {
  lastCapturedError = { error, at: Date.now() };
}

// Increase EventEmitter max listeners in Node environment to prevent MaxListenersExceededWarning
if (typeof process !== "undefined" && typeof process.setMaxListeners === "function") {
  try {
    process.setMaxListeners(50);
  } catch {
    /* noop */
  }
}

const GLOBAL_ERROR_KEY = "__rtpp_error_listeners_attached__";
if (typeof globalThis !== "undefined" && !(globalThis as Record<string, unknown>)[GLOBAL_ERROR_KEY]) {
  (globalThis as Record<string, unknown>)[GLOBAL_ERROR_KEY] = true;
  if (typeof globalThis.addEventListener === "function") {
    globalThis.addEventListener("error", (event) => record((event as ErrorEvent).error ?? event));
    globalThis.addEventListener("unhandledrejection", (event) =>
      record((event as PromiseRejectionEvent).reason),
    );
  }
}

export function consumeLastCapturedError(): unknown {
  if (!lastCapturedError) return undefined;
  if (Date.now() - lastCapturedError.at > TTL_MS) {
    lastCapturedError = undefined;
    return undefined;
  }
  const { error } = lastCapturedError;
  lastCapturedError = undefined;
  return error;
}
