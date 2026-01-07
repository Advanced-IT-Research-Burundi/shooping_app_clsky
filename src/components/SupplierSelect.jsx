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
} from "lucide-react";
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
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [createErrors, setCreateErrors] = useState({});
  const [createLoading, setCreateLoading] = useState(false);

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

  const handleCreate = async () => {
    setCreateLoading(true);
    setCreateErrors({});
    try {
      // Assuming apiPost is available, similar to apiGet
      const response = await apiPost("/suppliers", newSupplier);
      if (response.success) {
        setNewSupplier({ name: "", email: "", phone: "", address: "" });
        setIsModalOpen(false);
        // Refresh suppliers
        searchSuppliers(search);
      } else {
        setCreateErrors(response.errors || {});
      }
    } catch (error) {
      console.error(error);
      setCreateErrors({ general: "Erreur lors de la création" });
    } finally {
      setCreateLoading(false);
    }
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
              ? suppliers.find((s) => s.id == value)?.name ||
                "Fournisseur sélectionné"
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
            <CommandList>
              {loading && (
                <div className="py-6 text-center text-sm text-gray-500">
                  Chargement...
                </div>
              )}

              {!loading && suppliers.length === 0 && (
                <CommandEmpty>Aucun fournisseur trouvé.</CommandEmpty>
              )}

              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setIsModalOpen(true);
                  }}
                  className="text-orange-600 font-medium cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un nouveau
                </CommandItem>
                {suppliers.map((supplier) => (
                  <CommandItem
                    key={supplier.id}
                    value={String(supplier.id)} // Value for filtering if using local filter, but we use server side, so this ID helps selection
                    onSelect={() => {
                      setSupplierId(supplier.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === supplier.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{supplier.name}</span>
                      {supplier.phone && (
                        <span className="text-xs text-gray-400">
                          {supplier.phone}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Nouveau fournisseur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Nom Complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <Input
                  id="new-name"
                  value={newSupplier.name}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, name: e.target.value })
                  }
                  className={`pl-10 h-11 ${
                    createErrors.name ? "border-red-500" : ""
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                value={newSupplier.email}
                onChange={(e) =>
                  setNewSupplier({ ...newSupplier, email: e.target.value })
                }
                className={`h-11 ${createErrors.email ? "border-red-500" : ""}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-phone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <Input
                  id="new-phone"
                  value={newSupplier.phone}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, phone: e.target.value })
                  }
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-address">Adresse</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <Input
                  id="new-address"
                  value={newSupplier.address}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, address: e.target.value })
                  }
                  className="pl-10 h-11"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createLoading}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {createLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
