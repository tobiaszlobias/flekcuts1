"use client";

import React from "react";
import { X } from "lucide-react";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
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
        <div
          className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-6"
          data-scroll-lock-allow="true"
        >
          <div className="text-sm text-gray-600">
            <div className="font-semibold text-gray-900">
              Všeobecné obchodní podmínky (rezervace termínů)
            </div>
            <div>Účinnost od: 20. 1. 2026</div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              1. Poskytovatel
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
              <div className="font-semibold">Štěpán Flekač (fyzická osoba podnikající)</div>
              <div>IČO: 21795908</div>
              <div>Provozovna: Zámecké náměstí 19, Bruntál</div>
              <div>Telefon: +420 778 779 938</div>
              <div>E-mail: stepaflekac1@gmail.com</div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              2. Služby
            </h3>
            <p className="text-gray-700">
              Poskytujeme holičské služby dle aktuální nabídky v provozovně.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              3. Rezervace termínu a vznik závazku
            </h3>
            <p className="text-gray-700 mb-2">Rezervaci lze vytvořit:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>online prostřednictvím webu,</li>
              <li>telefonicky,</li>
              <li>osobně v provozovně.</li>
            </ul>
            <p className="text-gray-700 mt-3">
              Rezervace je závazná okamžikem jejího odeslání online a zobrazením
              potvrzení na webu. Potvrzovací e-mail slouží jako informativní
              kontrola; pokud nedorazí, rezervace platí.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              4. Cena a platba
            </h3>
            <p className="text-gray-700">
              Platba probíhá v provozovně po poskytnutí služby v hotovosti nebo
              kartou. Za vytvoření rezervace neúčtujeme poplatek. Aktuální ceny
              jsou uvedeny v ceníku na webu nebo v provozovně.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              5. Zrušení a změna termínu
            </h3>
            <p className="text-gray-700">
              Zrušení nebo změna termínu je možná nejpozději 24 hodin předem
              online nebo telefonicky.
            </p>
            <p className="text-gray-700 mt-3">
              V kratší lhůtě nás prosím kontaktuj telefonicky.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              6. Pravidla návštěvy provozovny
            </h3>
            <p className="text-gray-700">
              Při zpoždění 15+ minut si vyhrazujeme právo termín zrušit nebo
              přizpůsobit tak, aby byla respektována navazující rezervace.
            </p>
            <p className="text-gray-700 mt-3">
              Prosíme o dodržování provozních pravidel a ohleduplnost k ostatním
              klientům.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              7. Reklamace
            </h3>
            <p className="text-gray-700">
              V případě nespokojenosti nás kontaktuj bez zbytečného odkladu, aby
              bylo možné situaci posoudit a domluvit nápravu.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              8. Ochrana osobních údajů
            </h3>
            <p className="text-gray-700">
              Zpracování osobních údajů se řídí „Zásadami ochrany osobních údajů“.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              9. Informace o odstoupení od smlouvy
            </h3>
            <p className="text-gray-700">
              U služeb poskytovaných v konkrétním termínu se mohou uplatnit
              zákonné výjimky z práva spotřebitele na odstoupení od smlouvy
              uzavřené na dálku; po poskytnutí služby nelze odstoupení uplatnit
              v rozsahu stanoveném právními předpisy.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              10. Mimosoudní řešení spotřebitelských sporů (ADR)
            </h3>
            <p className="text-gray-700">
              V případě spotřebitelského sporu lze využít mimosoudní řešení sporu
              u České obchodní inspekce (ČOI). Podrobné informace a postup jsou
              dostupné na webu ČOI.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              11. Závěrečná ustanovení
            </h3>
            <p className="text-gray-700">
              Tyto podmínky se řídí právním řádem České republiky. Aktuální znění
              je vždy dostupné na webu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServiceModal;
