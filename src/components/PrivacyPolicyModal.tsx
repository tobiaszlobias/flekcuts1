"use client";

import React from "react";
import { X } from "lucide-react";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
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
            Zásady ochrany osobních údajů
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
          {/* Správce údajů */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              1. Správce osobních údajů
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>FlekCuts</strong>
                <br />
                Zámecké náměstí 19, Bruntál
                <br />
                Telefon: +420 778 779 938
              </p>
            </div>
            <p className="text-gray-600 mt-3">
              Jsme správcem vašich osobních údajů a zavazujeme se je chránit v
              souladu s platnou legislativou České republiky a nařízením GDPR.
            </p>
          </div>

          {/* Jaké údaje sbíráme */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              2. Jaké osobní údaje sbíráme
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">
                  Při objednávání termínu:
                </h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Jméno a příjmení</li>
                  <li>E-mailová adresa</li>
                  <li>Datum a čas objednávky</li>
                  <li>Vybraná služba</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">
                  Automaticky sbírané údaje:
                </h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>IP adresa (pro zabezpečení)</li>
                  <li>Informace o prohlížeči (pro technické účely)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Účel zpracování */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              3. Účel zpracování osobních údajů
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Zpracování a potvrzení vaší objednávky</li>
              <li>Komunikace ohledně termínu (potvrzení, připomínky, změny)</li>
              <li>Vedení evidence objednávek</li>
              <li>Zlepšení našich služeb</li>
            </ul>
          </div>

          {/* Právní základ */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              4. Právní základ zpracování
            </h3>
            <p className="text-gray-700">
              Vaše osobní údaje zpracováváme na základě{" "}
              <strong>vašeho souhlasu</strong> při zadávání objednávky a z
              důvodu <strong>plnění smlouvy</strong> (poskytnutí objednané
              služby).
            </p>
          </div>

          {/* Doba uchování */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              5. Doba uchování údajů
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  <strong>Aktivní objednávky:</strong> Do splnění služby
                </li>
                <li>
                  <strong>Dokončené objednávky:</strong> 3 roky (pro účetní a
                  daňové účely)
                </li>
                <li>
                  <strong>Zrušené objednávky:</strong> 1 rok
                </li>
              </ul>
            </div>
          </div>

          {/* Vaše práva */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              6. Vaše práva
            </h3>
            <p className="text-gray-700 mb-3">Máte právo na:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Přístup ke svým osobním údajům</li>
                <li>Opravu nesprávných údajů</li>
                <li>Výmaz údajů (právo být zapomenut)</li>
                <li>Omezení zpracování</li>
              </ul>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Přenositelnost údajů</li>
                <li>Odvolání souhlasu</li>
                <li>Podání stížnosti u ÚOOÚ</li>
              </ul>
            </div>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-gray-700">
                <strong>Pro uplatnění svých práv nás kontaktujte:</strong>
                <br />
                📞 Telefon: +420 778 779 938
                <br />
                📍 Osobně: Zámecké náměstí 19, Bruntál
              </p>
            </div>
          </div>

          {/* Zabezpečení */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              7. Zabezpečení údajů
            </h3>
            <p className="text-gray-700">
              Vaše osobní údaje chráníme pomocí moderních technických a
              organizačních opatření. Používáme šifrované připojení (HTTPS),
              bezpečné databázové systémy a pravidelně aktualizujeme naše
              bezpečnostní protokoly.
            </p>
          </div>

          {/* Sdílení údajů */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              8. Sdílení údajů s třetími stranami
            </h3>
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Vaše osobní údaje NESDÍLÍME s třetími stranami</strong>,
                kromě případů vyžadovaných zákonem nebo s vaším výslovným
                souhlasem.
              </p>
            </div>
          </div>

          {/* Cookies */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              9. Cookies a sledování
            </h3>
            <p className="text-gray-700">
              Naše webová stránka používá pouze{" "}
              <strong>technické cookies</strong> nezbytné pro její správné
              fungování (přihlašování, formuláře). Nepoužíváme marketingové,
              analytické nebo sledovací cookies.
            </p>
          </div>

          {/* Změny zásad */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              10. Změny těchto zásad
            </h3>
            <p className="text-gray-700">
              Tyto zásady můžeme aktualizovat v případě změn našich služeb nebo
              právních požadavků. O významných změnách vás budeme informovat
              prostřednictvím naší webové stránky.
            </p>
          </div>

          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              <strong>Datum účinnosti:</strong>{" "}
              {new Date().toLocaleDateString("cs-CZ")}
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Tyto zásady jsou v souladu s nařízením GDPR a českým zákonem o
              ochraně osobních údajů.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;
