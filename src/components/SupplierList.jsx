import React, { useState, useEffect } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../api/axios";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Plus,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { PullToRefresh } from "./ui/PullToRefresh";

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export function SupplierList() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const fetchSuppliers = async (pageNum, search) => {
    setLoading(true);
    const p = pageNum || page;
    const query = search !== undefined ? search : searchQuery;
    const url = `/suppliers?page=${p}${query ? `&search=${query}` : ""}`;
    const result = await apiGet(url);
    if (result.success) {
      setSuppliers(result.data.data);
      setPage(result.data.current_page);
      setLastPage(result.data.last_page);
      setTotal(result.data.total);
    } else {
      console.error("Failed to fetch suppliers:", result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSuppliers(1, searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    fetchSuppliers(page);
  }, [page]);

  const handleOpenAdd = () => {
    navigate("/suppliers/add");
  };

  const handleOpenEdit = (supplier) => {
    navigate(`/suppliers/edit/${supplier.id}`, { state: { supplier } });
  };

  const handleDelete = (id) => {
    setSupplierToDelete(id);
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;
    setLoading(true);
    const result = await apiDelete(`/suppliers/${supplierToDelete}`);
    if (result.success) {
      toast.success("Fournisseur supprimé");
      fetchSuppliers(page);
    } else {
      toast.error("Erreur lors de la suppression: " + result.error);
    }
    setLoading(false);
    setSupplierToDelete(null);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="text-sm text-gray-500">{total} fournisseurs trouvés</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchSuppliers(1)}
            disabled={loading}
            className="rounded-xl border-gray-200"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualiser
          </Button>
          <Button
            onClick={handleOpenAdd}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un fournisseur..."
            className="pl-10 h-11 bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
          />
        </div>
      </div>

      <PullToRefresh onRefresh={() => fetchSuppliers(1)} isRefreshing={loading}>
        {loading && suppliers.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {suppliers.map((supplier) => (
              <Card
                key={supplier.id}
                className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {supplier.name}
                      </h3>
                      <div className="mt-2 space-y-1">
                        {supplier.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {supplier.email}
                          </div>
                        )}
                        {supplier.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {supplier.phone}
                          </div>
                        )}
                        {supplier.address && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            {supplier.address}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(supplier)}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(supplier.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {suppliers.length === 0 && !loading && (
              <div className="text-center py-10 text-gray-500">
                Aucun fournisseur trouvé.
              </div>
            )}
          </div>
        )}
      </PullToRefresh>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-gray-600">
            Page {page} sur {lastPage}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page === lastPage || loading}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      <AlertDialog
        open={!!supplierToDelete}
        onOpenChange={() => setSupplierToDelete(null)}
      >
        <AlertDialogContent className="w-11/12 max-w-md rounded-2xl bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le fournisseur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Êtes-vous sûr de vouloir supprimer
              ce fournisseur ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex-row justify-end gap-2">
            <AlertDialogCancel className="mt-0">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
