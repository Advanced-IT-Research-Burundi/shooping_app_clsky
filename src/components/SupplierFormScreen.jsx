import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { apiGet, apiPost, apiPut } from "../api/axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ChevronLeft, Loader2, User, Mail, Phone, MapPin } from "lucide-react";

export function SupplierFormScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      if (location.state?.supplier) {
        setCurrentSupplier(location.state.supplier);
      } else {
        fetchSupplier();
      }
    }
  }, [id]);

  const fetchSupplier = async () => {
    setLoading(true);
    const result = await apiGet(`/suppliers/${id}`);
    if (result.success) {
      setCurrentSupplier(result.data);
    } else {
      console.error("Failed to fetch supplier:", result.error);
      navigate("/suppliers");
    }
    setLoading(false);
  };

  const validate = () => {
    const newErrors = {};
    if (!currentSupplier.name) newErrors.name = "Le nom est requis";
    if (!currentSupplier.email) newErrors.email = "L'email est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    let result;
    if (isEditMode) {
      result = await apiPut(
        `/suppliers/${currentSupplier.id}`,
        currentSupplier,
      );
    } else {
      result = await apiPost("/suppliers", currentSupplier);
    }

    if (result.success) {
      // Check for returnTo in state or query param
      const params = new URLSearchParams(location.search);
      const returnTo = location.state?.returnTo || params.get("returnTo");

      if (returnTo) {
        navigate(returnTo, {
          state: {
            newSupplierId: result.data.id,
            newSupplierName: result.data.name,
          },
        });
      } else {
        navigate("/suppliers");
      }
    } else {
      alert("Erreur: " + result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 active:bg-gray-100 rounded-xl transition"
        >
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          {isEditMode ? "Modifier le fournisseur" : "Ajouter un fournisseur"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 pb-32">
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700">
              Nom Complet
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                value={currentSupplier.name}
                onChange={(e) =>
                  setCurrentSupplier({
                    ...currentSupplier,
                    name: e.target.value,
                  })
                }
                placeholder="Ex: Jean Dupont"
                className={`pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
                  errors.name ? "border-red-500 focus:ring-red-200" : ""
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={currentSupplier.email}
                onChange={(e) =>
                  setCurrentSupplier({
                    ...currentSupplier,
                    email: e.target.value,
                  })
                }
                placeholder="Ex: jean@example.com"
                className={`pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
                  errors.email ? "border-red-500 focus:ring-red-200" : ""
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-700">
              Téléphone
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                value={currentSupplier.phone || ""}
                onChange={(e) =>
                  setCurrentSupplier({
                    ...currentSupplier,
                    phone: e.target.value,
                  })
                }
                placeholder="+257 ..."
                className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-gray-700">
              Adresse
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Input
                id="address"
                value={currentSupplier.address || ""}
                onChange={(e) =>
                  setCurrentSupplier({
                    ...currentSupplier,
                    address: e.target.value,
                  })
                }
                placeholder="Adresse physique"
                className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-6">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-lg rounded-2xl shadow-md"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditMode
              ? "Enregistrer les modifications"
              : "Créer le fournisseur"}
          </Button>
        </div>
      </form>
    </div>
  );
}
