"use client";

import React from "react";
import { X } from "lucide-react";

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Všeobecné obchodní podmínky
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-6">
          {/* Základní informace */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              1. Základní informace o poskytovateli služeb
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Obchodní jméno:</strong> FlekCuts
                <br />
                <strong>Adresa:</strong> Zámecké náměstí 19, Bruntál
                <br />
                <strong>Telefon:</strong> +420 778 779 938
                <br />
                <strong>E-mail:</strong> info@flekcuts.cz
              </p>
            </div>
          </div>

          {/* Předmět činnosti */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              2. Předmět podnikání
            </h3>
            <p className="text-gray-700">
              FlekCuts poskytuje služby profesionálního holičství, včetně:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2 ml-4">
              <li>Pánských střihů všech typů</li>
              <li>Úpravy vousů a knírů</li>
              <li>Holení břitvou</li>
              <li>Péče o vlasy a pokožku hlavy</li>
              <li>Poradenství v oblasti péče o vlasy</li>
            </ul>
          </div>

          {/* Objednávkový systém */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              3. Objednávkový systém a rezervace termínů
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">
                  Způsoby objednávání:
                </h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Online prostřednictvím webových stránek</li>
                  <li>Telefonicky na čísle +420 778 779 938</li>
                  <li>Osobně v provozovně</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">
                  Potvrzení objednávky:
                </h4>
                <p className="text-gray-700">
                  Po odeslání online objednávky obdržíte automatické potvrzení.
                  Definitivní potvrzení termínu obdržíte do 24 hodin telefonicky
                  nebo e-mailem.
                </p>
              </div>
            </div>
          </div>

          {/* Ceny a platby */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              4. Ceny a způsoby platby
            </h3>
            <div className="space-y-3">
              <p className="text-gray-700">
                <strong>Aktuální ceník služeb:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Pánský střih: 350 Kč</li>
                <li>Dětský střih: 250 Kč</li>
                <li>Úprava vousů: 200 Kč</li>
                <li>Holení: 300 Kč</li>
                <li>Komplet (střih + vousy): 500 Kč</li>
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Platba:</strong> Platba se provádí v hotovosti nebo
                  kartou přímo v provozovně po poskytnutí služby. Neúčtujeme
                  žádné poplatky za rezervaci termínu.
                </p>
              </div>
            </div>
          </div>

          {/* Storno podmínky */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              5. Podmínky zrušení a změny termínu
            </h3>
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">
                  ✅ Bezplatné zrušení:
                </h4>
                <ul className="list-disc list-inside text-green-700 space-y-1 ml-4">
                  <li>Minimálně 24 hodin před termínem</li>
                  <li>Online prostřednictvím webových stránek</li>
                  <li>Telefonicky na +420 778 779 938</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">
                  ❌ Pozdní zrušení:
                </h4>
                <p className="text-red-700">
                  Za zrušení termínu méně než 24 hodin před službou si
                  vyhrazujeme právo účtovat 50% z ceny objednané služby.
                </p>
              </div>
            </div>
          </div>

          {/* Pravidla provozovny */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              6. Pravidla a podmínky návštěvy provozovny
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                Respektujte prosím rezervované časy - při zpoždění 15+ minut
                může být termín zrušen
              </li>
              <li>V provozovně je zakázáno kouření a konzumace alkoholu</li>
              <li>Dbejte na slušné chování a respekt k ostatním klientům</li>
              <li>V případě nemoci prosím termín přesuňte</li>
              <li>Zodpovědnost za cennosti si ponechává klient</li>
            </ul>
          </div>

          {/* Reklamace */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              7. Reklamace a spokojenost klientů
            </h3>
            <p className="text-gray-700 mb-3">
              Vaše spokojenost je naší prioritou. V případě nespokojenosti se
              službou:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                Informujte nás ihned během návštěvy - pokusíme se problém
                vyřešit okamžitě
              </li>
              <li>Reklamaci můžete podat do 48 hodin po návštěvě</li>
              <li>Oprávněné reklamace řešíme bezplatným opakováním služby</li>
              <li>Kontaktujte nás na +420 778 779 938</li>
            </ul>
          </div>

          {/* Ochrana zdraví */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              8. Hygiena a bezpečnost
            </h3>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  Všechny nástroje jsou řádně dezinfikovány a sterilizovány
                </li>
                <li>
                  Používáme pouze jednorázové materiály (žiletky, ručníky)
                </li>
                <li>Dodržujeme všechny hygienické normy a předpisy</li>
                <li>
                  V případě kožních problémů si vyhrazujeme právo odmítnout
                  službu
                </li>
              </ul>
            </div>
          </div>

          {/* Odpovědnost */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              9. Omezení odpovědnosti
            </h3>
            <div className="space-y-3">
              <p className="text-gray-700">FlekCuts nenese odpovědnost za:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Škody způsobené nedodržením našich doporučení po službě</li>
                <li>
                  Alergické reakce na použité produkty (informujte nás o
                  alergiích předem)
                </li>
                <li>Ztrátu nebo poškození osobních věcí klienta</li>
                <li>Následky nesprávných informací poskytnutých klientem</li>
              </ul>
            </div>
          </div>

          {/* Závěrečná ustanovení */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              10. Závěrečná ustanovení
            </h3>
            <div className="space-y-3">
              <p className="text-gray-700">
                Tyto obchodní podmínky se řídí právním řádem České republiky.
                Sporné otázky budou řešeny smírnou cestou, v případě neúspěchu
                příslušnými českými soudy.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Změny podmínek:</strong> FlekCuts si vyhrazuje právo
                  změnit tyto obchodní podmínky. O změnách budou klienti
                  informováni prostřednictvím webových stránek.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              <strong>Datum účinnosti:</strong>{" "}
              {new Date().toLocaleDateString("cs-CZ")}
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Tyto podmínky jsou v souladu s českým obchodním právem a zákoníkem
              práce.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServiceModal;
