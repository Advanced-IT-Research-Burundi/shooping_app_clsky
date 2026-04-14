import {
  Search,
  CheckCircle2,
  Circle,
  Trash2,
  RotateCcw,
  X,
  ArrowLeft,
  Archive,
  Package,
  ChevronRight,
  Box,
  RefreshCw,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
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
import {
  useGetContainersQuery,
  useGetContainerProductsQuery,
  useBulkUnarchiveProductsMutation,
  useBulkDeleteProductsMutation,
} from "../features/auth/apiSlicer";

// ─── Container Card ─────────────────────────────────────────────────────────
function ContainerCard({ container, onClick }) {
  const photos = container.preview_photos || [];
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
    >
      {/* Photo Strip */}
      <div className="flex h-28 overflow-hidden bg-gray-100">
        {photos.length > 0 ? (
          photos
            .slice(0, 3)
            .map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className={`object-cover flex-1 min-w-0 ${
                  i > 0 ? "border-l border-white/40" : ""
                } ${photos.length === 1 ? "" : ""}`}
              />
            ))
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Box className="w-12 h-12 text-gray-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {container.name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            #{container.serial_number}
          </p>
          {container.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              {container.description}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full">
            {container.products_count}
          </span>
          <span className="text-[10px] text-gray-400">produits</span>
        </div>
      </div>
    </div>
  );
}

// ─── Products In Container View ──────────────────────────────────────────────
function ContainerProductsView({ containerId, containerName, onBack }) {
  const { data, isFetching, refetch } =
    useGetContainerProductsQuery(containerId);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    refetch();
  }, []);
  const [showUnarchiveConfirm, setShowUnarchiveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bulkUnarchive] = useBulkUnarchiveProductsMutation();
  const [bulkDelete] = useBulkDeleteProductsMutation();
  const navigate = useNavigate();

  const products = data?.products || [];
  const isSelectionMode = selectedIds.length > 0;

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    setSelectedIds(
      selectedIds.length === products.length ? [] : products.map((p) => p.id),
    );
  };

  const confirmBulkUnarchive = async () => {
    try {
      await bulkUnarchive(selectedIds).unwrap();
      toast.success(`${selectedIds.length} produits restaurés !`);
      setSelectedIds([]);
      setShowUnarchiveConfirm(false);
      refetch();
    } catch {
      toast.error("Erreur lors de la restauration");
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkDelete(selectedIds).unwrap();
      toast.success(`${selectedIds.length} produits supprimés !`);
      setSelectedIds([]);
      setShowDeleteConfirm(false);
      refetch();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {containerName}
              </h2>
              <p className="text-xs text-gray-400">
                {products.length} produit{products.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className={`p-2 hover:bg-gray-100 rounded-full transition ${isFetching ? "animate-spin" : ""}`}
            >
              <RefreshCw className="w-5 h-5 text-gray-500" />
            </button>
            {isSelectionMode && (
              <button
                onClick={selectAll}
                className="text-sm text-orange-600 font-medium"
              >
                {selectedIds.length === products.length
                  ? "Désélectionner"
                  : "Tout sélectionner"}
              </button>
            )}
          </div>
        </div>
      </div>

      {isFetching ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 px-6">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Archive className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-500">Ce conteneur est vide</p>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-2 gap-3">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 active:scale-95 transition-transform group relative"
            >
              <div className="relative aspect-square">
                <img
                  src={
                    Array.isArray(product.photo)
                      ? product.photo[0] ||
                        "https://via.placeholder.com/300?text=No+Image"
                      : product.photo ||
                        "https://via.placeholder.com/300?text=No+Image"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover grayscale-[0.4]"
                />
                {/* Selection */}
                <div
                  onClick={(e) => toggleSelect(product.id, e)}
                  className="absolute inset-0 z-20"
                >
                  <div
                    className={`absolute top-2 left-2 p-1 rounded-full transition-all ${
                      selectedIds.includes(product.id)
                        ? "bg-orange-600 text-white scale-110 shadow-lg"
                        : "bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {selectedIds.includes(product.id) ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-gray-900/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                  ARCHIVÉ
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </h3>
                <p className="text-orange-600 text-sm font-bold mt-0.5">
                  {product.price} {product.currency}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 truncate">
                  {product.supplier_name || "Sans fournisseur"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bulk Action Bar */}
      {isSelectionMode && (
        <div className="fixed bottom-6 left-4 right-4 bg-gray-900 text-white p-4 rounded-2xl shadow-2xl z-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedIds([])}
              className="p-1 hover:bg-white/10 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="font-medium">
              {selectedIds.length} sélectionnés
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUnarchiveConfirm(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" /> Restaurer
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" /> Supprimer
            </button>
          </div>
        </div>
      )}

      <AlertDialog
        open={showUnarchiveConfirm}
        onOpenChange={setShowUnarchiveConfirm}
      >
        <AlertDialogContent className="w-11/12 max-w-md rounded-2xl bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Restaurer {selectedIds.length} produit(s) ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ces produits seront retirés du conteneur et redeviendront actifs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex-row justify-end gap-2">
            <AlertDialogCancel className="mt-0">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkUnarchive}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Restaurer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="w-11/12 max-w-md rounded-2xl bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Supprimer {selectedIds.length} produit(s) ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex-row justify-end gap-2">
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

// ─── Main ArchiveList ────────────────────────────────────────────────────────
export function ArchiveList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContainer, setSelectedContainer] = useState(null);
  const { data: containers, isFetching, refetch } = useGetContainersQuery();

  useEffect(() => {
    refetch();
  }, []);

  const filtered = (containers || []).filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.serial_number.toLowerCase().includes(q)
    );
  });

  if (selectedContainer) {
    return (
      <ContainerProductsView
        containerId={selectedContainer.id}
        containerName={selectedContainer.name}
        onBack={() => setSelectedContainer(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-30">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/profile")}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Archives</h1>
            <p className="text-xs text-gray-400">
              {filtered.length} conteneur{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className={`ml-auto p-2 hover:bg-gray-100 rounded-full transition ${isFetching ? "animate-spin" : ""}`}
          >
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un conteneur..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
        </div>
      </div>

      {/* Content */}
      {isFetching ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 px-6">
          <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Archive className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Aucun conteneur
          </h2>
          <p className="text-gray-500 text-sm">
            Les produits archivés seront regroupés dans des conteneurs.
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {filtered.map((container) => (
            <ContainerCard
              key={container.id}
              container={container}
              onClick={() => setSelectedContainer(container)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
