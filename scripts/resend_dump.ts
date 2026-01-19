import fs from "node:fs";
import path from "node:path";

type ResendListEmail = {
  id: string;
  to?: string | string[];
  subject?: string;
  created_at?: string;
  createdAt?: string;
};

type ResendEmailDetail = {
  id: string;
  to?: string | string[];
  subject?: string;
  html?: string | null;
  text?: string | null;
  created_at?: string;
  createdAt?: string;
};

type ResendListResponse = {
  data?: ResendListEmail[];
  next_cursor?: string | null;
  next?: string | null;
  has_more?: boolean;
};

const RESEND_API_BASE = "https://api.resend.com";

const ensureDir = (dir: string) => fs.mkdirSync(dir, { recursive: true });

const writeJson = (filePath: string, value: unknown) =>
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");

const readEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing ${key} in environment.`);
  return value;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const requestJson = async (url: string, apiKey: string) => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  const text = await response.text();
  let parsed: any = null;

  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = { raw: text };
  }

  if (!response.ok) {
    throw new Error(
      `Resend API error ${response.status}: ${JSON.stringify(parsed)}`,
    );
  }

  return parsed;
};

const listEmailsPage = async (apiKey: string, cursor?: string) => {
  const params = new URLSearchParams();
  params.set("limit", "100");
  if (cursor) params.set("cursor", cursor);
  const url = `${RESEND_API_BASE}/emails?${params.toString()}`;
  return (await requestJson(url, apiKey)) as ResendListResponse;
};

const getEmail = async (apiKey: string, id: string) => {
  const url = `${RESEND_API_BASE}/emails/${encodeURIComponent(id)}`;
  const payload = await requestJson(url, apiKey);
  return (payload?.data ?? payload) as ResendEmailDetail;
};

const main = async () => {
  const apiKey = readEnv("RESEND_API_KEY");

  const allListItems: ResendListEmail[] = [];
  let cursor: string | undefined;

  for (let page = 1; page <= 200; page++) {
    const res = await listEmailsPage(apiKey, cursor);
    const data = Array.isArray(res.data) ? res.data : [];
    allListItems.push(...data);

    const next =
      (typeof res.next_cursor === "string" && res.next_cursor) ||
      (typeof res.next === "string" && res.next) ||
      undefined;

    if (!next) break;
    cursor = next;

    // respektuj rate limit i při listování
    await sleep(600);
  }

  const ids = Array.from(
    new Set(allListItems.map((e) => e.id).filter(Boolean)),
  );

  const details: ResendEmailDetail[] = [];

  // JEDEN request + pauza (bez paralelizace)
  for (const id of ids) {
    const detail = await getEmail(apiKey, id);
    details.push(detail);

    // Resend limit: max 2 req / second
    await sleep(700);
  }

  const outDir = path.join("recovery");
  ensureDir(outDir);
  const outPath = path.join(outDir, "resend-emails-raw.json");

  writeJson(outPath, {
    fetchedAt: new Date().toISOString(),
    count: details.length,
    emails: details,
  });

  process.stderr.write(`Wrote ${details.length} emails to ${outPath}\n`);
};

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.stack : String(err)}\n`);
  process.exit(1);
});
