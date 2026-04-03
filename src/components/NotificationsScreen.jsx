import React, { useState } from "react";
import { ArrowLeft, Bell, ShoppingCart, Mail, AlertTriangle, Trash2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "sale",
    title: "Nouvelle vente !",
    message: "Vous venez de vendre 5 unités de Smartphone Samsung.",
    time: "Il y a 5 min",
    read: false,
    icon: <ShoppingCart className="w-5 h-5" />,
    color: "bg-green-100 text-green-600",
  },
  {
    id: 2,
    title: "Alerte de stock",
    message: "Le stock de 'Savon Dove' est presque épuisé (2 restants).",
    time: "Il y a 2 heures",
    read: false,
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "bg-amber-100 text-amber-600",
  },
  {
    id: 3,
    title: "Nouveau message",
    message: "Le fournisseur 'Global Tech' a mis à jour ses tarifs.",
    time: "Hier",
    read: true,
    icon: <Mail className="w-5 h-5" />,
    color: "bg-blue-100 text-blue-600",
  },
];

export function NotificationsScreen() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    if (window.confirm("Supprimer toutes les notifications ?")) {
      setNotifications([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 active:bg-gray-100 rounded-xl transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="p-2 text-red-500 active:bg-red-50 rounded-lg transition"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1">
        {notifications.length > 0 ? (
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center mb-2 px-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Récents
              </span>
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-orange-600"
              >
                Tout marquer comme lu
              </button>
            </div>
            
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 transition active:scale-98 ${
                  notif.read ? "border-transparent opacity-75" : "border-orange-500"
                }`}
              >
                <div className="flex gap-4">
                  <div className={`p-3 rounded-2xl shrink-0 ${notif.color}`}>
                    {notif.icon}
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-bold text-sm ${notif.read ? "text-gray-700" : "text-gray-900"}`}>
                        {notif.title}
                      </h3>
                      <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-60">
            <div className="bg-white p-8 rounded-full mb-6 shadow-sm border border-gray-100">
              <Bell className="w-16 h-16 text-gray-300" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Aucune notification</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Vous êtes à jour ! Nous vous préviendrons dès qu'il se passera quelque chose.
            </p>
          </div>
        )}
      </div>
      
      {/* Action Footer */}
      {notifications.length > 0 && (
        <div className="p-6 text-center text-gray-400 text-xs mt-auto">
          Toutes vos notifications sont conservées pendant 30 jours.
        </div>
      )}
    </div>
  );
}
