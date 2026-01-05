import { useEffect, useState } from "react";
import { apiGet } from "../api/axios";
import { Search, ChevronDown } from "lucide-react";

export function SupplierSelect({ value, setSupplierId }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Initial load
    searchSuppliers("");
  }, []);

  const searchSuppliers = async (search) => {
    setLoading(true);
    try {
      const endpoint = search ? `/suppliers?search=${encodeURIComponent(search)}` : '/suppliers';
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
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <label className="text-sm text-gray-700 mb-2 block font-medium">Rechercher</label>
        <div className="relative">
             <input 
                type="text" 
                onChange={(e) => searchSuppliers(e.target.value)} 
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder="Tapez pour filtrer..."
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div className="relative">
        <label className="text-sm text-gray-700 mb-2 block font-medium">Sélectionner un fournisseur</label>
        <div className="relative">
            <select 
            name="supplier" 
            value={value || ""} 
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none transition-all disabled:opacity-50" 
            onChange={(e) => setSupplierId(e.target.value)}
            disabled={loading}
            >
            <option value="">-- Choisir un fournisseur --</option>
            {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
            ))}
            </select>
            <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {loading && <p className="text-xs text-orange-500 mt-2 font-medium animate-pulse">Chargement des fournisseurs...</p>}
      </div>
    </div>
  );
}