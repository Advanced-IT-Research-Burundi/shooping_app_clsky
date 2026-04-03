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

  const handleBulkArchive = async () => {
    if (window.confirm(`Archiver ${selectedIds.length} produits ?`)) {
      await bulkArchive(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (
      window.confirm(
        `Supprimer définitivement ${selectedIds.length} produits ?`,
      )
    ) {
      await bulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

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

      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
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
                className="absolute inset-0 z-20 group-hover:bg-black/5 transition-colors"
              >
                <div
                  className={`absolute top-2 left-2 p-1 rounded-full transition-all ${
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
              <div className="text-xs text-gray-500">
                {(product.convertedPrice / 1e3).toFixed(0)}K BIF
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
    </div>
  );
}
