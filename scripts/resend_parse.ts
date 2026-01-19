import fs from "node:fs";
import path from "node:path";

type ResendEmailDetail = {
  id: string;
  to?: string | string[];
  subject?: string;
  html?: string | null;
  text?: string | null;
  created_at?: string;
  createdAt?: string;
};

type ResendRawFile = {
  fetchedAt?: string;
  count?: number;
  emails?: ResendEmailDetail[];
};

type ReconstructedAppointment = {
  customerEmail: string;
  customerName: string | null;
  service: string | null;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  source: "resend";
  resendEmailId: string;
  sentAt: string | null;
};

const readJson = (filePath: string): any =>
  JSON.parse(fs.readFileSync(filePath, "utf8"));

const writeJson = (filePath: string, value: unknown) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
};

const stripHtml = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractFirstEmail = (value: string): string | null => {
  const match = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0]?.toLowerCase() ?? null;
};

const normalizeTime = (value: string): string | null => {
  const match = value.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (!match) return null;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
};

const normalizeIsoDate = (value: string): string | null => {
  const match = value.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  return match?.[1] ?? null;
};

const CZ_MONTHS: Record<string, string> = {
  ledna: "01",
  února: "02",
  unora: "02",
  března: "03",
  brezna: "03",
  dubna: "04",
  května: "05",
  kvetna: "05",
  června: "06",
  cervna: "06",
  července: "07",
  cervence: "07",
  srpna: "08",
  září: "09",
  zari: "09",
  října: "10",
  rijna: "10",
  listopadu: "11",
  prosince: "12",
};

const normalizeCzechPrettyDate = (value: string): string | null => {
  // Matches: "čtvrtek 19. února 2026" or "19. února 2026"
  const match = value.match(/\b(\d{1,2})\.\s*([A-Za-zÁ-ž]+)\s+(\d{4})\b/);
  if (!match) return null;
  const day = match[1].padStart(2, "0");
  const monthKey = match[2].toLowerCase();
  const month = CZ_MONTHS[monthKey];
  const year = match[3];
  if (!month) return null;
  return `${year}-${month}-${day}`;
};

const extractAfterLabel = (content: string, label: string): string | null => {
  const idx = content.toLowerCase().indexOf(label.toLowerCase());
  if (idx === -1) return null;
  const tail = content.slice(idx + label.length);
  const trimmed = tail.replace(/^[\s:–-]+/, "").trim();
  if (!trimmed) return null;
  // take up to end of line-ish boundary
  const cut = trimmed.split(/\s{2,}|\n|\r|•|- /)[0]?.trim();
  return cut || null;
};

const extractCustomerName = (content: string): string | null => {
  // "Dobrý den <name>,"
  const match = content.match(/Dobr[ýy]\s+den\s+([^\s,!.]{2,40})/i);
  return match?.[1]?.trim() ?? null;
};

const extractService = (content: string): string | null => {
  const fromLabel = extractAfterLabel(content, "Služba");
  if (fromLabel) return fromLabel;
  const match = content.match(/Slu[žz]ba:\s*([^\n\r]+?)\s*(?:Datum:|Čas:|Délka:|$)/i);
  return match?.[1]?.trim() ?? null;
};

const extractDate = (content: string): string | null => {
  const fromLabel = extractAfterLabel(content, "Datum");
  if (fromLabel) {
    return normalizeIsoDate(fromLabel) || normalizeCzechPrettyDate(fromLabel) || null;
  }
  return normalizeIsoDate(content) || normalizeCzechPrettyDate(content) || null;
};

const extractTime = (content: string): string | null => {
  const fromLabel = extractAfterLabel(content, "Čas");
  if (fromLabel) return normalizeTime(fromLabel);
  return normalizeTime(content);
};

const toStringSafe = (value: unknown): string => (typeof value === "string" ? value : "");

/**
 * Input:
 *   recovery/resend-emails-raw.json
 *
 * Output:
 *   recovery/reconstructed-appointments.json
 *
 * Behavior:
 * - Skips entries where date or time is missing.
 * - Extracts best-effort { email, name, service, date, time } from email text/html.
 */
const main = () => {
  const inputPath = path.join("recovery", "resend-emails-raw.json");
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing ${inputPath}. Run scripts/resend_dump.ts first.`);
  }

  const raw = readJson(inputPath) as ResendRawFile;
  const emails = Array.isArray(raw.emails) ? raw.emails : [];

  const out: ReconstructedAppointment[] = [];
  let skippedMissingDateTime = 0;

  for (const email of emails) {
    const toField = Array.isArray(email.to) ? email.to.join(", ") : toStringSafe(email.to);
    const customerEmail = extractFirstEmail(toField);
    if (!customerEmail) continue;

    const content = [
      toStringSafe(email.text),
      email.html ? stripHtml(email.html) : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const customerName = extractCustomerName(content);
    const service = extractService(content);
    const date = extractDate(content);
    const time = extractTime(content);

    if (!date || !time) {
      skippedMissingDateTime += 1;
      continue;
    }

    const sentAt = email.created_at || email.createdAt || null;

    out.push({
      customerEmail,
      customerName,
      service,
      date,
      time,
      source: "resend",
      resendEmailId: email.id,
      sentAt,
    });
  }

  const outputPath = path.join("recovery", "reconstructed-appointments.json");
  writeJson(outputPath, out);

  process.stderr.write(
    `Wrote ${out.length} reconstructed appointments to ${outputPath}. Skipped missing date/time: ${skippedMissingDateTime}\n`
  );
};

main();

