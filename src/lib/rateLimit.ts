type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

type Bucket = { count: number; resetAtMs: number };

const STORE_KEY = "__brioinc_rate_limit__" as const;

function getStore() {
  const g = globalThis as unknown as Record<string, unknown>;
  if (!g[STORE_KEY]) {
    g[STORE_KEY] = new Map<string, Bucket>();
  }
  return g[STORE_KEY] as Map<string, Bucket>;
}

export function rateLimit(params: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const store = getStore();
  const now = Date.now();

  const bucket = store.get(params.key);
  if (!bucket || now >= bucket.resetAtMs) {
    store.set(params.key, { count: 1, resetAtMs: now + params.windowMs });
    return { ok: true };
  }

  if (bucket.count >= params.limit) {
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAtMs - now) / 1000)) };
  }

  bucket.count += 1;
  store.set(params.key, bucket);
  return { ok: true };
}

export function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
