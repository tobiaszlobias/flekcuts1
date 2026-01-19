import fs from "node:fs";
import path from "node:path";

type ReconstructedAppointment = {
  customerName: string | null;
  customerEmail: string | null;
  customerPhone?: string | null;
  service?: string | null;
  date?: string | null; // ideally YYYY-MM-DD
  time?: string | null; // HH:MM
  notes?: string | null;
  sourceResendId: string | null;
  sourceTimestamp: string | null;
};

const DEFAULT_INPUTS = [
  path.join("recovery", "resend-logs.csv"),
  path.join("recovery", "resend-emails.csv"),
];

const readText = (filePath: string) => fs.readFileSync(filePath, "utf8");

const stripHtml = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Minimal CSV parser supporting quoted fields and newlines in quotes.
const parseCsv = (input: string): Array<Record<string, string>> => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const next = input[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
        continue;
      }
      if (char === '"') {
        inQuotes = false;
        continue;
      }
      field += char;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      pushField();
      continue;
    }
    if (char === "\n") {
      pushField();
      pushRow();
      continue;
    }
    if (char === "\r") continue;

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    pushField();
    pushRow();
  }

  const [header, ...data] = rows.filter((r) => r.some((c) => c.trim() !== ""));
  if (!header) return [];

  return data
    .filter((r) => r.length > 0)
    .map((r) => {
      const record: Record<string, string> = {};
      for (let i = 0; i < header.length; i++) {
        const key = header[i]?.trim();
        if (!key) continue;
        record[key] = (r[i] ?? "").trim();
      }
      return record;
    });
};

const firstNonEmpty = (record: Record<string, string>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (value && value.trim()) return value.trim();
  }
  return "";
};

const extractFirstEmail = (value: string): string | null => {
  const match = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0]?.toLowerCase() ?? null;
};

const extractName = (content: string): string | null => {
  // Matches: "Dobrý den toni," or "Dobrý den Toni," (and some HTML variants after stripping).
  const match = content.match(/Dobr[ýy]\s+den\s+([^\s,!.<]{2,40})/i);
  return match?.[1]?.trim() ?? null;
};

const extractService = (content: string): string | null => {
  const match = content.match(/Slu[žz]ba:\s*([^\n\r<]+?)(?:\s{2,}|$)/i);
  return match?.[1]?.trim() ?? null;
};

const extractIsoDate = (content: string): string | null => {
  const match = content.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  return match?.[1] ?? null;
};

const extractTime = (content: string): string | null => {
  const match = content.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (!match) return null;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
};

const main = () => {
  const inputArg = process.argv[2];
  const inputPath =
    inputArg?.trim() ||
    DEFAULT_INPUTS.find((p) => fs.existsSync(p)) ||
    DEFAULT_INPUTS[0];

  if (!fs.existsSync(inputPath)) {
    console.error(
      `Input CSV not found. Place it at ${DEFAULT_INPUTS
        .map((p) => `"${p}"`)
        .join(" or ")} or pass a path as the first argument.`
    );
    process.exit(1);
  }

  const csv = readText(inputPath);
  const records = parseCsv(csv);
  if (records.length === 0) {
    console.error("No rows found in CSV (or CSV parsing failed).");
    process.exit(1);
  }

  let missingCore = 0;
  const reconstructed: ReconstructedAppointment[] = records.map((r) => {
    const toRaw = firstNonEmpty(r, ["to", "To", "recipient", "recipientEmail", "email"]);
    const createdAt = firstNonEmpty(r, ["created_at", "createdAt", "sent_at", "sentAt", "timestamp"]);
    const id = firstNonEmpty(r, ["id", "email_id", "emailId", "resend_id", "resendId"]);

    const html = firstNonEmpty(r, ["html", "Html", "body_html"]);
    const text = firstNonEmpty(r, ["text", "Text", "body_text", "body"]);
    const content = stripHtml([text, html].filter(Boolean).join("\n\n"));

    const customerEmail = extractFirstEmail(toRaw) ?? extractFirstEmail(content);
    const customerName = extractName(content);
    const service = extractService(content);
    const date = extractIsoDate(content);
    const time = extractTime(content);

    if (!customerEmail || !date || !time || !service) {
      missingCore += 1;
    }

    return {
      customerName,
      customerEmail,
      customerPhone: null,
      service,
      date,
      time,
      notes: null,
      sourceResendId: id || null,
      sourceTimestamp: createdAt || null,
    };
  });

  const outDir = path.join("recovery");
  const outPath = path.join(outDir, "reconstructed-appointments.json");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(reconstructed, null, 2), "utf8");

  console.error(
    `Wrote ${reconstructed.length} reconstructed items to ${outPath}. Rows missing email/date/time/service: ${missingCore}`
  );
};

main();

