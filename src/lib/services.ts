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

export const SERVICE_OPTIONS: ServiceOption[] = [...HAIRCUTS, ...PACKAGES, ...ADDONS];

export const BOOKING_DROPDOWN_SERVICES: ServiceOption[] = [
  ...HAIRCUTS,
  ...ADDONS,
  ...PACKAGES,
];

const NAME_ALIASES: Record<string, string> = {
  "Dětský střih - do ztracena": "Dětský střih - klasický",
};

export const getServiceOptionByName = (name: string): ServiceOption | undefined => {
  const direct = SERVICE_OPTIONS.find((s) => s.name === name);
  if (direct) return direct;
  const alias = NAME_ALIASES[name];
  if (!alias) return undefined;
  return SERVICE_OPTIONS.find((s) => s.name === alias);
};

const includesBeard = (serviceName: string) => serviceName.includes("+ Vousy");
const includesWash = (serviceName: string) => serviceName.includes("+ Mytí vlasů");

export const deriveServiceFromName = (
  serviceName: string
): { durationMinutes: number; priceCzk: number; baseName: string } => {
  const normalized = serviceName.trim();

  // Legacy naming (kept for existing bookings)
  if (normalized === "Vlasy do ztracena + Vousy") {
    return { baseName: "Fade", durationMinutes: 65, priceCzk: 350 + 150 };
  }

  const baseName = normalized.split("+")[0]?.trim() || normalized;
  const base = getServiceOptionByName(baseName);
  const beard = getServiceOptionByName("Vousy");
  const wash = getServiceOptionByName("Mytí vlasů");

  let durationMinutes = base?.durationMinutes ?? 30;
  let priceCzk = base?.priceCzk ?? 0;

  const beardSelected = baseName !== "Vousy" && includesBeard(normalized);
  const washSelected = baseName !== "Mytí vlasů" && includesWash(normalized);

  if (baseName === "Kompletka") {
    return {
      baseName: "Kompletka",
      durationMinutes: base?.durationMinutes ?? 70,
      priceCzk: base?.priceCzk ?? 500,
    };
  }

  if (beardSelected) {
    priceCzk += beard?.priceCzk ?? 0;
    durationMinutes += beard?.durationMinutes ?? 15;
    if (baseName === "Fade") {
      // Special-case per your list: Fade + Vousy = 65 min.
      durationMinutes = 65;
    }
  }

  if (washSelected) {
    priceCzk += wash?.priceCzk ?? 0;
    durationMinutes += wash?.durationMinutes ?? 10;
  }

  return { baseName, durationMinutes, priceCzk };
};

export const deriveServiceSelection = (args: {
  baseName: string;
  addBeard: boolean;
  addWash: boolean;
}): { displayName: string; durationMinutes: number; priceCzk: number } => {
  const baseName = args.baseName.trim();
  if (!baseName) return { displayName: "", durationMinutes: 0, priceCzk: 0 };

  if (baseName === "Kompletka") {
    const base = getServiceOptionByName("Kompletka");
    return {
      displayName: "Kompletka",
      durationMinutes: base?.durationMinutes ?? 70,
      priceCzk: base?.priceCzk ?? 500,
    };
  }

  let displayName = baseName;
  if (args.addBeard && baseName !== "Vousy") displayName += " + Vousy";
  if (args.addWash && baseName !== "Mytí vlasů") displayName += " + Mytí vlasů";

  const derived = deriveServiceFromName(displayName);
  return { displayName, durationMinutes: derived.durationMinutes, priceCzk: derived.priceCzk };
};
