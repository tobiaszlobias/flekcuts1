// convex/emails.ts - Email templates

interface EmailData {
  customerName: string;
  service: string;
  date: string;
  time: string;
  customerEmail?: string;
}

interface StatusEmailData extends EmailData {
  newStatus: string;
  statusMessage: string;
}

const BRAND = {
  name: "FlekCuts",
  primary: "#FF6B35",
  primaryDark: "#E5572C",
  background: "#F7F7F7",
  surface: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatPrettyDate = (date: string): string => {
  const parsed = new Date(date + "T00:00:00");
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("cs-CZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const renderEmail = (args: {
  title: string;
  subtitle?: string;
  preheader: string;
  accentColor?: string;
  contentHtml: string;
}): string => {
  const accent = args.accentColor || BRAND.primary;
  const preheader = escapeHtml(args.preheader);
  return `
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>${escapeHtml(args.title)}</title>
    <style>
      /* Some clients support this, but layout is primarily inline-styled */
      a { color: ${BRAND.primary}; }
      @media (prefers-color-scheme: dark) {
        .email-bg { background: #0B0F14 !important; }
        .email-card { background: #111827 !important; border-color: #1F2937 !important; }
        .email-text { color: #F9FAFB !important; }
        .email-muted { color: #9CA3AF !important; }
      }
    </style>
  </head>
  <body class="email-bg" style="margin:0; padding:0; background:${BRAND.background};">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
      ${preheader}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; background:${BRAND.background};">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="border-collapse:collapse; width:100%; max-width:600px;">
            <tr>
              <td style="padding:0 0 12px 0;">
                <div style="text-align:center; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-weight:700; letter-spacing:0.5px; color:${BRAND.text};">
                  <span style="display:inline-block; padding:10px 16px; border-radius:999px; background:${BRAND.surface}; border:1px solid ${BRAND.border};">
                    ${BRAND.name}
                  </span>
                </div>
              </td>
            </tr>

            <tr>
              <td class="email-card" style="background:${BRAND.surface}; border:1px solid ${BRAND.border}; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(17,24,39,0.08);">
                <div style="background:linear-gradient(90deg, ${accent} 0%, ${BRAND.primaryDark} 100%); padding:22px 20px;">
                  <div class="email-text" style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#fff;">
                    <div style="font-size:20px; font-weight:800; line-height:1.2;">${escapeHtml(
                      args.title
                    )}</div>
                    ${
                      args.subtitle
                        ? `<div style="margin-top:6px; font-size:14px; opacity:0.95;">${escapeHtml(
                            args.subtitle
                          )}</div>`
                        : ""
                    }
                  </div>
                </div>

                <div style="padding:22px 20px;">
                  ${args.contentHtml}
                  <div style="margin-top:18px; padding-top:16px; border-top:1px solid ${BRAND.border};">
                    <div class="email-muted" style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:${BRAND.muted}; font-size:12px; line-height:1.6;">
                      <div style="font-weight:600; color:${BRAND.text};">${BRAND.name}</div>
                      <div>Zámecké náměstí 19, 792 01 Bruntál</div>
                      <div>Telefon: +420 778 779 938</div>
                      <div><a href="https://flekcuts.cz" style="color:${BRAND.primary}; text-decoration:none;">flekcuts.cz</a></div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 0 0 0; text-align:center;">
                <div class="email-muted" style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:${BRAND.muted}; font-size:12px; line-height:1.6;">
                  Tento e-mail byl odeslán automaticky. Pokud jste si termín nerezervovali vy, můžete ho ignorovat.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};

const deriveServiceDurationMinutes = (serviceName: string): number => {
  const normalized = serviceName.trim();

  if (normalized === "Fade") return 45;
  if (normalized === "Klasický střih") return 30;
  if (normalized === "Dětský střih - fade") return 45;
  if (normalized === "Dětský střih - klasický") return 30;
  if (normalized === "Dětský střih - do ztracena") return 30;
  if (normalized === "Vousy") return 15;
  if (normalized === "Mytí vlasů") return 10;
  if (normalized === "Kompletka") return 70;
  if (normalized === "Vlasy do ztracena + Vousy") return 65;

  const hasBeard = normalized.includes("+ Vousy");
  const hasWash = normalized.includes("+ Mytí vlasů");

  let base: number | null = null;
  if (normalized.startsWith("Fade")) base = 45;
  if (normalized.startsWith("Klasický střih")) base = 30;
  if (normalized.startsWith("Dětský střih - fade")) base = 45;
  if (normalized.startsWith("Dětský střih - klasický")) base = 30;
  if (normalized.startsWith("Vousy")) base = 15;
  if (normalized.startsWith("Mytí vlasů")) base = 10;

  if (base === null) return 30;

  if (normalized.startsWith("Fade") && hasBeard) {
    base = 65;
  } else if (hasBeard) {
    base += 15;
  }

  if (hasWash) base += 10;
  return base;
};

const renderReservationDetails = (data: EmailData): string => {
  const service = escapeHtml(data.service);
  const date = escapeHtml(formatPrettyDate(data.date));
  const time = escapeHtml(data.time);
  const durationMinutes = deriveServiceDurationMinutes(data.service);
  return `
    <div style="margin:16px 0; padding:14px 14px; border-radius:12px; background:rgba(255,107,53,0.08); border:1px solid rgba(255,107,53,0.22);">
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:${BRAND.text}; font-weight:700; font-size:13px; letter-spacing:0.4px; text-transform:uppercase;">
        Detaily rezervace
      </div>
      <div style="margin-top:10px; display:grid; grid-template-columns:1fr; gap:8px;">
        <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:${BRAND.text}; font-size:14px;">
          <span style="color:${BRAND.muted};">Služba:</span> <strong>${service}</strong>
        </div>
        <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:${BRAND.text}; font-size:14px;">
          <span style="color:${BRAND.muted};">Datum:</span> <strong>${date}</strong>
        </div>
        <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:${BRAND.text}; font-size:14px;">
          <span style="color:${BRAND.muted};">Čas:</span> <strong>${time}</strong>
        </div>
        <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:${BRAND.text}; font-size:14px;">
          <span style="color:${BRAND.muted};">Délka:</span> <strong>${durationMinutes} min</strong>
        </div>
      </div>
    </div>
  `;
};

// Email template for appointment confirmation
const appointmentConfirmation = (data: EmailData) => {
  const subject = `Potvrzení rezervace - FlekCuts`;

  const safeName = escapeHtml(data.customerName);
  const durationMinutes = deriveServiceDurationMinutes(data.service);
  const html = renderEmail({
    title: "Rezervace přijata",
    subtitle: "Do 24 hodin vás budeme kontaktovat pro potvrzení.",
    preheader: "Rezervace přijata – děkujeme! Detaily uvnitř.",
    contentHtml: `
      <div class="email-text" style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:${BRAND.text}; font-size:15px; line-height:1.7;">
        <p style="margin:0 0 10px 0;">Dobrý den <strong>${safeName}</strong>,</p>
        <p style="margin:0 0 12px 0;">děkujeme za rezervaci. Níže najdete její detaily.</p>
        ${renderReservationDetails(data)}
        <div style="margin:12px 0 0 0; padding:12px 14px; border-radius:12px; background:rgba(255,107,53,0.06); border:1px solid rgba(255,107,53,0.18);">
          <div style="font-size:13px; color:${BRAND.text};">
            Objednávku lze zrušit nejpozději <strong>24 hodin</strong> před termínem.
          </div>
        </div>
        <p style="margin:12px 0 0 0;">Těšíme se na vaši návštěvu.</p>
        <p style="margin:12px 0 0 0; color:${BRAND.muted}; font-size:13px;">
          Potřebujete termín změnit? Ozvěte se nám telefonicky.
        </p>
      </div>
    `,
  });

  const text = `
    FlekCuts - Potvrzení rezervace
    
    Dobrý den ${data.customerName},
    
    Děkujeme za vaši rezervaci. Vaše objednávka byla úspěšně potvrzena.
    
    Detaily rezervace:
    - Služba: ${data.service}
    - Datum: ${data.date}
    - Čas: ${data.time}
    - Délka: ${durationMinutes} min

    Objednávku lze zrušit nejpozději 24 hodin před termínem.
    
    Těšíme se na vaši návštěvu!
    
    S pozdravem,
    Tým FlekCuts
  `;

  return { subject, html, text };
};

// Email template for appointment reminder
const appointmentReminder = (data: EmailData) => {
  const subject = `Připomínka termínu - FlekCuts zítra`;

  const safeName = escapeHtml(data.customerName);
  const durationMinutes = deriveServiceDurationMinutes(data.service);
  const html = renderEmail({
    title: "Připomínka termínu",
    subtitle: "Těšíme se na vás zítra.",
    preheader: "Připomínka termínu – detaily rezervace uvnitř.",
    contentHtml: `
      <div class="email-text" style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:${BRAND.text}; font-size:15px; line-height:1.7;">
        <p style="margin:0 0 10px 0;">Dobrý den <strong>${safeName}</strong>,</p>
        <p style="margin:0 0 12px 0;">připomínáme vám zítřejší rezervaci.</p>
        ${renderReservationDetails(data)}
        <p style="margin:12px 0 0 0; color:${BRAND.muted}; font-size:13px;">
          Objednávku lze zrušit nejpozději 24 hodin před termínem.
        </p>
        <p style="margin:12px 0 0 0;">Pokud nemůžete dorazit, dejte nám prosím vědět co nejdříve.</p>
      </div>
    `,
  });

  const text = `
    FlekCuts - Připomínka termínu
    
    Dobrý den ${data.customerName},
    
    Připomínáme vám, že máte zítra rezervaci v našem barbershopu.
    
    Váš termín zítra:
    - Služba: ${data.service}
    - Datum: ${data.date}
    - Čas: ${data.time}
    - Délka: ${durationMinutes} min
    
    Těšíme se na vás!
    
    S pozdravem,
    Tým FlekCuts
  `;

  return { subject, html, text };
};

// Email template for status updates
const statusUpdate = (data: StatusEmailData) => {
  const subject = `Změna stavu rezervace - FlekCuts`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#16A34A";
      case "cancelled":
        return "#DC2626";
      case "pending":
        return BRAND.primary;
      default:
        return BRAND.muted;
    }
  };

  const safeName = escapeHtml(data.customerName);
  const safeStatus = escapeHtml(data.statusMessage);
  const statusColor = getStatusColor(data.newStatus);
  const durationMinutes = deriveServiceDurationMinutes(data.service);
  const html = renderEmail({
    title: "Aktualizace rezervace",
    subtitle: "Změna stavu vaší rezervace",
    preheader: `Aktualizace rezervace: ${data.statusMessage}`,
    accentColor: data.newStatus === "cancelled" ? "#DC2626" : BRAND.primary,
    contentHtml: `
      <div class="email-text" style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:${BRAND.text}; font-size:15px; line-height:1.7;">
        <p style="margin:0 0 10px 0;">Dobrý den <strong>${safeName}</strong>,</p>
        <p style="margin:0 0 12px 0;">informujeme vás o změně stavu vaší rezervace:</p>
        <div style="margin:14px 0; padding:12px 14px; border-radius:12px; border:1px solid ${BRAND.border}; background:${BRAND.surface};">
          <span style="display:inline-block; padding:6px 10px; border-radius:999px; background:${statusColor}1A; color:${statusColor}; font-weight:700; font-size:13px;">
            ${safeStatus}
          </span>
        </div>
        ${renderReservationDetails(data)}
        <p style="margin:12px 0 0 0;">Pokud máte jakékoli dotazy, neváhejte nás kontaktovat.</p>
      </div>
    `,
  });

  const text = `
    FlekCuts - Aktualizace rezervace
    
    Dobrý den ${data.customerName},
    
    Informujeme vás o změně stavu vaší rezervace:
    ${data.statusMessage}
    
    Detaily rezervace:
    - Služba: ${data.service}
    - Datum: ${data.date}
    - Čas: ${data.time}
    - Délka: ${durationMinutes} min
    
    S pozdravem,
    Tým FlekCuts
  `;

  return { subject, html, text };
};

// Email template for cancellation confirmation
const cancellationConfirmation = (data: EmailData) => {
  const subject = `Potvrzení zrušení rezervace - FlekCuts`;

  const safeName = escapeHtml(data.customerName);
  const durationMinutes = deriveServiceDurationMinutes(data.service);
  const html = renderEmail({
    title: "Rezervace zrušena",
    subtitle: "Pokud chcete nový termín, ozvěte se nám.",
    preheader: "Rezervace zrušena – potvrzení a detaily uvnitř.",
    accentColor: "#DC2626",
    contentHtml: `
      <div class="email-text" style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:${BRAND.text}; font-size:15px; line-height:1.7;">
        <p style="margin:0 0 10px 0;">Dobrý den <strong>${safeName}</strong>,</p>
        <p style="margin:0 0 12px 0;">potvrzujeme, že vaše rezervace byla zrušena.</p>
        ${renderReservationDetails(data)}
        <p style="margin:12px 0 0 0;">Budeme se těšit na vaši návštěvu příště.</p>
      </div>
    `,
  });

  const text = `
    FlekCuts - Rezervace zrušena
    
    Dobrý den ${data.customerName},
    
    Potvrzujeme, že vaše rezervace byla úspěšně zrušena.
    
    Zrušená rezervace:
    - Služba: ${data.service}
    - Datum: ${data.date}
    - Čas: ${data.time}
    - Délka: ${durationMinutes} min
    
    Budeme se těšit na vaši návštěvu příště!
    
    S pozdravem,
    Tým FlekCuts
  `;

  return { subject, html, text };
};

// Export all templates
export const emailTemplates = {
  appointmentConfirmation,
  appointmentReminder,
  statusUpdate,
  cancellationConfirmation,
};
