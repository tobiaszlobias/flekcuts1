"use client";

import { useState, useEffect } from "react";
import { Scissors, Menu, X } from "lucide-react";
import { useAuth, UserButton, SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
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
    <nav className="bg-white/30 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={handleLogoClick}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <Scissors className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">FlekCuts</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <SignedIn>
              {/* Authenticated navigation */}
              <>
                <button
                  onClick={() => handleViewChange("dashboard")}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Moje objednávky
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleViewChange("admin")}
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Admin
                  </button>
                )}
                <button
                  onClick={() => handleViewChange("home")}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Domů
                </button>
                <button
                  onClick={() => scrollToSection("objednat")}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Objednat
                </button>
                <button
                  onClick={handleServicesClick}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Služby
                </button>
                <UserButton />
              </>
            </SignedIn>
            <SignedOut>
              {/* Unauthenticated navigation */}
              <>
                <button
                  onClick={() => scrollToSection("objednat")}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Objednat
                </button>
                <button
                  onClick={handleServicesClick}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Služby
                </button>
                <SignInButton mode="modal">
                  <button className="text-gray-700 hover:text-blue-600 transition-colors">
                    Přihlásit se
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Registrovat se
                  </button>
                </SignUpButton>
              </>
            </SignedOut>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {isSignedIn && <UserButton />}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <SignedIn>
                {/* Authenticated mobile navigation */}
                <>
                  <button
                    onClick={() => handleViewChange("dashboard")}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600"
                  >
                    Moje objednávky
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleViewChange("admin")}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600"
                    >
                      Admin
                    </button>
                  )}
                  <button
                    onClick={() => handleViewChange("home")}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600"
                  >
                    Domů
                  </button>
                  <button
                    onClick={() => scrollToSection("objednat")}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600"
                  >
                    Objednat
                  </button>
                  <button
                    onClick={handleServicesClick}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600"
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
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600"
                  >
                    Objednat
                  </button>
                  <button
                    onClick={handleServicesClick}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600"
                  >
                    Služby
                  </button>
                  <div className="border-t my-2"></div>
                  <SignInButton mode="modal">
                    <button className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600">
                      Přihlásit se
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600">
                      Registrovat se
                    </button>
                  </SignUpButton>
                </>
              </SignedOut>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
