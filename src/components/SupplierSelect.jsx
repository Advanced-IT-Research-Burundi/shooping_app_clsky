import React, { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Plus, Loader2, User, Phone, MapPin } from "lucide-react";
import { cn } from "./ui/utils";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { apiGet, apiPost } from "../api/axios";

export function SupplierSelect({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', email: '', phone: '', address: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createErrors, setCreateErrors] = useState({});

  useEffect(() => {
    // Fetch initial suppliers (first page)
    fetchSuppliers();
  }, []);

  // Debounced search for the combobox
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) fetchSuppliers(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchSuppliers = async (query = "") => {
    setLoading(true);
    const url = `/suppliers?page=1${query ? `&search=${query}` : ''}`;
    const result = await apiGet(url);
    if (result.success) {
      setSuppliers(result.data.data);
    }
    setLoading(false);
  };

  const selectedSupplier = suppliers.find((s) => s.id === value);

  // --- Create Supplier Logic ---
  const validateCreate = () => {
    const errors = {};
    if (!newSupplier.name) errors.name = "Le nom est requis";
    if (!newSupplier.email) errors.email = "L'email est requis";
    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateCreate()) return;
    setCreateLoading(true);
    const result = await apiPost('/suppliers', newSupplier);
    if (result.success) {
      // Add to list and select it
      // Since the API returns the created object usually, let's assume result.data is the supplier or result.data.data
      const created = result.data.data || result.data; // Adjust based on API response structure
      
      // Update local list (prepend)
      setSuppliers((prev) => [created, ...prev]);
      
      // Select it
      onChange(created.id);
      
      // Close modal and popover
      setIsModalOpen(false);
      setOpen(false);
      
      // Reset form
      setNewSupplier({ name: '', email: '', phone: '', address: '' });
    } else {
      alert("Erreur: " + (result.error || "Impossible de créer le fournisseur"));
    }
    setCreateLoading(false);
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
              ? suppliers.find((s) => s.id == value)?.name || "Fournisseur sélectionné"
              : "Rechercher un fournisseur..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Rechercher..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {loading && <div className="py-6 text-center text-sm text-gray-500">Chargement...</div>}
              
              {!loading && suppliers.length === 0 && (
                <CommandEmpty>Aucun fournisseur trouvé.</CommandEmpty>
              )}

              <CommandGroup>
                <CommandItem
                  value="new-supplier-action"
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
                    value={String(supplier.id) + "-" + supplier.name} 
                    onSelect={() => {
                      onChange(supplier.id);
                      setOpen(false);
                      setSearch(""); // Clear search on select if desired
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        String(value) === String(supplier.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                        <span>{supplier.name}</span>
                        {supplier.phone && <span className="text-xs text-gray-400">{supplier.phone}</span>}
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
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  className={`pl-10 h-11 ${createErrors.name ? "border-red-500" : ""}`}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
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
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
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
                    onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                    className="pl-10 h-11"
                />
               </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={createLoading} className="bg-orange-600 hover:bg-orange-700 text-white">
              {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
