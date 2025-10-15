"use client";

import { useState, useEffect } from "react";
import { Scissors } from "lucide-react";
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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  const handleViewChange = (view: "home" | "dashboard" | "admin") => {
    setActiveView(view);
    setIsMenuOpen(false);

    if (isSignedIn) {
      // Dispatch custom event to notify page component for authenticated users
      window.dispatchEvent(new CustomEvent("viewChange", { detail: view }));
    }

    // Scroll to top when changing views
    if (view !== "home" || activeView !== "home") {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleLogoClick = () => {
    // Scroll to top immediately using native smooth scroll
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Handle view change asynchronously
    if (isSignedIn && activeView !== "home") {
      setActiveView("home");
      setIsMenuOpen(false);
      window.dispatchEvent(new CustomEvent("viewChange", { detail: "home" }));
    }
  };

  const handleServicesClick = () => {
    if (isSignedIn && (activeView === "dashboard" || activeView === "admin")) {
      // If on dashboard, switch to home view first
      setActiveView("home");
      setIsMenuOpen(false);
      window.dispatchEvent(new CustomEvent("viewChange", { detail: "home" }));

      // Wait for view change to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById("services");
        if (element) {
          const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    } else {
      // If already on home view or not signed in, just scroll immediately
      const element = document.getElementById("services");
      if (element) {
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }

        .animate-slideDown {
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>

      <nav className="bg-white/30 backdrop-blur-md shadow-sm sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-2 transition-all duration-300 group"
            >
              <Scissors className="h-8 w-8 text-[#FF6B35] group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-crimson italic text-xl font-bold text-gray-900">
                FlekCuts
              </span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <SignedIn>
                {/* Authenticated navigation */}
                <>
                  <button
                    onClick={() => handleViewChange("dashboard")}
                    className="font-montserrat text-gray-700 hover:text-[#FF6B35] transition-all duration-300 relative px-4 py-2 rounded-full group cursor-pointer border border-transparent hover:border-[#FF6B35]"
                  >
                    <span className="relative z-10">Moje objednávky</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleViewChange("admin")}
                      className="font-montserrat text-gray-700 hover:text-[#FF6B35] transition-all duration-300 relative px-4 py-2 rounded-full group cursor-pointer border border-transparent hover:border-[#FF6B35]"
                    >
                      <span className="relative z-10">Admin</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleViewChange("home")}
                    className="font-montserrat text-gray-700 hover:text-[#FF6B35] transition-all duration-300 relative px-4 py-2 rounded-full group cursor-pointer border border-transparent hover:border-[#FF6B35]"
                  >
                    <span className="relative z-10">Domů</span>
                  </button>
                  <button
                    onClick={() => scrollToSection("objednat")}
                    className="font-montserrat text-gray-700 hover:text-[#FF6B35] transition-all duration-300 relative px-4 py-2 rounded-full group cursor-pointer border border-transparent hover:border-[#FF6B35]"
                  >
                    <span className="relative z-10">Objednat</span>
                  </button>
                  <button
                    onClick={handleServicesClick}
                    className="font-montserrat text-gray-700 hover:text-[#FF6B35] transition-all duration-300 relative px-4 py-2 rounded-full group cursor-pointer border border-transparent hover:border-[#FF6B35]"
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
                    className="font-montserrat text-gray-700 hover:text-[#FF6B35] transition-all duration-300 relative px-3 py-2 rounded-full group cursor-pointer border border-transparent hover:border-[#FF6B35]"
                  >
                    <span className="relative z-10">Objednat</span>
                  </button>
                  <button
                    onClick={handleServicesClick}
                    className="font-montserrat text-gray-700 hover:text-[#FF6B35] transition-all duration-300 relative px-3 py-2 rounded-full group cursor-pointer border border-transparent hover:border-[#FF6B35]"
                  >
                    <span className="relative z-10">Služby</span>
                  </button>
                  <SignInButton mode="modal">
                    <button className="font-montserrat text-gray-700 hover:text-[#FF6B35] transition-all duration-300 relative px-3 py-2 rounded-full group cursor-pointer border border-transparent hover:border-[#FF6B35]">
                      <span className="relative z-10">Přihlásit se</span>
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="font-montserrat bg-[#FF6B35] text-white px-6 py-2 rounded-full hover:bg-[#FF6B35] transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 cursor-pointer relative overflow-hidden group">
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
                className="text-gray-700 p-2 rounded-md transition-all duration-200 cursor-pointer relative w-10 h-10"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-4 relative">
                    <span
                      className={`absolute left-0 w-full h-[2px] bg-gray-700 transition-all duration-300 ease-in-out ${
                        isMenuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0'
                      }`}
                    ></span>
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-gray-700 transition-all duration-300 ease-in-out ${
                        isMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                      }`}
                    ></span>
                    <span
                      className={`absolute left-0 w-full h-[2px] bg-gray-700 transition-all duration-300 ease-in-out ${
                        isMenuOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0'
                      }`}
                    ></span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop Blur Overlay */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed top-16 left-0 right-0 bottom-0 bg-black/10 backdrop-blur-sm"
          style={{ zIndex: 9998, pointerEvents: 'all' }}
          onClick={() => setIsMenuOpen(false)}
          onTouchStart={(e) => e.preventDefault()}
          onMouseDown={(e) => e.preventDefault()}
        />
      )}

      {/* Mobile Navigation - Overlay */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed left-0 right-0 top-16 shadow-sm animate-slideDown"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            pointerEvents: 'all',
            zIndex: 9999
          }}
        >
          <div className="px-4 pt-4 pb-4 space-y-2">
                <SignedIn>
                  {/* Authenticated mobile navigation */}
                  <>
                    <button
                      onClick={() => {
                        handleViewChange("home");
                        setTimeout(() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 100);
                      }}
                      className="font-montserrat block w-full text-center px-4 py-2.5 text-gray-700 bg-white/95 backdrop-blur-lg border border-gray-200 hover:border-[#FF6B35] hover:text-[#FF6B35] rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                      Domů
                    </button>
                    <button
                      onClick={handleServicesClick}
                      className="font-montserrat block w-full text-center px-4 py-2.5 text-gray-700 bg-white/95 backdrop-blur-lg border border-gray-200 hover:border-[#FF6B35] hover:text-[#FF6B35] rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                      Služby
                    </button>
                    <button
                      onClick={() => handleViewChange("dashboard")}
                      className="font-montserrat block w-full text-center px-4 py-2.5 text-gray-700 bg-white/95 backdrop-blur-lg border border-gray-200 hover:border-[#FF6B35] hover:text-[#FF6B35] rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                      Moje objednávky
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleViewChange("admin")}
                        className="font-montserrat block w-full text-center px-4 py-2.5 text-gray-700 bg-white/95 backdrop-blur-lg border border-gray-200 hover:border-[#FF6B35] hover:text-[#FF6B35] rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
                      >
                        Admin
                      </button>
                    )}
                    <button
                      onClick={() => scrollToSection("objednat")}
                      className="font-montserrat block w-full text-center px-4 py-2.5 text-gray-700 bg-white/95 backdrop-blur-lg border border-gray-200 hover:border-[#FF6B35] hover:text-[#FF6B35] rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                      Objednat
                    </button>
                  </>
                </SignedIn>
                <SignedOut>
                  {/* Unauthenticated mobile navigation */}
                  <>
                    <button
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setIsMenuOpen(false);
                      }}
                      className="font-montserrat block w-full text-center px-4 py-2.5 text-gray-700 bg-white/95 backdrop-blur-lg border border-gray-200 hover:border-[#FF6B35] hover:text-[#FF6B35] rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                      Domů
                    </button>
                    <button
                      onClick={handleServicesClick}
                      className="font-montserrat block w-full text-center px-4 py-2.5 text-gray-700 bg-white/95 backdrop-blur-lg border border-gray-200 hover:border-[#FF6B35] hover:text-[#FF6B35] rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                      Služby
                    </button>
                    <button
                      onClick={() => scrollToSection("objednat")}
                      className="font-montserrat block w-full text-center px-4 py-2.5 text-gray-700 bg-white/95 backdrop-blur-lg border border-gray-200 hover:border-[#FF6B35] hover:text-[#FF6B35] rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                      Objednat
                    </button>
                    <div className="border-t border-gray-200 my-3"></div>
                    <SignInButton mode="modal">
                      <button className="font-montserrat block w-full text-center px-4 py-2.5 text-gray-700 bg-white/95 backdrop-blur-lg border border-gray-200 hover:border-[#FF6B35] hover:text-[#FF6B35] rounded-full transition-all duration-200 active:scale-95 cursor-pointer">
                        Přihlásit se
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="font-montserrat block w-full text-center px-4 py-2.5 text-gray-700 bg-white/95 backdrop-blur-lg border border-gray-200 hover:border-[#FF6B35] hover:text-[#FF6B35] rounded-full transition-all duration-200 active:scale-95 cursor-pointer">
                        Registrovat se
                      </button>
                    </SignUpButton>
                  </>
                </SignedOut>
              </div>
            </div>
          )}
    </>
  );
};

export default Navbar;
