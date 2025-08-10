"use client";

import React from "react";
import { X, MapPin, Phone, Mail, Building, FileText } from "lucide-react";

interface BusinessInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BusinessInfoModal: React.FC<BusinessInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
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
          {/* Základní údaje o podnikateli */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Základní údaje o podnikateli
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Obchodní jméno:
                  </p>
                  <p className="text-gray-900 font-semibold">Štěpán Flekač</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Právní forma:
                  </p>
                  <p className="text-gray-900">Fyzická osoba podnikající</p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Předmět podnikání:
                </p>
                <p className="text-gray-700">Holičství, kadeřnictví</p>
              </div>
            </div>
          </div>

          {/* Kontaktní údaje */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Kontaktní údaje
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Adresa provozovny:</p>
                  <p className="text-gray-900 font-medium">
                    Zámecké náměstí 19
                    <br />
                    Bruntál, Czechia
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Phone className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Telefon:</p>
                  <p className="text-gray-900 font-medium">+420 778 779 938</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Mail className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">E-mail:</p>
                  <p className="text-gray-900 font-medium">info@flekcuts.cz</p>
                </div>
              </div>
            </div>
          </div>

          {/* Registrační údaje */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Registrační údaje
            </h3>
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    IČO (Identifikační číslo):
                  </p>
                  <p className="text-gray-900 font-mono">21795908</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Identifikační číslo provozovny:
                  </p>
                  <p className="text-gray-900 font-mono">1015359981</p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-orange-200">
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Registrace živnosti:
                </p>
                <p className="text-gray-700">Městský úřad Bruntál</p>
                <p className="text-sm text-gray-600 mt-1">
                  Datum zahájení: 08.10.2024
                </p>
              </div>
            </div>
          </div>

          {/* Otevírací doba */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Provozní doba
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">Pondělí:</span>
                    <span>9:00-11:45, 13:00-17:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Úterý:</span>
                    <span>9:00-11:45, 13:00-17:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Středa:</span>
                    <span>9:00-11:45, 13:00-17:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Čtvrtek:</span>
                    <span>13:00-21:00</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">Pátek:</span>
                    <span>9:00-11:45, 13:00-17:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sobota:</span>
                    <span className="text-red-600">Zavřeno</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Neděle:</span>
                    <span className="text-red-600">Zavřeno</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Regulační informace */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Regulační informace
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-1">
                  Dohled nad živností:
                </p>
                <p className="text-sm text-blue-700">
                  Krajská hygienická stanice Moravskoslezského kraje
                </p>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-1">
                  Řešení sporů:
                </p>
                <p className="text-sm text-green-700">
                  Česká obchodní inspekce - územní inspektorát pro
                  Moravskoslezský kraj
                </p>
              </div>
            </div>
          </div>

          {/* Online řešení sporů */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Online řešení spotřebitelských sporů
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-gray-700 text-sm">
                Platforma pro online řešení spotřebitelských sporů EU je
                dostupná na adrese:{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              <strong>Aktualizováno:</strong>{" "}
              {new Date().toLocaleDateString("cs-CZ")}
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Tyto informace jsou uvedeny v souladu s českým obchodním právem
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessInfoModal;
