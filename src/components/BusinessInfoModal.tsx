"use client";

import React from "react";
import { X, MapPin, Phone, Mail, Building, FileText } from "lucide-react";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

interface BusinessInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BusinessInfoModal: React.FC<BusinessInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  useBodyScrollLock(isOpen);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Právní informace</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-6">
          <div className="text-gray-700 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Základní údaje o podnikateli
              </h3>
              <p>Jméno: Štěpán Flekač</p>
              <p>Právní forma: fyzická osoba podnikající</p>
              <p>IČO: 21795908</p>
              <p>Předmět podnikání: Holičství, kadeřnictví</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Kontakty
              </h3>
              <p>Adresa provozovny: Zámecké náměstí 19, Bruntál, Česká republika</p>
              <p>Telefon: +420 778 779 938</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Registrační údaje
              </h3>
              <p>Identifikační číslo provozovny: 1015359981</p>
              <p>Registrace živnosti: Městský úřad Bruntál</p>
              <p>Datum zahájení: 08. 10. 2024</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Provozní doba
              </h3>
              <p>Pondělí: 9:00–11:45, 13:00–17:00</p>
              <p>Úterý: 9:00–11:45, 13:00–17:00</p>
              <p>Středa: 9:00–11:45, 13:00–17:00</p>
              <p>Čtvrtek: 13:00–19:30</p>
              <p>Pátek: 9:00–11:45, 13:00–17:00</p>
              <p>Sobota: zavřeno</p>
              <p>Neděle: zavřeno</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Dohled
              </h3>
              <p>Krajská hygienická stanice Moravskoslezského kraje</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Řešení sporů (ADR)
              </h3>
              <p>
                Česká obchodní inspekce (ČOI) – informace k ADR jsou dostupné na webu ČOI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessInfoModal;
