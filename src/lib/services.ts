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

const comboId = (haircutId: string, addonIds: string[]) =>
  `${haircutId}__${addonIds.slice().sort().join("+")}`;

const buildCombos = (): ServiceOption[] => {
  const adultHaircuts = HAIRCUTS.filter((h) => !h.id.startsWith("kids-"));
  const beard = ADDONS.find((a) => a.id === "beard")!;
  const wash = ADDONS.find((a) => a.id === "wash")!;

  const combos: ServiceOption[] = [];

  for (const haircut of adultHaircuts) {
    // haircut + vousy
    {
      const durationMinutes =
        haircut.id === "fade" ? 65 : haircut.durationMinutes + beard.durationMinutes;
      const id = comboId(haircut.id, [beard.id]);
      combos.push({
        id,
        name: `${haircut.name} + Vousy`,
        priceCzk: haircut.priceCzk + beard.priceCzk,
        durationMinutes,
        kind: "combo",
        components: [haircut.id, beard.id],
      });
    }

    // haircut + mytí
    {
      combos.push({
        id: comboId(haircut.id, [wash.id]),
        name: `${haircut.name} + Mytí vlasů`,
        priceCzk: haircut.priceCzk + wash.priceCzk,
        durationMinutes: haircut.durationMinutes + wash.durationMinutes,
        kind: "combo",
        components: [haircut.id, wash.id],
      });
    }

    // haircut + vousy + mytí
    {
      const durationMinutes =
        haircut.id === "fade"
          ? 65 + wash.durationMinutes
          : haircut.durationMinutes + beard.durationMinutes + wash.durationMinutes;

      combos.push({
        id: comboId(haircut.id, [beard.id, wash.id]),
        name: `${haircut.name} + Vousy + Mytí vlasů`,
        priceCzk: haircut.priceCzk + beard.priceCzk + wash.priceCzk,
        durationMinutes,
        kind: "combo",
        components: [haircut.id, beard.id, wash.id],
      });
    }
  }

  return combos;
};

export const SERVICE_OPTIONS: ServiceOption[] = [
  ...HAIRCUTS,
  ...PACKAGES,
  ...ADDONS,
  ...buildCombos(),
];

const NAME_ALIASES: Record<string, string> = {
  "Dětský střih - do ztracena": "Dětský střih - klasický",
  "Vlasy do ztracena + Vousy": "Fade + Vousy",
};

export const getServiceOptionByName = (name: string): ServiceOption | undefined => {
  const direct = SERVICE_OPTIONS.find((s) => s.name === name);
  if (direct) return direct;
  const alias = NAME_ALIASES[name];
  if (!alias) return undefined;
  return SERVICE_OPTIONS.find((s) => s.name === alias);
};
