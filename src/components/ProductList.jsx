import {
  Search,
  Filter,
  Package,
  Box,
  CheckCircle2,
  Circle,
  Trash2,
  Archive,
  X,
} from "lucide-react";
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
import { useState } from "react";
const typeIcons = {
  food: "\u{1F34E}",
  electronics: "\u{1F4F1}",
  clothing: "\u{1F455}",
  other: "\u{1F4E6}",
};
const typeLabels = {
  food: "Alimentaire",
  electronics: "\xC9lectronique",
  clothing: "V\xEAtements",
  other: "Autres",
};
import { useEffect, useRef, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  useBulkArchiveProductsMutation,
  useBulkDeleteProductsMutation,
  useGetContainersQuery,
} from "../features/auth/apiSlicer";

export function ProductList(props) {
  const context = useOutletContext() || {};
  const products = props.products || context.products || [];
  const onProductClick = props.onProductClick || context.onProductClick;
  const onLoadMore = props.onLoadMore || context.onLoadMore;
  const hasMore = props.hasMore !== undefined ? props.hasMore : context.hasMore;
  const isFetching =
    props.isFetching !== undefined ? props.isFetching : context.isFetching;
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();

  const [bulkArchive] = useBulkArchiveProductsMutation();
  const [bulkDelete] = useBulkDeleteProductsMutation();

  const isSelectionMode = selectedIds.length > 0;

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const [showBulkArchiveModal, setShowBulkArchiveModal] = useState(false);
  const [archiveMode, setArchiveMode] = useState("existing"); // "existing" | "new"
  const [containerSearch, setContainerSearch] = useState("");
  const [selectedContainerId, setSelectedContainerId] = useState(null);
  const [archiveForm, setArchiveForm] = useState({
    name: "",
    serial_number: "",
    description: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const { data: containersList } = useGetContainersQuery();

  const confirmBulkArchive = async () => {
    setIsArchiving(true);
    try {
      let archiveData = {};
      if (archiveMode === "existing") {
        if (!selectedContainerId) {
          toast.error("Veuillez sélectionner un conteneur.");
          setIsArchiving(false);
          return;
        }
        const chosen = (containersList || []).find(
          (c) => c.id === selectedContainerId,
        );
        if (!chosen) {
          setIsArchiving(false);
          return;
        }
        archiveData = {
          name: chosen.name,
          serial_number: chosen.serial_number,
          description: chosen.description,
        };
      } else {
        if (!archiveForm.name) {
          toast.error("Le nom du conteneur est requis.");
          setIsArchiving(false);
          return;
        }
        if (!archiveForm.serial_number) {
          toast.error("Le numéro de série du conteneur est requis.");
          setIsArchiving(false);
          return;
        }
        archiveData = archiveForm;
      }

      await bulkArchive({ ids: selectedIds, data: archiveData }).unwrap();
      toast.success(`${selectedIds.length} produits archivés !`);
      setSelectedIds([]);
      setShowBulkArchiveModal(false);
      setArchiveForm({ name: "", serial_number: "", description: "" });
      setSelectedContainerId(null);
      setContainerSearch("");
    } catch (err) {
      toast.error("Erreur lors de l'archivage");
    }
    setIsArchiving(false);
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkDelete(selectedIds).unwrap();
      toast.success(`${selectedIds.length} produits supprimés !`);
      setSelectedIds([]);
      setShowDeleteConfirm(false);
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleBulkArchive = () => setShowBulkArchiveModal(true);
  const handleBulkDelete = () => setShowDeleteConfirm(true);

  const observer = useRef();
  const lastElementRef = useCallback(
    (node) => {
      if (isFetching) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          if (onLoadMore) onLoadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetching, hasMore, onLoadMore],
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || product.type === filterType;
    return matchesSearch && matchesFilter;
  });
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      <div className="bg-white border-b border-gray-200 px-6 py-4 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl text-gray-900">Produits</h1>
            <div className="bg-orange-100 px-3 py-1 rounded-full text-sm text-orange-600 font-medium">
              {filteredProducts.length}
            </div>
          </div>
          {isSelectionMode && (
            <button
              onClick={selectAll}
              className="text-sm text-orange-600 font-medium"
            >
              {selectedIds.length === filteredProducts.length
                ? "Tout désélectionner"
                : "Tout sélectionner"}
            </button>
          )}
        </div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl text-gray-900">12</h1>

          <button
            className="bg-orange-600 text-white px-4 py-2 rounded-full hover:bg-orange-700 transition-colors"
            onClick={() => navigate("/suppliers")}
          >
            Listes des fournisseurs
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
              filterType === "all"
                ? "bg-orange-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Tous
          </button>
          {Object.entries(typeLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                filterType === key
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <span>{typeIcons[key]}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="p-6 grid grid-cols-2 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => onProductClick(product.id)}
            className="bg-white rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform"
          >
            <div className="relative aspect-square">
              <img
                src={
                  Array.isArray(product.photo)
                    ? product.photo[0] ||
                      "https://via.placeholder.com/300?text=No+Image"
                    : product.photo
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Selection Overlay */}
              <div
                onClick={(e) => toggleSelect(product.id, e)}
                className="absolute inset-0 z-1 group-hover:bg-black/5 transition-colors"
              >
                <div
                  className={`absolute top-2 left-2 p-1 z-1 rounded-full transition-all ${
                    selectedIds.includes(product.id)
                      ? "bg-orange-600 text-white scale-110 shadow-lg"
                      : "bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                  }`}
                >
                  {selectedIds.includes(product.id) ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
              </div>

              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs z-1">
                {typeIcons[product.type] || typeIcons.other}
              </div>
              {product.packaging === "carton" && (
                <div className="absolute bottom-2 left-2 bg-orange-500 text-white p-1.5 rounded-lg z-10">
                  <Box className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-sm text-gray-900 truncate mb-1">
                {product.name}
              </h3>
              <div className="text-orange-600 mb-1">
                {product.price} {product.currency}
              </div>
              <div className="text-xs text-orange-600/70 mt-1 flex items-center gap-1 font-medium bg-orange-50 w-fit px-2 py-0.5 rounded-md">
                <span className="truncate">{product.supplier_name || 'Sans fournisseur'}</span>
              </div>
              {product.packaging === "carton" && product.numberOfCartons && (
                <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {product.numberOfCartons} cartons (
                  {product.unit_per_package || product.pieces_per_carton || "?"}{" "}
                  unités/carton)
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Infinite Scroll Sentinel / Loading Indicator */}
      {(hasMore || isFetching) && (
        <div ref={lastElementRef} className="py-4 text-center text-gray-500">
          {isFetching ? "Chargement..." : "Charger plus de produits"}
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 px-6">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500">Aucun produit trouvé</p>
          <p className="text-sm text-gray-400 mt-1">
            Essayez de modifier vos filtres
          </p>
        </div>
      )}
      {/* Bulk Action Bar */}
      {isSelectionMode && (
        <div className="fixed bottom-24 left-4 right-4 bg-gray-900 text-white p-4 rounded-2xl shadow-2xl z-50 flex items-center justify-between animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedIds([])}
              className="p-1 hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="font-medium">
              {selectedIds.length} sélectionnés
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkArchive}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition text-sm"
            >
              <Archive className="w-4 h-4" />
              Archiver
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl transition text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>
      )}

      {showBulkArchiveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 animate-slide-up">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Archive className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">
                Archiver {selectedIds.length} produits
              </h3>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setArchiveMode("existing")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  archiveMode === "existing"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-500"
                }`}
              >
                Existant
              </button>
              <button
                onClick={() => setArchiveMode("new")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  archiveMode === "new"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-500"
                }`}
              >
                Nouveau
              </button>
            </div>

            {/* Existing container picker */}
            {archiveMode === "existing" && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={containerSearch}
                    onChange={(e) => setContainerSearch(e.target.value)}
                    placeholder="Rechercher un conteneur..."
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-gray-100">
                  {(containersList || [])
                    .filter(
                      (c) =>
                        c.name
                          .toLowerCase()
                          .includes(containerSearch.toLowerCase()) ||
                        c.serial_number
                          .toLowerCase()
                          .includes(containerSearch.toLowerCase()),
                    )
                    .map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedContainerId(c.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition ${
                          selectedContainerId === c.id
                            ? "bg-orange-50 border-l-4 border-orange-500"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {c.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            #{c.serial_number} · {c.products_count} produit(s)
                          </p>
                        </div>
                        {selectedContainerId === c.id && (
                          <CheckCircle2 className="w-5 h-5 text-orange-500" />
                        )}
                      </button>
                    ))}
                  {(containersList || []).length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-4">
                      Aucun conteneur existant
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* New container form */}
            {archiveMode === "new" && (
              <div className="space-y-3 text-left">
                <div>
                  <label className="text-sm text-gray-700 block mb-1">
                    Nom du conteneur *
                  </label>
                  <input
                    type="text"
                    value={archiveForm.name}
                    onChange={(e) =>
                      setArchiveForm({ ...archiveForm, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ex: Conteneur A"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1">
                    Numéro de série *
                  </label>
                  <input
                    type="text"
                    value={archiveForm.serial_number}
                    onChange={(e) =>
                      setArchiveForm({
                        ...archiveForm,
                        serial_number: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ex: CTN-1234"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1">
                    Description
                  </label>
                  <textarea
                    value={archiveForm.description}
                    onChange={(e) =>
                      setArchiveForm({
                        ...archiveForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    rows={2}
                    placeholder="Détails..."
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => {
                  setShowBulkArchiveModal(false);
                  setSelectedContainerId(null);
                  setContainerSearch("");
                }}
                className="py-3 bg-gray-100 text-gray-700 rounded-xl active:scale-95 transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmBulkArchive}
                disabled={isArchiving}
                className="py-3 bg-orange-600 text-white rounded-xl active:scale-95 transition flex justify-center items-center gap-2"
              >
                {isArchiving ? "En cours..." : "Archiver"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="w-11/12 max-w-md rounded-2xl z-[60] bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Supprimer {selectedIds.length} produit(s) ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Êtes-vous sûr de vouloir supprimer
              définitivement ces produits ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex-row justify-end space-x-2">
            <AlertDialogCancel className="mt-0">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
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
