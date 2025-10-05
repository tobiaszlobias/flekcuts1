"use client";

import { useState, useEffect } from "react";
import { Scissors, Menu, X } from "lucide-react";
import {
  useAuth,
  UserButton,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<"home" | "dashboard" | "admin">(
    "home"
  );
  const { isSignedIn } = useAuth();

  // Create user role mutation
  const createUserRole = useMutation(api.roles.createUserRole);

  // Check if current user is admin
  const isAdmin = useQuery(api.roles.isCurrentUserAdmin);

  // Auto-create user role when signed in
  useEffect(() => {
    if (isSignedIn) {
      // Create user role (this will only create if it doesn't exist)
      createUserRole().catch((error) => {
        console.log("Role creation result:", error.message);
      });
    }
  }, [isSignedIn, createUserRole]);

  // Listen for view changes from the page component
  useEffect(() => {
    const handleCurrentViewChange = (event: CustomEvent) => {
      setActiveView(event.detail);
    };

    window.addEventListener(
      "currentViewChange",
      handleCurrentViewChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "currentViewChange",
        handleCurrentViewChange as EventListener
      );
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  const handleViewChange = (view: "home" | "dashboard" | "admin") => {
    setActiveView(view);
    setIsMenuOpen(false);

    if (isSignedIn) {
      // Dispatch custom event to notify page component for authenticated users
      window.dispatchEvent(new CustomEvent("viewChange", { detail: view }));
    }

    // Scroll to top when changing views
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogoClick = () => {
    if (isSignedIn) {
      handleViewChange("home");
    } else {
      // For unauthenticated users, just scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleServicesClick = () => {
    if (isSignedIn && (activeView === "dashboard" || activeView === "admin")) {
      // If on dashboard, switch to home view first, then scroll to services
      setActiveView("home");
      setIsMenuOpen(false);
      window.dispatchEvent(new CustomEvent("viewChange", { detail: "home" }));

      // Wait for view change to complete, then scroll
      setTimeout(() => {
        scrollToSection("services");
      }, 100);
    } else {
      // If already on home view or not signed in, just scroll
      scrollToSection("services");
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes slideDown {
          from {
            max-height: 0;
            opacity: 0;
          }
          to {
            max-height: 500px;
            opacity: 1;
          }
        }

        @keyframes buttonPress {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
          overflow: hidden;
        }

        .animate-press {
          animation: buttonPress 0.3s ease-out;
        }

        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>

      <nav className="bg-white/30 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-2 transition-all duration-300 group"
            >
              <Scissors className="h-8 w-8 text-blue-600 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-xl font-bold text-gray-900">FlekCuts</span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <SignedIn>
                {/* Authenticated navigation */}
                <>
                  <button
                    onClick={() => handleViewChange("dashboard")}
                    className="text-gray-700 hover:text-blue-600 transition-all duration-300 relative px-4 py-2 rounded-full group cursor-pointer hover:outline hover:outline-1 hover:outline-blue-600"
                  >
                    <span className="relative z-10">Moje objednávky</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleViewChange("admin")}
                      className="text-gray-700 hover:text-blue-600 transition-all duration-300 relative px-4 py-2 rounded-full group cursor-pointer hover:outline hover:outline-1 hover:outline-blue-600"
                    >
                      <span className="relative z-10">Admin</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleViewChange("home")}
                    className="text-gray-700 hover:text-blue-600 transition-all duration-300 relative px-4 py-2 rounded-full group cursor-pointer hover:outline hover:outline-1 hover:outline-blue-600"
                  >
                    <span className="relative z-10">Domů</span>
                  </button>
                  <button
                    onClick={() => scrollToSection("objednat")}
                    className="text-gray-700 hover:text-blue-600 transition-all duration-300 relative px-4 py-2 rounded-full group cursor-pointer hover:outline hover:outline-1 hover:outline-blue-600"
                  >
                    <span className="relative z-10">Objednat</span>
                  </button>
                  <button
                    onClick={handleServicesClick}
                    className="text-gray-700 hover:text-blue-600 transition-all duration-300 relative px-4 py-2 rounded-full group cursor-pointer hover:outline hover:outline-1 hover:outline-blue-600"
                  >
                    <span className="relative z-10">Služby</span>
                  </button>
                  <div className="cursor-pointer">
                    <UserButton />
                  </div>
                </>
              </SignedIn>
              <SignedOut>
                {/* Unauthenticated navigation */}
                <>
                  <button
                    onClick={() => scrollToSection("objednat")}
                    className="text-gray-700 hover:text-blue-600 transition-all duration-300 relative px-3 py-2 rounded-full group cursor-pointer border border-transparent hover:border-blue-600"
                  >
                    <span className="relative z-10">Objednat</span>
                  </button>
                  <button
                    onClick={handleServicesClick}
                    className="text-gray-700 hover:text-blue-600 transition-all duration-300 relative px-3 py-2 rounded-full group cursor-pointer border border-transparent hover:border-blue-600"
                  >
                    <span className="relative z-10">Služby</span>
                  </button>
                  <SignInButton mode="modal">
                    <button className="text-gray-700 hover:text-blue-600 transition-all duration-300 relative px-3 py-2 rounded-full group cursor-pointer border border-transparent hover:border-blue-600">
                      <span className="relative z-10">Přihlásit se</span>
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 cursor-pointer relative overflow-hidden group">
                      <span className="relative z-10 font-semibold">
                        Registrovat se
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-40 animate-shimmer"></span>
                    </button>
                  </SignUpButton>
                </>
              </SignedOut>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              {isSignedIn && (
                <div className="cursor-pointer">
                  <UserButton />
                </div>
              )}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 p-2 hover:bg-blue-500/10 rounded-md transition-all duration-300 active:scale-95 cursor-pointer"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6 transition-transform duration-300" />
                ) : (
                  <Menu className="h-6 w-6 transition-transform duration-300" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white/30 backdrop-blur-md border-t border-white/50 animate-slideDown">
              <div className="px-2 pt-2 pb-3 space-y-2">
                <SignedIn>
                  {/* Authenticated mobile navigation */}
                  <>
                    <button
                      onClick={() => handleViewChange("dashboard")}
                      className="block w-full text-left px-4 py-3 text-gray-700 bg-white/50 border border-blue-200 rounded-full hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-300 active:scale-95 cursor-pointer"
                    >
                      Moje objednávky
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleViewChange("admin")}
                        className="block w-full text-left px-4 py-3 text-gray-700 bg-white/50 border border-blue-200 rounded-full hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-300 active:scale-95 cursor-pointer"
                      >
                        Admin
                      </button>
                    )}
                    <button
                      onClick={() => handleViewChange("home")}
                      className="block w-full text-left px-4 py-3 text-gray-700 bg-white/50 border border-blue-200 rounded-full hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-300 active:scale-95 cursor-pointer"
                    >
                      Domů
                    </button>
                    <button
                      onClick={() => scrollToSection("objednat")}
                      className="block w-full text-left px-4 py-3 text-gray-700 bg-white/50 border border-blue-200 rounded-full hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-300 active:scale-95 cursor-pointer"
                    >
                      Objednat
                    </button>
                    <button
                      onClick={handleServicesClick}
                      className="block w-full text-left px-4 py-3 text-gray-700 bg-white/50 border border-blue-200 rounded-full hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-300 active:scale-95 cursor-pointer"
                    >
                      Služby
                    </button>
                  </>
                </SignedIn>
                <SignedOut>
                  {/* Unauthenticated mobile navigation */}
                  <>
                    <button
                      onClick={() => scrollToSection("objednat")}
                      className="block w-full text-left px-4 py-3 text-gray-700 bg-white/50 border border-blue-200 rounded-full hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-300 active:scale-95 cursor-pointer"
                    >
                      Objednat
                    </button>
                    <button
                      onClick={handleServicesClick}
                      className="block w-full text-left px-4 py-3 text-gray-700 bg-white/50 border border-blue-200 rounded-full hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-300 active:scale-95 cursor-pointer"
                    >
                      Služby
                    </button>
                    <div className="border-t border-white/50 my-2"></div>
                    <SignInButton mode="modal">
                      <button className="block w-full text-left px-4 py-3 text-gray-700 bg-white/50 border border-blue-200 rounded-full hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-300 active:scale-95 cursor-pointer">
                        Přihlásit se
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="block w-full px-4 py-3 bg-blue-600 text-white border border-blue-600 rounded-full hover:bg-blue-500 hover:border-blue-500 transition-all duration-300 active:scale-95 font-semibold cursor-pointer relative overflow-hidden group">
                        <span className="relative z-10">Registrovat se</span>
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-40 animate-shimmer"></span>
                      </button>
                    </SignUpButton>
                  </>
                </SignedOut>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
