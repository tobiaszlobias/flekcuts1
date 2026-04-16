export type ServiceOptionKind = "haircut" | "addon" | "package" | "combo";

export type ServiceOption = {
  id: string;
  name: string;
  priceCzk: number;
  durationMinutes: number;
  kind: ServiceOptionKind;
  components?: string[];
};

const HAIRCUTS: ServiceOption[] = [
  { id: "fade", name: "Fade", priceCzk: 350, durationMinutes: 45, kind: "haircut" },
  {
    id: "classic",
    name: "Klasický střih",
    priceCzk: 250,
    durationMinutes: 30,
    kind: "haircut",
  },
  {
    id: "kids-fade",
    name: "Dětský střih - fade",
    priceCzk: 250,
    durationMinutes: 45,
    kind: "haircut",
  },
  {
    id: "kids-classic",
    name: "Dětský střih - klasický",
    priceCzk: 200,
    durationMinutes: 30,
    kind: "haircut",
  },
];

const ADDONS: ServiceOption[] = [
  { id: "beard", name: "Vousy", priceCzk: 150, durationMinutes: 15, kind: "addon" },
  {
    id: "wash",
    name: "Mytí vlasů",
    priceCzk: 100,
    durationMinutes: 10,
    kind: "addon",
  },
];

const PACKAGES: ServiceOption[] = [
  {
    id: "package-complete",
    name: "Kompletka",
    priceCzk: 500,
    durationMinutes: 70,
    kind: "package",
  },
];

// New prices for May 1st onwards
const MAY_PRICES: Record<string, number> = {
  fade: 390,
  classic: 250,
  "kids-fade": 320,
  "kids-classic": 250,
  "package-complete": 500, // Starting price, will show as range in UI
};

export const SERVICE_OPTIONS: ServiceOption[] = [...HAIRCUTS, ...PACKAGES, ...ADDONS];

export const BOOKING_DROPDOWN_SERVICES: ServiceOption[] = [
  ...HAIRCUTS,
  ...PACKAGES,
];

const NAME_ALIASES: Record<string, string> = {
  "Dětský střih - do ztracena": "Dětský střih - fade",
  "Dětský střih - klasický": "Dětský střih - klasický",
};

export const getServiceOptionByName = (name: string): ServiceOption | undefined => {
  const direct = SERVICE_OPTIONS.find((s) => s.name === name);
  if (direct) return direct;
  const alias = NAME_ALIASES[name];
  if (!alias) return undefined;
  return SERVICE_OPTIONS.find((s) => s.name === alias);
};

export const deriveServiceFromName = (
  serviceName: string,
  dateString?: string
): { durationMinutes: number; priceCzk: number; baseName: string } => {
  const normalized = serviceName.trim();
  const baseName = normalized.split("+")[0]?.trim() || normalized;
  const base = getServiceOptionByName(baseName);

  let durationMinutes = base?.durationMinutes ?? 30;
  let priceCzk = base?.priceCzk ?? 0;

  // Apply May pricing if date is May 1st or later
  if (dateString && base) {
    const appDate = new Date(dateString + "T00:00:00");
    const mayFirst = new Date("2026-05-01T00:00:00"); // Current year is 2026 in session
    if (appDate >= mayFirst) {
      const newPrice = MAY_PRICES[base.id];
      if (newPrice !== undefined) {
        priceCzk = newPrice;
      }
    }
  }

  return { baseName, durationMinutes, priceCzk };
};

export const deriveServiceSelection = (args: {
  baseName: string;
  addBeard: boolean;
  addWash: boolean;
  date?: string;
}): { displayName: string; durationMinutes: number; priceCzk: number } => {
  const baseName = args.baseName.trim();
  if (!baseName) return { displayName: "", durationMinutes: 0, priceCzk: 0 };

  const derived = deriveServiceFromName(baseName, args.date);
  return {
    displayName: baseName,
    durationMinutes: derived.durationMinutes,
    priceCzk: derived.priceCzk,
  };
};

