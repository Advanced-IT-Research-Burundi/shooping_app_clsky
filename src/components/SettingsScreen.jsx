import React, { useState } from "react";
import { ArrowLeft, User, Mail, DollarSign, RefreshCw, Save, CheckCircle2 } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function SettingsScreen() {
  const navigate = useNavigate();
  const context = useOutletContext() || {};
  const user = context.user || { name: "Commerçant", email: "commercial@exemple.com" };

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currency, setCurrency] = useState("RMB");
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 active:bg-gray-100 rounded-xl transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Paramètres</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">
            Profil Utilisateur
          </h2>
          <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<User />}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail />}
              />
            </div>
          </div>
        </section>

        {/* App Preferences */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">
            Préférences de l'application
          </h2>
          <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
            <div className="space-y-2">
              <Label>Devise par défaut</Label>
              <div className="grid grid-cols-3 gap-2">
                {["RMB", "USD", "BIF"].map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setCurrency(curr)}
                    className={`py-3 rounded-2xl border-2 transition-all font-medium ${
                      currency === curr
                        ? "border-orange-500 bg-orange-50 text-orange-600 shadow-sm"
                        : "border-gray-100 bg-gray-50 text-gray-500"
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-50">
              <Label>Taux de change manuels (1 USD)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold ml-1">En RMB</span>
                  <Input type="number" placeholder="7.15" icon={<RefreshCw className="w-4 h-4" />} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold ml-1">En BIF</span>
                  <Input type="number" placeholder="7500" icon={<RefreshCw className="w-4 h-4" />} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-red-400 uppercase tracking-wider px-1">
            Zone de danger
          </h2>
          <button className="w-full bg-red-50 text-red-600 py-4 rounded-3xl font-medium active:bg-red-100 transition border border-red-100">
            Supprimer mon compte
          </button>
        </section>
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-24 left-6 right-6 z-50">
        <button
          onClick={handleSave}
          className={`w-full h-14 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all duration-300 transform ${
            saved 
            ? "bg-green-500 scale-95" 
            : "bg-gray-900 active:scale-95"
          } text-white font-bold`}
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-6 h-6 animate-in zoom-in duration-300" />
              <span>Paramètres enregistrés</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Enregistrer les changements</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
