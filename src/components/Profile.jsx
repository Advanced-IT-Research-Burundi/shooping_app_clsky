import {
  User,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  FileText,
} from "lucide-react";
import { useOutletContext, useNavigate } from "react-router-dom";

export function Profile(props) {
  const context = useOutletContext() || {};
  const user = props.user || context.user;
  const onLogout = props.onLogout || context.onLogout;
  const navigate = useNavigate();

  // Default values if user is null
  const displayName = user?.name || "Commerçant";
  const displayEmail = user?.email || "commercial@exemple.com";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white px-6 pt-12 pb-16">
        <h1 className="text-2xl mb-8">Profil</h1>

        {/* User Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl mb-1">{displayName}</h2>
            <p className="text-orange-50 text-sm truncate">{displayEmail}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-6 -mt-8 space-y-4">
        {/* Settings Group */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <MenuItem
            icon={<Settings className="w-5 h-5" />}
            label="Paramètres"
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            onClick={() => navigate("/settings")}
          />
          <Divider />
          <MenuItem
            icon={<FileText className="w-5 h-5" />}
            label="Rapports"
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            onClick={() => navigate("/reports")}
          />
          <Divider />
          <MenuItem
            icon={<Bell className="w-5 h-5" />}
            label="Notifications"
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            onClick={() => navigate("/notifications")}
          />
          <Divider />
          <MenuItem
            icon={<Shield className="w-5 h-5" />}
            label="Sécurité & Confidentialité"
            iconBg="bg-green-100"
            iconColor="text-green-600"
            onClick={() => navigate("/change-password")}
          />
          <Divider />
          <MenuItem
            icon={<FileText className="w-5 h-5" />}
            label="Produits archivés"
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
            onClick={() => navigate("/archive")}
          />
        </div>

        {/* Help Group */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <MenuItem
            icon={<HelpCircle className="w-5 h-5" />}
            label="Centre d'aide"
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
            onClick={() => navigate("/help")}
          />
        </div>

        {/* Logout */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <MenuItem
            icon={<LogOut className="w-5 h-5" />}
            label="Déconnexion"
            iconBg="bg-red-100"
            iconColor="text-red-600"
            showChevron={false}
            onClick={onLogout}
          />
        </div>

        {/* App Info */}
        <div className="text-center py-6 text-sm text-gray-500">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  iconBg,
  iconColor,
  showChevron = true,
  ...props
}) {
  return (
    <button
      className="w-full flex items-center gap-4 p-4 active:bg-gray-50 transition"
      {...props}
    >
      <div className={`${iconBg} ${iconColor} p-2 rounded-xl`}>{icon}</div>
      <span className="flex-1 text-left text-gray-900">{label}</span>
      {showChevron && <ChevronRight className="w-5 h-5 text-gray-400" />}
    </button>
  );
}

function Divider() {
  return <div className="h-px bg-gray-100 mx-4" />;
}
