import { ArrowLeft, Edit, Trash2, Package, Box, Calendar, DollarSign, Upload, X, Save, Camera } from "lucide-react";
import { SupplierSelect } from "./SupplierSelect";
import { useState, useEffect, useRef } from "react";
import { useParams, Navigate, useOutletContext } from "react-router-dom";
import { useUpdateProductMutation } from "../features/auth/apiSlicer";

const categories = [
  { id: 1, label: "Alimentaire", icon: "\u{1F34E}", value: "food" },
  { id: 2, label: "\xC9lectronique", icon: "\u{1F4F1}", value: "electronics" },
  { id: 3, label: "V\xEAtements", icon: "\u{1F455}", value: "clothing" },
  { id: 4, label: "Autres", icon: "\u{1F4E6}", value: "other" }
];

const devises = [
  { id: 1, code: "USD" },
  { id: 2, code: "EUR" },
  { id: 3, code: "BIF" },
  { id: 4, code: "GBP" },
  { id: 5, code: "CAD" },
  { id: 6, code: "JPY" }
];

const packagingTypes = [
  { value: "unit", label: "Unit\xE9" },
  { value: "carton", label: "Carton" },
  { value: "other", label: "Autre" }
];

const packagingLabels = {
  unit: "Unit\xE9",
  carton: "Carton",
  other: "Autre"
};


