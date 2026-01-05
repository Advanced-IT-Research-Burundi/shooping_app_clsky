import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../api/axios';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Plus, Pencil, Trash2, Phone, Mail, MapPin, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState({ name: '', email: '', phone: '', address: '' });
  const [errors, setErrors] = useState({});

  const fetchSuppliers = async (pageNum) => {
    setLoading(true);
    // Use pageNum if provided, otherwise current page state (though usually we pass it from effect)
    const p = pageNum || page;
    const result = await apiGet(`/suppliers?page=${p}`);
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
    fetchSuppliers(page);
  }, [page]);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setCurrentSupplier({ name: '', email: '', phone: '', address: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (supplier) => {
    setIsEditMode(true);
    setCurrentSupplier({ ...supplier }); // Copy to avoid mutating directly
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!currentSupplier.name) newErrors.name = "Le nom est requis";
    // Email is optional in some logic, but usually required. The user json shows email.
    if (!currentSupplier.email) newErrors.email = "L'email est requis"; 
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    let result;
    if (isEditMode) {
      result = await apiPut(`/suppliers/${currentSupplier.id}`, currentSupplier);
    } else {
      result = await apiPost('/suppliers', currentSupplier);
    }

    if (result.success) {
      setIsModalOpen(false);
      // Refresh list
      fetchSuppliers(page);
    } else {
      alert("Erreur: " + result.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      setLoading(true);
      const result = await apiDelete(`/suppliers/${id}`);
      if (result.success) {
        fetchSuppliers(page);
      } else {
        alert("Erreur lors de la suppression: " + result.error);
      }
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="text-sm text-gray-500">{total} fournisseurs trouvés</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-orange-600 hover:bg-orange-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {loading && suppliers.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {suppliers.map((supplier) => (
            <Card key={supplier.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{supplier.name}</h3>
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
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(supplier)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(supplier.id)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
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

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(p => Math.max(1, p - 1))}
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
            onClick={() => setPage(p => Math.min(lastPage, p + 1))}
            disabled={page === lastPage || loading}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom Complet</Label>
              <Input
                id="name"
                value={currentSupplier.name}
                onChange={(e) => setCurrentSupplier({ ...currentSupplier, name: e.target.value })}
                placeholder="Ex: Jean Dupont"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={currentSupplier.email}
                onChange={(e) => setCurrentSupplier({ ...currentSupplier, email: e.target.value })}
                placeholder="Ex: jean@example.com"
                className={errors.email ? "border-red-500" : ""}
              />
               {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={currentSupplier.phone || ''}
                onChange={(e) => setCurrentSupplier({ ...currentSupplier, phone: e.target.value })}
                placeholder="+257 ..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={currentSupplier.address || ''}
                onChange={(e) => setCurrentSupplier({ ...currentSupplier, address: e.target.value })}
                placeholder="Adresse physique"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditMode ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
