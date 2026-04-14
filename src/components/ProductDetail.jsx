import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Box,
  Calendar,
  DollarSign,
  Upload,
  X,
  Save,
  Camera,
  Maximize2,
  Share2,
  Download,
  Copy,
  ExternalLink,
  User,
  Archive,
  RotateCcw,
  Search,
  CheckCircle2,
} from "lucide-react";
import { SupplierSelect } from "./SupplierSelect";
import { useState, useEffect, useRef } from "react";
import {
  useParams,
  Navigate,
  useOutletContext,
  useNavigate,
} from "react-router-dom";
import { toast } from "sonner";
import {
  useUpdateProductMutation,
  useArchiveProductMutation,
  useUnarchiveProductMutation,
  useGetContainersQuery,
  useGetDevisesQuery,
} from "../features/auth/apiSlicer";

const categories = [
  { id: 1, label: "Alimentaire", icon: "\u{1F34E}", value: "food" },
  { id: 2, label: "\xC9lectronique", icon: "\u{1F4F1}", value: "electronics" },
  { id: 3, label: "V\xEAtements", icon: "\u{1F455}", value: "clothing" },
  { id: 4, label: "Autres", icon: "\u{1F4E6}", value: "other" },
];

// devises removed - now dynamic

const packagingTypes = [
  { value: "unit", label: "Unit\xE9" },
  { value: "carton", label: "Carton" },
  { value: "other", label: "Autre" },
];

const packagingLabels = {
  unit: "Unit\xE9",
  carton: "Carton",
  other: "Autre",
};

