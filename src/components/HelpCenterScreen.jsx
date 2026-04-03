import React, { useState } from "react";
import {
  ArrowLeft,
  Search,
  MessageCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Clock,
  HelpCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "./ui/input";

const FAQS = [
  {
    id: 1,
    question: "Comment ajouter un nouveau produit ?",
    answer:
      "Accédez à l'onglet 'Achat' en bas de l'écran. Remplissez les informations (nom, prix, devise) et prenez une photo. Cliquez ensuite sur 'Enregistrer l'achat'.",
  },
  {
    id: 2,
    question: "Comment gérer mes fournisseurs ?",
    answer:
      "Dans l'onglet 'Profil', cliquez sur 'Liste des fournisseurs'. Vous pourrez en ajouter de nouveaux ou modifier ceux existants.",
  },
  {
    id: 3,
    question: "Où trouver mes produits archivés ?",
    answer:
      "Les produits archivés sont accessibles via votre profil sous la section 'Produits archivés'. Vous pouvez les restaurer à tout moment.",
  },
  {
    id: 4,
    question: "Comment modifier les taux de change ?",
    answer:
      "Allez dans 'Paramètres' depuis votre profil. Vous y trouverez une section pour définir manuellement les taux USD/RMB et USD/BIF.",
  },
];

export function HelpCenterScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id);
  };

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 active:bg-gray-100 rounded-xl transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Centre d'aide</h1>
      </div>

      <div className="p-6 space-y-8">
        {/* Search */}
        <div className="space-y-4">
          <Input
            placeholder="Rechercher une question..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            className="h-14 bg-white shadow-sm border-gray-100"
          />
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 gap-4">
          <a
            href="https://wa.me/25779614036"
            className="bg-[#25D366]/10 p-5 rounded-3xl flex items-center gap-4 active:scale-95 transition-transform border border-[#25D366]/20"
          >
            <div className="bg-[#25D366] p-3 rounded-2xl text-white shadow-lg shadow-[#25D366]/20">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                Discutons sur WhatsApp
              </h3>
              <p className="text-xs text-[#128C7E] font-medium">
                Support technique immédiat
              </p>
            </div>
          </a>

          <a
            href="mailto:support@clsky.com"
            className="bg-blue-50 p-5 rounded-3xl flex items-center gap-4 active:scale-95 transition-transform border border-blue-100"
          >
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                Envoyer un Email
              </h3>
              <p className="text-xs text-blue-600 font-medium">
                Réponse sous 24h
              </p>
            </div>
          </a>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Questions Fréquentes
            </h2>
            <BookOpen className="w-4 h-4 text-gray-300" />
          </div>

          <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-50">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div key={faq.id}>
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-5 flex items-center justify-between text-left active:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-bold text-gray-800 leading-snug">
                      {faq.question}
                    </span>
                    {openId === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                    )}
                  </button>
                  {openId === faq.id && (
                    <div className="px-5 pb-6 text-sm text-gray-500 leading-relaxed animate-in slide-in-from-top-2 duration-300">
                      {faq.answer}
                    </div>
                  )}
                  {index < filteredFaqs.length - 1 && (
                    <div className="mx-5 h-px bg-gray-50" />
                  )}
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-gray-400 italic text-sm">
                Aucun résultat pour "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* Support Hours */}
        <div className="bg-gray-100 p-4 rounded-2xl flex items-start gap-3 opacity-75">
          <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-gray-700">
              Heures de support
            </h4>
            <p className="text-[10px] text-gray-500">
              Lundi - Vendredi: 08:00 - 18:00 (GMT+2)
            </p>
            <p className="text-[10px] text-gray-500">Samedi: 09:00 - 13:00</p>
          </div>
        </div>
      </div>
    </div>
  );
}
