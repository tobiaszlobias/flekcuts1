"use client";

import { useState, useEffect } from "react";
import { MapPin, Phone, Clock, ExternalLink } from "lucide-react";
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";

const Footer = () => {
  const openingHours = [
    { day: "Pondělí", hours: "9:00 - 11:45, 13:00 - 17:00" },
    { day: "Úterý", hours: "9:00 - 11:45, 13:00 - 17:00" },
    { day: "Středa", hours: "9:00 - 11:45, 13:00 - 17:00" },
    { day: "Čtvrtek", hours: "13:00 - 21:00" },
    { day: "Pátek", hours: "9:00 - 11:45, 13:00 - 17:00" },
    { day: "Sobota", hours: "Zavřeno", isClosed: true },
    { day: "Neděle", hours: "Zavřeno", isClosed: true },
  ];

  const handleDirectionsClick = () => {
    const address = "Zámecké náměstí 19, Bruntál";
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, "_blank");
  };

  const handlePhoneClick = () => {
    window.open("tel:+420778779938");
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section with Info and Opening Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* About & Contact Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4">FlekCuts</h3>
              <p className="text-gray-300 leading-relaxed">
                Profesionální holičství v srdci Bruntálu. Specializuji se na
                moderní střihy, klasické úpravy vousů a kompletní péči o vaše
                vlasy.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-semibold mb-3">Kontakt</h4>

              <button
                onClick={handlePhoneClick}
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
              >
                <Phone className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                <span>+420 778 779 938</span>
              </button>

              <button
                onClick={handleDirectionsClick}
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
              >
                <MapPin className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                <div className="text-left">
                  <div>Zámecké náměstí 19</div>
                  <div>Bruntál</div>
                </div>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            {/* Quick Booking Actions */}
            <div className="pt-4 border-t border-gray-700">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    const bookingSection = document.getElementById("objednat");
                    bookingSection?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium flex-1"
                >
                  Objednat termín
                </button>

                <SignedIn>
                  <button
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent("viewChange", { detail: "dashboard" })
                      );
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors font-medium flex-1"
                  >
                    Moje objednávky
                  </button>
                </SignedIn>

                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors font-medium flex-1">
                      Přihlásit se
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-400" />
              <h4 className="text-lg font-semibold">Otevírací doba</h4>
            </div>

            <div className="space-y-2">
              {openingHours.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-1"
                >
                  <span className="text-gray-300 font-medium">{item.day}</span>
                  <span
                    className={`text-sm ${
                      item.isClosed
                        ? "text-red-400 font-medium"
                        : "text-gray-300"
                    }`}
                  >
                    {item.hours}
                  </span>
                </div>
              ))}
            </div>

            {/* Current Status */}
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <CurrentStatus />
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              Kde nás najdete
            </h4>
            <button
              onClick={handleDirectionsClick}
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 text-sm"
            >
              Otevřít v mapách
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-700">
            {/* Map Container */}
            <div className="relative w-full h-64 md:h-80 lg:h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2578.5123456789!2d17.464722!3d49.988611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4713d9f5a5b4c8f1%3A0x1234567890abcdef!2sZ%C3%A1meck%C3%A9%20n%C3%A1m%C4%9Bst%C3%AD%2019%2C%20792%2001%20Brunt%C3%A1l!5e0!3m2!1scs!2scz!4v1234567890123"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
                title="FlekCuts Location"
              ></iframe>

              {/* Overlay with address info */}
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white p-3 rounded-lg max-w-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold">FlekCuts</div>
                    <div className="text-gray-300">Zámecké náměstí 19</div>
                    <div className="text-gray-300">792 01 Bruntál</div>
                  </div>
                </div>
              </div>

              {/* Click overlay to prevent accidental map interactions */}
              <div
                className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-0 transition-opacity"
                onClick={handleDirectionsClick}
                title="Klikněte pro otevření v mapách"
              />
            </div>
          </div>
        </div>

        {/* Bottom Section with Legal Links */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 FlekCuts. Všechna práva vyhrazena.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("showPrivacyPolicy"));
                }}
                className="text-gray-400 hover:text-white transition-colors underline"
              >
                Ochrana osobních údajů
              </button>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("showTermsOfService"));
                }}
                className="text-gray-400 hover:text-white transition-colors underline"
              >
                Obchodní podmínky
              </button>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("showBusinessInfo"));
                }}
                className="text-gray-400 hover:text-white transition-colors underline"
              >
                Právní informace
              </button>
              <span className="text-gray-500 text-xs hidden sm:inline">
                Profesionální holičství • Bruntál
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Component to show current open/closed status
const CurrentStatus = () => {
  const [currentStatus, setCurrentStatus] = useState<{
    isOpen: boolean;
    message: string;
  }>({ isOpen: false, message: "" });

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM format

      let isOpen = false;
      let message = "";

      switch (currentDay) {
        case 1: // Monday
        case 2: // Tuesday
        case 3: // Wednesday
        case 5: // Friday
          if (
            (currentTime >= 900 && currentTime <= 1145) ||
            (currentTime >= 1300 && currentTime <= 1700)
          ) {
            isOpen = true;
            message = "Nyní otevřeno";
          } else if (currentTime < 900) {
            message = "Otevřeno od 9:00";
          } else if (currentTime > 1145 && currentTime < 1300) {
            message = "Polední pauza - otevřeno od 13:00";
          } else {
            message = "Zavřeno - otevřeno zítra od 9:00";
          }
          break;

        case 4: // Thursday
          if (currentTime >= 1300 && currentTime <= 2100) {
            isOpen = true;
            message = "Nyní otevřeno";
          } else if (currentTime < 1300) {
            message = "Otevřeno od 13:00";
          } else {
            message = "Zavřeno - otevřeno zítra od 9:00";
          }
          break;

        case 6: // Saturday
          message = "Zavřeno - otevřeno v pondělí od 9:00";
          break;

        case 0: // Sunday
          message = "Zavřeno - otevřeno zítra od 9:00";
          break;
      }

      setCurrentStatus({ isOpen, message });
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          currentStatus.isOpen ? "bg-green-400" : "bg-red-400"
        }`}
      ></div>
      <span
        className={`text-sm font-medium ${
          currentStatus.isOpen ? "text-green-400" : "text-red-400"
        }`}
      >
        {currentStatus.message}
      </span>
    </div>
  );
};

export default Footer;
