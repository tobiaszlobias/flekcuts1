"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Shield, UserPlus } from "lucide-react";

export default function AdminSetup() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const promoteToAdmin = useMutation(api.roles.promoteToAdmin);

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage("Zadejte email adresu");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      await promoteToAdmin({ email: email.trim() });
      setMessage(`✅ Uživatel ${email} byl úspěšně povýšen na administrátora!`);
      setEmail("");
    } catch (error: unknown) {
      console.error("Failed to promote user:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (errorMessage.includes("Only admins can promote users")) {
        setMessage("❌ Pouze administrátoři mohou povyšovat uživatele");
      } else if (errorMessage.includes("User not found")) {
        setMessage("❌ Uživatel s tímto emailem nebyl nalezen");
      } else {
        setMessage("❌ Nepodařilo se povýšit uživatele");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="mx-auto bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Setup</h1>
            <p className="text-gray-600 mt-2">
              Povyšte uživatele na administrátora
            </p>
          </div>

          <form onSubmit={handlePromote} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email uživatele
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                placeholder="uzivatel@email.com"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                "Povyšování..."
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Povýšit na admina
                </>
              )}
            </button>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.startsWith("✅")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}
          </form>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">📋 Jak na to:</h4>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Uživatel se musí nejdřív zaregistrovat a přihlásit</li>
              <li>2. Zadejte zde jeho email adresu</li>
              <li>3. Po povýšení bude mít přístup k admin panelu</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
