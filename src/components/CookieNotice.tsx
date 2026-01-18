"use client";

import React, { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";

const CookieNotice = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem("flekcuts-cookie-consent");
    if (!cookieConsent) {
      // Show banner after a short delay
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("flekcuts-cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("flekcuts-cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-[#FF6B35]/15 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] z-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Content */}
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="w-6 h-6 text-[#FF6B35] mt-1 flex-shrink-0" />
            <div className="text-sm">
              <h4 className="font-semibold text-gray-900 mb-1">
                Informace o cookies
              </h4>
              <p className="text-gray-700 leading-relaxed">
                Naše webová stránka používá pouze{" "}
                <strong>technické cookies</strong> nezbytné pro správné
                fungování (přihlašování a formuláře). Nepoužíváme analytické
                nebo marketingové cookies. Více informací najdete v našich{" "}
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("showPrivacyPolicy"));
                  }}
                  className="text-[#FF6B35] hover:text-[#E5572C] underline font-medium"
                >
                  zásadách ochrany osobních údajů
                </button>
                .
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-white transition-colors"
            >
              Odmítnout
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm bg-[#FF6B35] text-white rounded-lg hover:bg-[#E5572C] transition-colors font-medium shadow-sm"
            >
              Přijmout
            </button>
            <button
              onClick={handleDecline}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Zavřít"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieNotice;
