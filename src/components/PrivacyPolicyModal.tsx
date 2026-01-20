"use client";

import React from "react";
import { X } from "lucide-react";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  useBodyScrollLock(isOpen);
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
          <div className="text-sm text-gray-600">
            <div className="font-semibold text-gray-900">
              Zásady ochrany osobních údajů (GDPR)
            </div>
            <div>Účinnost od: 20. 1. 2026</div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              1. Správce osobních údajů
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
              <div className="font-semibold">Štěpán Flekač (fyzická osoba podnikající)</div>
              <div>IČO: 21795908</div>
              <div>Provozovna: Zámecké náměstí 19, Bruntál, Česká republika</div>
              <div>Telefon: +420 778 779 938</div>
              <div>E-mail: stepaflekac1@gmail.com</div>
            </div>
            <p className="text-gray-700 mt-3">
              Tyto zásady vysvětlují, jak zpracováváme osobní údaje při online
              rezervacích a při poskytování holičských služeb.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              2. Jaké osobní údaje zpracováváme
            </h3>

            <div className="space-y-4 text-gray-700">
              <div>
                <div className="font-medium text-gray-900 mb-2">
                  A) Údaje při vytvoření rezervace
                </div>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>jméno a příjmení</li>
                  <li>e-mailová adresa</li>
                  <li>telefonní číslo</li>
                  <li>vybraná služba</li>
                  <li>datum a čas termínu</li>
                  <li>poznámka (volitelné)</li>
                </ul>
              </div>

              <div>
                <div className="font-medium text-gray-900 mb-2">
                  B) Údaje při přihlášení (pokud je použito)
                </div>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    identifikátory účtu a přihlášení a související kontaktní údaje
                    (typicky e-mail a identifikátor uživatele)
                  </li>
                </ul>
              </div>

              <div>
                <div className="font-medium text-gray-900 mb-2">
                  C) Technické údaje při provozu webu
                </div>
                <p className="text-gray-700">
                  Při provozu webu mohou naši poskytovatelé infrastruktury
                  zpracovávat technické a bezpečnostní údaje (např. IP adresa,
                  informace o prohlížeči/zařízení) pro zajištění provozu a
                  bezpečnosti.
                </p>
              </div>

              <div>
                <div className="font-medium text-gray-900 mb-2">
                  D) Údaje o volbě cookies
                </div>
                <p className="text-gray-700">
                  Volba souhlasu/nesouhlasu s volitelnými kategoriemi (analytika,
                  externí obsah) se ukládá do prohlížeče uživatele.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              3. Účely zpracování
            </h3>
            <p className="text-gray-700 mb-2">
              Osobní údaje zpracováváme za účelem:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>vytvoření a správy rezervace termínu,</li>
              <li>komunikace k rezervaci (informativní potvrzení, připomínky, změny, zrušení),</li>
              <li>vedení evidence rezervací a provozní agendy,</li>
              <li>zabezpečení a ochrany služby (prevence zneužití, řešení incidentů),</li>
              <li>měření návštěvnosti a výkonu webu (pouze po souhlasu),</li>
              <li>zobrazení mapy (pouze po souhlasu).</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              4. Právní základy zpracování
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>
                plnění smlouvy a kroky před uzavřením smlouvy – rezervace a komunikace k termínu
                (čl. 6 odst. 1 písm. b) GDPR),
              </li>
              <li>
                oprávněný zájem – zabezpečení a ochrana služby (čl. 6 odst. 1 písm. f) GDPR),
              </li>
              <li>
                souhlas – analytika (Vercel Analytics + Speed Insights) a externí obsah (Google Maps)
                (čl. 6 odst. 1 písm. a) GDPR.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              5. Příjemci / zpracovatelé
            </h3>
            <p className="text-gray-700">
              Osobní údaje mohou být v nezbytném rozsahu zpřístupněny poskytovatelům technických služeb:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mt-2">
              <li>Clerk (přihlášení a správa účtů),</li>
              <li>Convex (backend a databáze rezervací),</li>
              <li>Resend (odesílání informativních e-mailů),</li>
              <li>Vercel (hosting a provoz webu),</li>
              <li>Vercel Analytics + Speed Insights (analytika výkonu – pouze po souhlasu),</li>
              <li>Google Maps (externí obsah – pouze po souhlasu).</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              6. Předání mimo EU/EHP
            </h3>
            <p className="text-gray-700">
              V závislosti na infrastruktuře poskytovatelů může docházet k předání osobních údajů
              mimo EU/EHP. V takovém případě je předání realizováno na základě odpovídajících záruk
              dle GDPR (např. standardních smluvních doložek) a souvisejících opatření poskytovatelů.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              7. Doba uchování
            </h3>
            <div className="space-y-3 text-gray-700">
              <p>
                Rezervace a související záznamy uchováváme po dobu nezbytnou pro evidenci rezervací,
                komunikaci k termínu a řešení změn/storen a případných reklamací či sporů; poté jsou
                odstraněny nebo anonymizovány.
              </p>
              <p>
                Technické a bezpečnostní logy uchováváme po dobu nezbytně nutnou k zajištění provozu
                a bezpečnosti.
              </p>
              <p>
                Volbu cookies uchováváme v prohlížeči do změny/odvolání nebo do vymazání v prohlížeči.
              </p>
              <p className="text-sm text-gray-600">
                Uvedení doby uchování (nebo kritérií) je součástí informační povinnosti dle čl. 13 GDPR.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              8. Povinnost poskytnutí údajů
            </h3>
            <p className="text-gray-700">
              Údaje potřebné pro vytvoření rezervace jsou nezbytné pro dokončení rezervace.
              Bez jejich poskytnutí nelze rezervaci vytvořit.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              9. Práva subjektu údajů
            </h3>
            <p className="text-gray-700 mb-2">Máš právo:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>na přístup k osobním údajům,</li>
              <li>na opravu,</li>
              <li>na výmaz (pokud jsou splněny podmínky),</li>
              <li>na omezení zpracování,</li>
              <li>na přenositelnost (v relevantních případech),</li>
              <li>vznést námitku proti zpracování na základě oprávněného zájmu,</li>
              <li>kdykoli odvolat souhlas (u analytiky a map).</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              10. Jak práva uplatnit
            </h3>
            <p className="text-gray-700">
              Kontaktuj nás telefonicky na +420 778 779 938 nebo osobně v provozovně na adrese
              Zámecké náměstí 19, Bruntál nebo e-mailem na: stepaflekac1@gmail.com. Před vyřízením žádosti můžeme přiměřeně ověřit totožnost.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              11. Stížnost
            </h3>
            <p className="text-gray-700">
              Máš právo podat stížnost u Úřadu pro ochranu osobních údajů (ÚOOÚ).
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              12. Zabezpečení
            </h3>
            <p className="text-gray-700">
              Používáme přiměřená technická a organizační opatření k ochraně osobních údajů
              (např. šifrované připojení, řízení přístupů, minimalizace údajů).
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              13. Změny zásad
            </h3>
            <p className="text-gray-700">
              Zásady můžeme aktualizovat. Aktuální znění je vždy dostupné na webu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;
