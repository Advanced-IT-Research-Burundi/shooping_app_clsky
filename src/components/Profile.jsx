import {
  User,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  Key,
  FileText,
  X,
  Search,
  Calendar,
  Landmark,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { apiPost, apiGet } from "../api/axios";

export function Profile(props) {
  const context = useOutletContext() || {};
  const user = props.user || context.user;
  const onLogout = props.onLogout || context.onLogout;

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);

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
            <p className="text-orange-50 text-sm">{displayEmail}</p>
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
          />
          <Divider />
          <MenuItem
            icon={<FileText className="w-5 h-5" />}
            label="Rapports"
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            onClick={() => setIsReportsOpen(true)}
          />
          <Divider />
          <MenuItem
            icon={<Bell className="w-5 h-5" />}
            label="Notifications"
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
          />
          <Divider />
          <MenuItem
            icon={<Shield className="w-5 h-5" />}
            label="Sécurité & Confidentialité"
            iconBg="bg-green-100"
            iconColor="text-green-600"
            onClick={() => setIsPasswordModalOpen(true)}
          />
        </div>

        {/* Help Group */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <MenuItem
            icon={<HelpCircle className="w-5 h-5" />}
            label="Centre d'aide"
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
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

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      <ReportsModal
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
      />
    </div>
  );
}

function ChangePasswordModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await apiPost("/change-password", formData);
      if (res.success) {
        setSuccess("Mot de passe changé avec succès.");
        setFormData({
          current_password: "",
          password: "",
          password_confirmation: "",
        });
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 2000);
      } else {
        setError(res.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setError(err.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Changer le mot de passe</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Mot de passe actuel</Label>
            <Input
              type="password"
              value={formData.current_password}
              onChange={(e) =>
                setFormData({ ...formData, current_password: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Nouveau mot de passe</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Confirmer le nouveau mot de passe</Label>
            <Input
              type="password"
              value={formData.password_confirmation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password_confirmation: e.target.value,
                })
              }
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {loading ? "Chargement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReportsModal({ isOpen, onClose }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchReports();
    }
  }, [isOpen]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/product_reportss");
      if (res.success) {
        setReports(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rapports des Produits</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Chargement des rapports...
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun rapport disponible.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {report.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {report.date} • {report.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-orange-600 font-bold">
                      {report.price} {report.currency}
                    </div>
                    <div className="text-xs text-gray-400">
                      Total: {report.convertedPrice?.toLocaleString()} BIF
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() =>
              window.open(
                `${import.meta.env.VITE_API_BASE_URL}/products/report/export`,
                "_blank"
              )
            }
          >
            Exporter CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