export function ProductDetail(props) {
  const { id } = useParams();
  const context = useOutletContext() || {};
  
  const products = props.products || context.products || [];
  const onBack = props.onBack || context.onBack;
  const onDelete = props.onDelete || context.onDelete;
  const onEditContext = props.onEdit || context.onEdit;

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  // Resolve product: either from props or find by ID from params
  let product = props.product;
  if (!product && id) {
     product = products.find(p => p.id == id);
  }

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit State
  const [editForm, setEditForm] = useState(null);
  const [newPhotos, setNewPhotos] = useState([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (product) {
        // Initialize form with product data
        // Map category/type string to ID if possible or use defaults
        const currentCategory = categories.find(c => c.value === product.type) || categories[3]; // Default other
        const currentDevise = devises.find(d => d.code === product.currency) || devises[0]; // Default USD

        setEditForm({
            name: product.name,
            description: product.description || "",
            price: product.price,
            quantity: product.quantity || 1,
            packaging: product.packaging || "unit",
            exchange_rate: product.exchangeRate || 2850,
            date: product.date ? new Date(product.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            category_id: currentCategory.id,
            devise_id: currentDevise.id,
            piecesPerCarton: product.piecesPerCarton || "",
            piecesPerCarton: product.piecesPerCarton || "",
            numberOfCartons: product.numberOfCartons || "",
            supplier_id: product.supplier_id || "", 
        });
    }
  }, [product]);

  if (!product) {
      if (products.length === 0) return <div className="p-6 text-center">Chargement...</div>;
      return <Navigate to="/products" replace />;
  }

  const handleDelete = () => {
    onDelete(product.id);
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
        setNewPhotos(prev => [...prev, ...files]);
        
        // Generate previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setNewPhotoPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewPhoto = (index) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== index));
    setNewPhotoPreviews(prev => {
        // Revoke URL to avoid memory leaks
        URL.revokeObjectURL(prev[index]);
        return prev.filter((_, i) => i !== index);
    });
  };

  const handleSaveEdit = async () => {
    try {
        const formData = new FormData();
        formData.append('_method', 'PUT'); // Trick for Laravel resource handling
        formData.append('name', editForm.name);
        formData.append('description', editForm.description);
        formData.append('price', editForm.price);
        formData.append('quantity', editForm.quantity);
        formData.append('packaging', editForm.packaging);
        formData.append('exchange_rate', editForm.exchange_rate);
        formData.append('date', editForm.date);
        formData.append('category_id', editForm.category_id);
        formData.append('date', editForm.date);
        formData.append('category_id', editForm.category_id);
        formData.append('devise_id', editForm.devise_id);
        if(editForm.supplier_id) formData.append('supplier_id', editForm.supplier_id);
        
        // Append new photos
        // 'photos[]' or just 'photo' depending on backend. User said "ajouter plus des photos", usually 'photos' array.
        // But request validation showed 'photo' => 'nullable|file|image'. That might imply single file.
        // However, "ajouter plus des photos" (plural) implies multiple. 
        // I'll assume 'photos[]' for multiple or iterate 'photo' if backend supports it.
        // Let's stick to 'photo' if we are uploading one, or 'photos[]' if multiple. 
        // Given validation 'photo' => '...', it might check for a single key. 
        // But since we want "more photos", I will append them as 'photos[]' if the array is populated.
        // Or if the backend expects 'photo' as single, I might only be able to upload one.
        // Let's try appending 'photo[]' to be safe for multiple, or 'photo' if strictly one.
        // Given the ambiguity, I'll append all new photos as 'photos[]'. If backend validation fails, we'll know.
        // Actually, user prompt validation says: 'photo' => 'nullable|file|image'. Singular.
        // This suggests only ONE photo can be uploaded at a time? Or maybe 'photo.*'?
        // "ajouter plus des photos" -> maybe I should send them as 'photos'.
        // Let's iterate and append 'photos[]' and also 'photo' if only one.
        
        if (newPhotos.length > 0) {
            newPhotos.forEach((file) => {
                formData.append('photo[]', file); 
            });
        }
        
        if (editForm.packaging === 'carton') {
            if(editForm.piecesPerCarton) formData.append('pieces_per_carton', editForm.piecesPerCarton);
            if(editForm.numberOfCartons) formData.append('number_of_cartons', editForm.numberOfCartons);
        }

        await updateProduct({ id: product.id, data: formData }).unwrap();
        
        setIsEditing(false);
        setNewPhotos([]);
        setNewPhotoPreviews([]);
        // Optional: manually trigger local update or refetch
    } catch (err) {
        console.error("Failed to update product", err);
        alert("Erreur lors de la mise à jour");
    }
  };

  // Helper to get category/currency display for view mode
  const currentCategory = categories.find(c => c.value === product.type) || categories[3];

  if (isEditing && editForm) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
             {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <button onClick={() => setIsEditing(false)} className="p-2 -ml-2 active:bg-gray-100 rounded-xl transition">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-xl text-gray-900">Modifier</h1>
                <button 
                    onClick={handleSaveEdit} 
                    disabled={isUpdating}
                    className="text-orange-600 px-4 py-2 rounded-xl active:bg-orange-50 transition flex items-center gap-2"
                >
                    {isUpdating ? '...' : <Save className="w-5 h-5" />}
                    {isUpdating ? 'Sauvegarde...' : 'Sauver'}
                </button>
            </div>

            <div className="p-6 space-y-6">
                {/* Name */}
                <div>
                    <label className="text-sm text-gray-700 mb-2 block">Nom du produit</label>
                    <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
                
                {/* Description */}
                <div>
                    <label className="text-sm text-gray-700 mb-2 block">Description</label>
                    <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                </div>

                {/* Supplier */}
                <div className="bg-white rounded-xl shadow-sm">
                     <SupplierSelect 
                        value={editForm.supplier_id}
                        onChange={(id) => setEditForm({...editForm, supplier_id: id})}
                     />
                </div>

                {/* Price & Quantity & Date */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-700 mb-2 block">Prix</label>
                        <input
                            type="number"
                            step="0.01"
                            value={editForm.price}
                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                     <div>
                        <label className="text-sm text-gray-700 mb-2 block">Quantité</label>
                        <input
                            type="number"
                            value={editForm.quantity}
                            onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-700 mb-2 block">Date</label>
                        <input
                            type="date"
                            value={editForm.date}
                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-700 mb-2 block">Taux de change</label>
                         <input
                            type="number"
                            step="0.01"
                            value={editForm.exchange_rate}
                            onChange={(e) => setEditForm({ ...editForm, exchange_rate: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                </div>

                 {/* Category & Devise */}
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-700 mb-2 block">Catégorie</label>
                        <select
                            value={editForm.category_id}
                            onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                        >
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label className="text-sm text-gray-700 mb-2 block">Devise</label>
                        <select
                            value={editForm.devise_id}
                            onChange={(e) => setEditForm({ ...editForm, devise_id: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                        >
                            {devises.map(d => (
                                <option key={d.id} value={d.id}>{d.code}</option>
                            ))}
                        </select>
                    </div>
                 </div>

                {/* Packaging */}
                 <div>
                    <label className="text-sm text-gray-700 mb-2 block">Emballage</label>
                    <div className="grid grid-cols-3 gap-2">
                        {packagingTypes.map((pkg) => (
                            <button
                                key={pkg.value}
                                type="button"
                                onClick={() => setEditForm({...editForm, packaging: pkg.value})}
                                className={`py-3 px-2 rounded-xl border-2 text-sm transition-all ${
                                    editForm.packaging === pkg.value
                                    ? "border-orange-500 bg-orange-50 text-orange-600"
                                    : "border-gray-200 bg-white text-gray-700"
                                }`}
                            >
                                {pkg.label}
                            </button>
                        ))}
                    </div>
                 </div>

                 {editForm.packaging === 'carton' && (
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-700 mb-2 block">Pièces par carton</label>
                            <input
                                type="number"
                                value={editForm.piecesPerCarton}
                                onChange={(e) => setEditForm({ ...editForm, piecesPerCarton: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div>
                             <label className="text-sm text-gray-700 mb-2 block">Nombre de cartons</label>
                             <input
                                type="number"
                                value={editForm.numberOfCartons}
                                onChange={(e) => setEditForm({ ...editForm, numberOfCartons: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                     </div>
                 )}

                 {editForm.packaging === 'other' && (
                     <div>
                        <label className="text-sm text-gray-700 mb-2 block">Description de l'emballage</label>
                        <input
                            type="text"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            placeholder="Précisez le type d'emballage"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                 )}

                 {/* Photos */}
                 <div>
                    <label className="text-sm text-gray-700 mb-2 block">Photos</label>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                         {/* Existing Photos (Read-only view) */}
                         {Array.isArray(product.photo) && product.photo.map((p, idx) => (
                             <div key={`existing-${idx}`} className="relative flex-shrink-0">
                                 <img src={p} className="w-24 h-24 object-cover rounded-xl border border-gray-200" />
                                 {/* Maybe allow delete existing? Not requested yet */}
                             </div>
                         ))}
                         {/* New Photos */}
                         {newPhotoPreviews.map((p, idx) => (
                             <div key={`new-${idx}`} className="relative flex-shrink-0">
                                 <img src={p} className="w-24 h-24 object-cover rounded-xl border border-gray-200" />
                                 <button 
                                     onClick={() => removeNewPhoto(idx)}
                                     className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow"
                                 >
                                    <X className="w-3 h-3" />
                                 </button>
                             </div>
                         ))}
                         
                         <button 
                             onClick={() => fileInputRef.current?.click()}
                             className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl text-gray-400 active:bg-gray-50 flex-shrink-0"
                         >
                             <Camera className="w-6 h-6 mb-1" />
                             <span className="text-xs">Ajouter</span>
                         </button>
                    </div>
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handlePhotoSelect}
                    />
                 </div>
            </div>
        </div>
    );
  }

  // View Mode
  return (
    <div className="min-h-screen bg-gray-50">
        <div className="relative">
            {/* Main Product Image */}
            <img
                src={Array.isArray(product.photo) ? (product.photo[0] || 'https://via.placeholder.com/640x480?text=No+Image') : product.photo}
                alt={product.name}
                className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            
            <button
                onClick={onBack}
                className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg active:scale-95 transition"
            >
                <ArrowLeft className="w-6 h-6 text-gray-800" />
            </button>

            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-2">
                <span className="text-xl">{currentCategory.icon}</span>
                <span className="text-sm text-gray-800">{currentCategory.label}</span>
            </div>
        </div>

        <div className="px-6 -mt-6 relative pb-24">
             <div className="bg-white rounded-3xl shadow-lg p-6 mb-4">
                <h1 className="text-2xl text-gray-900 mb-2">{product.name}</h1>
                {product.description && <p className="text-gray-600 mb-4">{product.description}</p>}

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Prix d'achat</span>
                    <div className="text-2xl text-orange-600">
                        {product.price} {product.currency}
                    </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Taux: {product.exchangeRate}</span>
                    <span className="text-gray-800">
                        {product.convertedPrice ? product.convertedPrice.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) : '0'} BIF
                    </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center justify-center gap-2 bg-orange-600 text-white py-3 rounded-xl active:scale-95 transition-transform"
                    >
                    <Edit className="w-5 h-5" />
                    Modifier
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl active:scale-95 transition-transform"
                    >
                    <Trash2 className="w-5 h-5" />
                    Supprimer
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
                <h2 className="text-lg text-gray-900 mb-4">Détails</h2>

                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="bg-orange-100 p-3 rounded-xl">
                    <Package className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                    <div className="text-sm text-gray-500">Emballage</div>
                    <div className="text-gray-900">{packagingLabels[product.packaging] || product.packaging}</div>
                    </div>
                </div>
                
                 <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="bg-gray-100 p-3 rounded-xl">
                    <Box className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                    <div className="text-sm text-gray-500">Quantité</div>
                    <div className="text-gray-900">{product.quantity}</div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-3 rounded-xl">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                    <div className="text-sm text-gray-500">Date d'enregistrement</div>
                    <div className="text-gray-900">
                        {new Date(product.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        })}
                    </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Delete Modal */}
        {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-6">
                <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 animate-slide-up">
                    <div className="text-center">
                        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl text-gray-900 mb-2">Supprimer le produit ?</h3>
                        <p className="text-gray-600">
                            Cette action est irréversible.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="py-3 bg-gray-100 text-gray-700 rounded-xl active:scale-95 transition"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleDelete}
                            className="py-3 bg-red-600 text-white rounded-xl active:scale-95 transition"
                        >
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
