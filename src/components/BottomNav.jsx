import { Home, Plus, ShoppingBag, User } from "lucide-react";
export function BottomNav({ currentScreen, onNavigate }) {
  const navItems = [
    { id: "home", icon: Home, label: "Accueil" },
    { id: "add", icon: Plus, label: "Ajouter", isSpecial: true },
    { id: "products", icon: ShoppingBag, label: "Produits" },
    { id: "profile", icon: User, label: "Profil" }
  ];
  return <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-md mx-auto">
      <div className="grid grid-cols-4 h-20">
        {navItems.map((item) => {
    const Icon = item.icon;
    const isActive = currentScreen === item.id;
    if (item.isSpecial) {
      return <button
        key={item.id}
        onClick={() => onNavigate(item.id)}
        className="flex flex-col items-center justify-center relative"
      >
                <div className="absolute -top-6 bg-orange-600 w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="mt-6 text-xs text-gray-500">{item.label}</div>
              </button>;
    }
    return <button
      key={item.id}
      onClick={() => onNavigate(item.id)}
      className={`flex flex-col items-center justify-center gap-1 transition-colors ${isActive ? "text-orange-600" : "text-gray-400"}`}
    >
              <Icon className={`w-6 h-6 ${isActive ? "scale-110" : ""} transition-transform`} />
              <span className="text-xs">{item.label}</span>
            </button>;
  })}
      </div>
    </nav>;
}
