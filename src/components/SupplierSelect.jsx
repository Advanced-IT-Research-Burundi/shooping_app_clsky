import { useEffect, useState, useRef } from "react";
import { apiGet } from "../api/axios";
import { Plus, User, Loader2, Search, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

export function SupplierSelect({ value, setSupplierId, onChange, error }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const containerRef = useRef(null);

  // Harmonize onChange and setSupplierId
  const handleSelect = (supplier) => {
    const id = supplier ? supplier.id : "";
    if (setSupplierId) setSupplierId(id);
    if (onChange) onChange(id);
    setSelectedSupplier(supplier);
    setSearch(supplier ? supplier.name : "");
    setIsOpen(false);
  };

  useEffect(() => {
    const fetchInitialSupplier = async () => {
      if (value && (!selectedSupplier || selectedSupplier.id != value)) {
        try {
          const response = await apiGet(`/suppliers/${value}`);
          if (response.success) {
            setSelectedSupplier(response.data);
            setSearch(response.data.name);
          }
        } catch (error) {
          console.error("Error fetching supplier details:", error);
        }
      } else if (!value && selectedSupplier) {
        setSelectedSupplier(null);
        setSearch("");
      }
    };
    fetchInitialSupplier();
  }, [value, selectedSupplier]);

  useEffect(() => {
    if (
      search &&
      isOpen &&
      (!selectedSupplier || search !== selectedSupplier.name)
    ) {
      const timer = setTimeout(() => {
        searchSuppliers(search);
      }, 300);
      return () => clearTimeout(timer);
    } else if (!search && isOpen) {
      searchSuppliers("");
    }
  }, [search, isOpen, selectedSupplier]);

  const searchSuppliers = async (query) => {
    setLoading(true);
    try {
      const endpoint = query
        ? `/suppliers?search=${encodeURIComponent(query)}`
        : "/suppliers";
      const response = await apiGet(endpoint);

      let data = [];
      if (response.success) {
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        }
      }
      setSuppliers(data);
    } catch (error) {
      console.error(error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToCreate = () => {
    navigate("/suppliers/add", {
      state: { returnTo: location.pathname, initialName: search },
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        // Reset search to selected supplier name if no selection made
        if (selectedSupplier) {
          setSearch(selectedSupplier.name);
        } else {
          setSearch("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedSupplier]);

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <Label
        className={cn(
          "text-sm font-medium",
          error ? "text-red-500" : "text-gray-700"
        )}
      >
        Fournisseur
      </Label>

      <div className="relative">
        <Input
          type="text"
          placeholder="Rechercher un fournisseur..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (!e.target.value) {
              handleSelect(null);
            }
          }}
          onFocus={() => setIsOpen(true)}
          className={cn("pl-12 pr-10", error && "border-red-500")}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              handleSelect(null);
              setIsOpen(true);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-[300px] overflow-y-auto">
            {loading && (
              <div className="p-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Chargement...
              </div>
            )}

            {!loading && suppliers.length === 0 && search && (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500 mb-3">
                  Aucun fournisseur trouvé pour "{search}"
                </p>
                <Button
                  variant="outline"
                  onClick={handleNavigateToCreate}
                  className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer "{search}"
                </Button>
              </div>
            )}

            {suppliers.length > 0 && (
              <div className="p-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Résultats
                </div>
                {suppliers.map((supplier) => (
                  <button
                    key={supplier.id}
                    type="button"
                    onClick={() => handleSelect(supplier)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-orange-50 transition-colors rounded-lg",
                      value == supplier.id && "bg-orange-50"
                    )}
                  >
                    <div className="bg-gray-100 p-2 rounded-full">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-gray-900 truncate">
                        {supplier.name}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {supplier.phone}{" "}
                        {supplier.address ? `• ${supplier.address}` : ""}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="p-2 border-t border-gray-100 sticky bottom-0 bg-white">
              <Button
                variant="ghost"
                onClick={handleNavigateToCreate}
                className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouveau fournisseur
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
