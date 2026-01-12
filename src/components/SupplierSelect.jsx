import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/axios";
import {
  ChevronsUpDown,
  Plus,
  Check,
  User,
  Phone,
  MapPin,
  Loader2,
  Search,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { cn } from "./ui/utils";

export function SupplierSelect({ value, setSupplierId, error }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      searchSuppliers(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const searchSuppliers = async (search) => {
    setLoading(true);
    try {
      const endpoint = search
        ? `/suppliers?search=${encodeURIComponent(search)}`
        : "/suppliers";
      const response = await apiGet(endpoint);
      console.log("Suppliers API:", response);

      let data = [];
      if (response.success) {
        // Robustly handle array vs {data: array} (common in Laravel)
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
      state: { returnTo: location.pathname },
    });
  };

  return (
    <div className="space-y-2">
      <Label className={error ? "text-red-500" : ""}>Fournisseur</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-12 bg-white border-gray-200 hover:bg-gray-50",
              !value && "text-muted-foreground",
              error && "border-red-500"
            )}
          >
            {value
              ? suppliers.find((s) => s.id == value)
                ? `${suppliers.find((s) => s.id == value).name} - ${
                    suppliers.find((s) => s.id == value).phone
                  } - ${suppliers.find((s) => s.id == value).address}`
                : "Fournisseur sélectionné"
              : "Rechercher un fournisseur..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Rechercher..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList className="max-h-[300px]">
              {loading && (
                <div className="py-6 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
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
                    onClick={handleNavigateToCreate}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Créer "{search}"
                  </Button>
                </div>
              )}

              {suppliers.length > 0 && (
                <CommandGroup heading="RÉSULTATS">
                  {suppliers.map((supplier) => (
                    <CommandItem
                      key={supplier.id}
                      onSelect={() => {
                        setSupplierId(supplier.id);
                        setOpen(false);
                      }}
                      className="py-3"
                    >
                      <User className="mr-2 h-4 w-4 text-gray-400" />
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {supplier.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {supplier.phone} • {supplier.address}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              <div className="p-2 border-t border-gray-100">
                <Button
                  variant="ghost"
                  onClick={handleNavigateToCreate}
                  className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau fournisseur
                </Button>
              </div>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
