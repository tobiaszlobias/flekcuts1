export type ServiceOptionKind = "haircut" | "addon" | "package" | "combo";

export type ServiceOption = {
  id: string;
  name: string;
  priceCzk: number;
  durationMinutes: number;
  kind: ServiceOptionKind;
  components?: string[];
};

const CURRENT_SERVICES: ServiceOption[] = [
  {
    id: "mens-cut",
    name: "Panský střih",
    priceCzk: 320,
    durationMinutes: 60,
    kind: "haircut",
  },
  {
    id: "kids-cut",
    name: "Dětský střih",
    priceCzk: 280,
    durationMinutes: 60,
    kind: "haircut",
  },
  {
    id: "complete-service",
    name: "Kompletní servis",
    priceCzk: 550,
    durationMinutes: 90,
    kind: "package",
  },
  {
    id: "beard",
    name: "Vousy",
    priceCzk: 200,
    durationMinutes: 15,
    kind: "addon",
  },
];

const LEGACY_NAME_ALIASES: Record<string, string> = {
  Fade: "Panský střih",
  "Klasický střih": "Panský střih",
  "Dětský střih - fade": "Dětský střih",
  "Dětský střih - klasický": "Dětský střih",
  "Dětský střih - do ztracena": "Dětský střih",
  Kompletka: "Kompletní servis",
  "Vlasy do ztracena + Vousy": "Kompletní servis",
};

export const SERVICE_OPTIONS: ServiceOption[] = CURRENT_SERVICES;

export const BOOKING_DROPDOWN_SERVICES: ServiceOption[] = CURRENT_SERVICES;

export const getCanonicalServiceName = (name: string): string => {
  const normalized = name.trim();
  if (!normalized) return normalized;
  return LEGACY_NAME_ALIASES[normalized] || normalized;
};

export const formatServiceNameForDisplay = (name: string): string => {
  return getCanonicalServiceName(name);
};

export const getServiceOptionByName = (name: string): ServiceOption | undefined => {
  const canonicalName = getCanonicalServiceName(name);
  return SERVICE_OPTIONS.find((service) => service.name === canonicalName);
};

export const deriveServiceFromName = (
  serviceName: string
): { durationMinutes: number; priceCzk: number; baseName: string } => {
  const canonicalName = getCanonicalServiceName(serviceName);
  const service = getServiceOptionByName(canonicalName);

  return {
    baseName: canonicalName,
    durationMinutes: service?.durationMinutes ?? 30,
    priceCzk: service?.priceCzk ?? 0,
  };
};

export const deriveServiceSelection = (args: {
  baseName: string;
  addBeard: boolean;
  addWash: boolean;
}): { displayName: string; durationMinutes: number; priceCzk: number } => {
  const canonicalName = getCanonicalServiceName(args.baseName);
  if (!canonicalName) return { displayName: "", durationMinutes: 0, priceCzk: 0 };

  const derived = deriveServiceFromName(canonicalName);
  return {
    displayName: canonicalName,
    durationMinutes: derived.durationMinutes,
    priceCzk: derived.priceCzk,
  };
};
