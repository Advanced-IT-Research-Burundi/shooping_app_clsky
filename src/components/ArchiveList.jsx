import { Search, Filter, Package, Box, CheckCircle2, Circle, Trash2, RotateCcw, X, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { 
  useGetProductsQuery,
  useBulkUnarchiveProductsMutation, 
  useBulkDeleteProductsMutation 
} from "../features/auth/apiSlicer";

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

export function ArchiveList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data: apiData, isFetching } = useGetProductsQuery({ page, archived: true });
  
  // NOTE: The current apiSlicer.js getProducts query is: query: (page = 1) => `/products?page=${page}`
  // I should probably update apiSlicer to handle an object for query args or just pass the string.
  // Let's assume for now I can pass a string or I'll update apiSlicer in the next step.
  
  const products = apiData?.data || [];
  const hasMore = apiData?.meta?.current_page < apiData?.meta?.last_page;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);

  const [bulkUnarchive] = useBulkUnarchiveProductsMutation();
  const [bulkDelete] = useBulkDeleteProductsMutation();

  const isSelectionMode = selectedIds.length > 0;

  const observer = useRef();
  const lastElementRef = useCallback(
    (node) => {
      if (isFetching) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prev => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetching, hasMore]
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || product.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const handleBulkUnarchive = async () => {
    if (window.confirm(`Désarchiver ${selectedIds.length} produits ?`)) {
      await bulkUnarchive(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Supprimer définitivement ${selectedIds.length} produits ?`)) {
      await bulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/profile")}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Archives</h1>
          </div>
          <div className="bg-orange-100 px-3 py-1 rounded-full text-sm text-orange-600 font-medium">
            {filteredProducts.length}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          {isSelectionMode ? (
            <button 
              onClick={selectAll}
              className="text-sm text-orange-600 font-medium"
            >
              {selectedIds.length === filteredProducts.length ? "Tout désélectionner" : "Tout sélectionner"}
            </button>
          ) : (
            <span className="text-sm text-gray-500">Gérez vos produits archivés</span>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans les archives..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
              filterType === "all"
                ? "bg-orange-600 text-white shadow-md shadow-orange-200"
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
                  ? "bg-orange-600 text-white shadow-md shadow-orange-200"
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
            onClick={() => navigate(`/product/${product.id}`)}
            className="bg-white rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform group relative border border-gray-100"
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
                className="w-full h-full object-cover grayscale-[0.5]"
              />
              
              {/* Selection Overlay */}
              <div 
                onClick={(e) => toggleSelect(product.id, e)}
                className="absolute inset-0 z-20 hover:bg-black/5 transition-colors"
              >
                <div className={`absolute top-2 left-2 p-1 rounded-full transition-all ${
                  selectedIds.includes(product.id) 
                    ? "bg-orange-600 text-white scale-110 shadow-lg" 
                    : "bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                }`}>
                  {selectedIds.includes(product.id) ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
              </div>

              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs z-10">
                {typeIcons[product.type] || typeIcons.other}
              </div>
              
              <div className="absolute bottom-2 right-2 bg-gray-900/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-white font-medium z-10">
                ARCHIV\xC9
              </div>
            </div>
            <div className="p-3">
              <h3 className="text-sm text-gray-900 truncate mb-1 font-medium">
                {product.name}
              </h3>
              <div className="text-orange-600 mb-1 font-bold">
                {product.price} {product.currency}
              </div>
              <div className="text-xs text-gray-500">
                {(product.convertedPrice / 1e3).toFixed(0)}K BIF
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Infinite Scroll Sentinel */}
      {(hasMore || isFetching) && (
        <div ref={lastElementRef} className="py-8 text-center text-gray-500 text-sm italic">
          {isFetching ? "Chargement des archives..." : "Défiler pour charger plus"}
        </div>
      )}

      {filteredProducts.length === 0 && !isFetching && (
        <div className="text-center py-20 px-6">
          <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Archive className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Aucun produit archivé</h2>
          <p className="text-gray-500">
            Les produits que vous archivez apparaîtront ici.
          </p>
        </div>
      )}

      {/* Bulk Action Bar */}
      {isSelectionMode && (
        <div className="fixed bottom-6 left-4 right-4 bg-gray-900 text-white p-4 rounded-2xl shadow-2xl z-50 flex items-center justify-between animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedIds([])}
              className="p-1 hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="font-medium">{selectedIds.length} sélectionnés</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkUnarchive}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Restaurer
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl transition text-sm font-medium"
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