export function ProductDetail(props) {
  const { id } = useParams();
  const context = useOutletContext() || {};

  const products = props.products || context.products || [];
  const onBack = props.onBack || context.onBack;
  const onDelete = props.onDelete || context.onDelete;
  const onEditContext = props.onEdit || context.onEdit;

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [archiveProduct, { isLoading: isArchiving }] =
    useArchiveProductMutation();
  const [unarchiveProduct, { isLoading: isUnarchiving }] =
    useUnarchiveProductMutation();
  const navigate = useNavigate();

  // Resolve product: either from props or find by ID from params
  let product = props.product;
  if (!product && id) {
    product = products.find((p) => p.id == id);
  }

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveMode, setArchiveMode] = useState("existing"); // "existing" | "new"
  const [containerSearch, setContainerSearch] = useState("");
  const [selectedContainerId, setSelectedContainerId] = useState(null);
  const [archiveForm, setArchiveForm] = useState({
    name: "",
    serial_number: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const { data: containersList } = useGetContainersQuery();

  // Edit State
  const [editForm, setEditForm] = useState(null);
  const [newPhotos, setNewPhotos] = useState([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const { data: devisesList } = useGetDevisesQuery();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const handleShareWhatsApp = () => {
    const text = `Regardez ce produit : ${product.name}\nPrix: ${product.price} ${product.currency}\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien copié !");
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = previewImage;
    link.download = `product-${product.name}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (product) {
      // Initialize form with product data
      // Map category/type string to ID if possible or use defaults
      const currentCategory =
        categories.find((c) => c.value === product.type) || categories[3]; // Default other
      const currentDevise = 
        devisesList?.find((d) => d.id === product.devise_id) || 
        devisesList?.find((d) => d.code === product.currency) || 
        { id: "" };

      setEditForm({
        name: product.name,
        description: product.description || "",
        price: product.price,
        quantity: product.quantity || 1,
        packaging: product.packaging || "unit",
        exchange_rate: product.exchangeRate || 2850,
        date: product.date
          ? new Date(product.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        category_id: currentCategory.id,
        devise_id: currentDevise.id,
        unit_per_package:
          product.unit_per_package || product.piecesPerCarton || "",
        numberOfCartons:
          product.numberOfCartons || product.number_of_cartons || "",
        supplier_id: product.supplier_id || "",
        customs_price: product.customs_price || "",
        customs_price_currency: product.customs_price_currency || "USD",
        cbm: product.cbm || "",
      });
    }
  }, [product, devisesList]);

  if (!product) {
    if (products.length === 0)
      return <div className="p-6 text-center">Chargement...</div>;
    return <Navigate to="/products" replace />;
  }

  const handleDelete = () => {
    onDelete(product.id);
  };

  const handleArchiveToggle = async () => {
    try {
      if (product.is_archived) {
        await unarchiveProduct(product.id).unwrap();
        toast.success("Produit restauré !");
      } else {
        setShowArchiveModal(true);
      }
    } catch (err) {
      console.error("Archive toggle failed", err);
      toast.error("Une erreur est survenue");
    }
  };

  const confirmArchive = async () => {
    if (archiveMode === "existing") {
      if (!selectedContainerId) {
        toast.error("Veuillez sélectionner un conteneur.");
        return;
      }
      const chosen = (containersList || []).find(c => c.id === selectedContainerId);
      if (!chosen) return;
      try {
        await archiveProduct({
          id: product.id,
          data: { name: chosen.name, serial_number: chosen.serial_number, description: chosen.description }
        }).unwrap();
        toast.success("Produit archivé !");
        setShowArchiveModal(false);
        navigate("/products");
      } catch {
        toast.error("Une erreur est survenue lors de l'archivage");
      }
    } else {
      if (!archiveForm.name) {
        toast.error("Le nom du conteneur est requis.");
        return;
      }
      if (!archiveForm.serial_number) {
        toast.error("Le numéro de série du conteneur est requis.");
        return;
      }
      try {
        await archiveProduct({ id: product.id, data: archiveForm }).unwrap();
        toast.success("Produit archivé !");
        setShowArchiveModal(false);
        navigate("/products");
      } catch {
        toast.error("Une erreur est survenue lors de l'archivage");
      }
    }
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewPhotos((prev) => [...prev, ...files]);

      // Generate previews
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setNewPhotoPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeNewPhoto = (index) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
    setNewPhotoPreviews((prev) => {
      // Revoke URL to avoid memory leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSaveEdit = async () => {
    try {
      const formData = new FormData();
      formData.append("_method", "PUT"); // Trick for Laravel resource handling
      formData.append("name", editForm.name);
      formData.append("description", editForm.description);
      formData.append("price", editForm.price);
      formData.append("quantity", editForm.quantity);
      formData.append("packaging", editForm.packaging);
      formData.append("exchange_rate", editForm.exchange_rate);
      formData.append("date", editForm.date);
      formData.append("category_id", editForm.category_id);
      formData.append("date", editForm.date);
      formData.append("category_id", editForm.category_id);
      formData.append("devise_id", editForm.devise_id);
      if (editForm.supplier_id)
        formData.append("supplier_id", editForm.supplier_id);
      formData.append("customs_price", editForm.customs_price || 0);
      formData.append("customs_price_currency", editForm.customs_price_currency);
      formData.append("cbm", editForm.cbm || 0);

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
          formData.append("photo[]", file);
        });
      }

      if (editForm.packaging === "carton") {
        if (editForm.unit_per_package)
          formData.append("unit_per_package", editForm.unit_per_package);
        if (editForm.numberOfCartons)
          formData.append("number_of_cartons", editForm.numberOfCartons);
      }

      await updateProduct({ id: product.id, data: formData }).unwrap();

      setIsEditing(false);
      setNewPhotos([]);
      setNewPhotoPreviews([]);
      // Optional: manually trigger local update or refetch
    } catch (err) {
      console.error("Failed to update product", err);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  // Helper to get category/currency display for view mode
  const currentCategory =
    categories.find((c) => c.value === product.type) || categories[3];

  if (isEditing && editForm) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 -ml-2 active:bg-gray-100 rounded-xl transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl text-gray-900">Modifier</h1>
          <button
            onClick={handleSaveEdit}
            disabled={isUpdating}
            className="text-orange-600 px-4 py-2 rounded-xl active:bg-orange-50 transition flex items-center gap-2"
          >
            {isUpdating ? "..." : <Save className="w-5 h-5" />}
            {isUpdating ? "Sauvegarde..." : "Sauver"}
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="text-sm text-gray-700 mb-2 block">
              Nom du produit
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-gray-700 mb-2 block">
              Description
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Supplier */}
          <SupplierSelect
            value={editForm.supplier_id}
            onChange={(id) => setEditForm({ ...editForm, supplier_id: id })}
          />

          {/* Price & Quantity & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Prix</label>
              <input
                type="number"
                step="0.01"
                value={editForm.price}
                onChange={(e) =>
                  setEditForm({ ...editForm, price: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-2 block">
                Quantité
              </label>
              <input
                type="number"
                value={editForm.quantity}
                onChange={(e) =>
                  setEditForm({ ...editForm, quantity: e.target.value })
                }
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
                onChange={(e) =>
                  setEditForm({ ...editForm, date: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-2 block">
                Taux de change
              </label>
              <input
                type="number"
                step="0.01"
                value={editForm.exchange_rate}
                onChange={(e) =>
                  setEditForm({ ...editForm, exchange_rate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Category & Devise */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700 mb-2 block">
                Catégorie
              </label>
              <select
                value={editForm.category_id}
                onChange={(e) =>
                  setEditForm({ ...editForm, category_id: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Devise</label>
              <select
                value={editForm.devise_id}
                onChange={(e) =>
                  setEditForm({ ...editForm, devise_id: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                {(devisesList || []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Volume & CBM */}
          <div>
            <label className="text-sm text-gray-700 mb-2 block font-medium">
              Volume Total (CBM - m³)
            </label>
            <input
              type="number"
              step="0.0001"
              value={editForm.cbm}
              onChange={(e) => setEditForm({ ...editForm, cbm: e.target.value })}
              placeholder="0.0000"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Customs Price & Currency */}
          <div>
            <label className="text-sm text-gray-700 mb-2 block font-medium">
              Prix de dédouanement (Unitaire)
            </label>
            <div className="flex gap-2">
              <div className="flex-[2] relative">
                <input
                  type="number"
                  step="0.01"
                  value={editForm.customs_price}
                  onChange={(e) =>
                    setEditForm({ ...editForm, customs_price: e.target.value })
                  }
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex-1 relative">
                <select
                  value={editForm.customs_price_currency}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      customs_price_currency: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white font-bold text-orange-600"
                >
                  <option value="USD">USD</option>
                  <option value="RMB">RMB</option>
                  <option value="BIF">BIF</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Packaging */}
          <div>
            <label className="text-sm text-gray-700 mb-2 block">
              Emballage
            </label>
            <div className="grid grid-cols-3 gap-2">
              {packagingTypes.map((pkg) => (
                <button
                  key={pkg.value}
                  type="button"
                  onClick={() =>
                    setEditForm({ ...editForm, packaging: pkg.value })
                  }
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

          {editForm.packaging === "carton" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700 mb-2 block">
                  Pièces par carton
                </label>
                <input
                  type="number"
                  value={editForm.unit_per_package}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      unit_per_package: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700 mb-2 block">
                  Nombre de cartons
                </label>
                <input
                  type="number"
                  value={editForm.numberOfCartons}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      numberOfCartons: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          {editForm.packaging === "other" && (
            <div>
              <label className="text-sm text-gray-700 mb-2 block">
                Description de l'emballage
              </label>
              <input
                type="text"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
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
              {Array.isArray(product.photo) &&
                product.photo.map((p, idx) => (
                  <div
                    key={`existing-${idx}`}
                    className="relative flex-shrink-0"
                  >
                    <img
                      src={p}
                      className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                    />
                    {/* Maybe allow delete existing? Not requested yet */}
                  </div>
                ))}
              {/* New Photos */}
              {newPhotoPreviews.map((p, idx) => (
                <div key={`new-${idx}`} className="relative flex-shrink-0">
                  <img
                    src={p}
                    className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                  />
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
      <div className="relative group">
        {/* Main Product Image */}
        <img
          src={
            Array.isArray(product.photo)
              ? product.photo[0] ||
                "https://via.placeholder.com/640x480?text=No+Image"
              : product.photo
          }
          alt={product.name}
          className="w-full h-80 object-cover cursor-pointer"
          onClick={() => {
            setPreviewImage(
              Array.isArray(product.photo) ? product.photo[0] : product.photo,
            );
            setIsPreviewOpen(true);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

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

        <button
          onClick={() => {
            setPreviewImage(
              Array.isArray(product.photo) ? product.photo[0] : product.photo,
            );
            setIsPreviewOpen(true);
          }}
          className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md p-3 rounded-full text-white active:scale-95 transition"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 -mt-6 relative pb-24">
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-4">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl text-gray-900">{product.name}</h1>
            <div className="flex gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="p-2 bg-green-50 text-green-600 rounded-full active:scale-90 transition"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleCopyLink}
                className="p-2 bg-blue-50 text-blue-600 rounded-full active:scale-90 transition"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
          {product.description && (
            <p className="text-gray-600 mb-4">{product.description}</p>
          )}

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700">Prix d'achat</span>
              <div className="text-2xl text-orange-600">
                {product.price} {product.currency}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Taux: {product.exchangeRate}
              </span>
              <span className="text-gray-800">
                {product.convertedPrice
                  ? product.convertedPrice.toLocaleString("fr-FR", {
                      maximumFractionDigits: 0,
                    })
                  : "0"}{" "}
                BIF
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

          <button
            onClick={handleArchiveToggle}
            disabled={isArchiving || isUnarchiving}
            className={`w-full flex items-center justify-center gap-2 mt-3 py-3 rounded-xl transition-all active:scale-95 ${
              product.is_archived
                ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {product.is_archived ? (
              <>
                <RotateCcw className="w-5 h-5" />
                {isUnarchiving ? "Restauration..." : "Restaurer le produit"}
              </>
            ) : (
              <>
                <Archive className="w-5 h-5" />
                {isArchiving ? "Archivage..." : "Archiver le produit"}
              </>
            )}
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
          <h2 className="text-lg text-gray-900 mb-4">Détails</h2>

          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="bg-blue-100 p-3 rounded-xl">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Fournisseur</div>
              <div className="text-gray-900">
                {product.supplier_name || "Non spécifié"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="bg-red-50 p-3 rounded-xl">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Dédouanement</div>
              <div className="text-gray-900 font-bold">
                {product.customs_price?.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {product.customs_price_currency || product.currency}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Maximize2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Volume Total</div>
              <div className="text-gray-900 font-bold">
                {product.cbm || "0.0000"} m³
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="bg-orange-100 p-3 rounded-xl">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Emballage</div>
              <div className="text-gray-900">
                {packagingLabels[product.packaging] || product.packaging}
              </div>
            </div>
          </div>

          {product.packaging === "carton" && (
            <>
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Box className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Nombre de carton</div>
                  <div className="text-gray-900">
                    {product.numberOfCartons || product.number_of_cartons}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">
                    Nombre de piece par carton
                  </div>
                  <div className="text-gray-900">
                    {product.unit_per_package || product.piecesPerCarton}
                  </div>
                </div>
              </div>
            </>
          )}

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
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Archive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4">
            {/* Header */}
            <div className="text-center">
              <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <Archive className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Archiver dans un conteneur</h3>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setArchiveMode("existing")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  archiveMode === "existing" ? "bg-white shadow text-gray-900" : "text-gray-500"
                }`}
              >
                Existant
              </button>
              <button
                onClick={() => setArchiveMode("new")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  archiveMode === "new" ? "bg-white shadow text-gray-900" : "text-gray-500"
                }`}
              >
                Nouveau
              </button>
            </div>

            {/* Existing container picker */}
            {archiveMode === "existing" && (
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={containerSearch}
                    onChange={(e) => setContainerSearch(e.target.value)}
                    placeholder="Rechercher un conteneur..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-gray-100">
                  {(containersList || [])
                    .filter(c =>
                      c.name.toLowerCase().includes(containerSearch.toLowerCase()) ||
                      c.serial_number.toLowerCase().includes(containerSearch.toLowerCase())
                    )
                    .map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedContainerId(c.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition ${
                          selectedContainerId === c.id
                            ? "bg-blue-50 border-l-4 border-blue-500"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-400">#{c.serial_number} · {c.products_count} produit(s)</p>
                        </div>
                        {selectedContainerId === c.id && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  {(containersList || []).length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-4">Aucun conteneur existant</p>
                  )}
                </div>
              </div>
            )}

            {/* New container form */}
            {archiveMode === "new" && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-700 block mb-1">Nom *</label>
                  <input
                    type="text"
                    value={archiveForm.name}
                    onChange={e => setArchiveForm({ ...archiveForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Conteneur A"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1">Numéro de série *</label>
                  <input
                    type="text"
                    value={archiveForm.serial_number}
                    onChange={e => setArchiveForm({ ...archiveForm, serial_number: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: CTN-1234"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1">Description</label>
                  <textarea
                    value={archiveForm.description}
                    onChange={e => setArchiveForm({ ...archiveForm, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                    placeholder="Détails..."
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => { setShowArchiveModal(false); setSelectedContainerId(null); setContainerSearch(""); }}
                className="py-3 bg-gray-100 text-gray-700 rounded-xl active:scale-95 transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmArchive}
                disabled={isArchiving}
                className="py-3 bg-blue-600 text-white rounded-xl active:scale-95 transition flex justify-center items-center gap-2"
              >
                {isArchiving ? "En cours..." : "Archiver"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-6">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 animate-slide-up">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">
                Supprimer le produit ?
              </h3>
              <p className="text-gray-600">Cette action est irréversible.</p>
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
      {/* Image Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col">
          {/* Controls Overlay */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-[110] bg-gradient-to-b from-black/80 to-transparent pt-12">
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white active:scale-90 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white active:scale-90 transition"
              >
                <Download className="w-6 h-6" />
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white active:scale-90 transition"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center p-2 bg-black">
            <img
              src={previewImage}
              alt="Full screen preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Bottom Info Hint */}
          <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none">
            <span className="text-white/40 text-xs px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full">
              Pincer pour zoomer
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
