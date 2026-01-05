import { Search, Filter, Package, Box } from "lucide-react";
import { useState } from "react";
const typeIcons = {
  food: "\u{1F34E}",
  electronics: "\u{1F4F1}",
  clothing: "\u{1F455}",
  other: "\u{1F4E6}"
};
const typeLabels = {
  food: "Alimentaire",
  electronics: "\xC9lectronique",
  clothing: "V\xEAtements",
  other: "Autres"
};
import { useEffect, useRef, useCallback } from "react";
import { useOutletContext } from "react-router-dom";

export function ProductList(props) {
  const context = useOutletContext() || {};
  const products = props.products || context.products || [];
  const onProductClick = props.onProductClick || context.onProductClick;
  const onLoadMore = props.onLoadMore || context.onLoadMore;
  const hasMore = props.hasMore !== undefined ? props.hasMore : context.hasMore;
  const isFetching = props.isFetching !== undefined ? props.isFetching : context.isFetching;
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (isFetching) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        if (onLoadMore) onLoadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [isFetching, hasMore, onLoadMore]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || product.type === filterType;
    return matchesSearch && matchesFilter;
  });
  return <div className="min-h-screen bg-gray-50">
      {
    /* Header */
  }
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl text-gray-900">Produits</h1>
          <div className="bg-orange-100 px-3 py-1 rounded-full text-sm text-orange-600">
            {filteredProducts.length}
          </div>
        </div>

        {
    /* Search */
  }
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl text-gray-900">Fournisseurs</h1>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-full hover:bg-orange-700 transition-colors">
          Nouveau
        </button>
      </div>

        {
    /* Filter Chips */
  }
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
          <button
    onClick={() => setFilterType("all")}
    className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${filterType === "all" ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-700"}`}
  >
            Tous
          </button>
          {Object.entries(typeLabels).map(([key, label]) => <button
    key={key}
    onClick={() => setFilterType(key)}
    className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all flex items-center gap-2 ${filterType === key ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-700"}`}
  >
              <span>{typeIcons[key]}</span>
              {label}
            </button>)}
        </div>
      </div>

      {
    /* Product Grid */
  }
      <div className="p-6 grid grid-cols-2 gap-4">
        {filteredProducts.map((product) => <div
    key={product.id}
    onClick={() => onProductClick(product.id)}
    className="bg-white rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform"
  >
            <div className="relative aspect-square">
              <img
                src={Array.isArray(product.photo) ? (product.photo[0] || 'https://via.placeholder.com/300?text=No+Image') : product.photo}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs">
                {typeIcons[product.type] || typeIcons.other}
              </div>
              {product.packaging === "carton" && <div className="absolute top-2 left-2 bg-orange-500 text-white p-1.5 rounded-lg">
                  <Box className="w-4 h-4" />
                </div>}
            </div>
            <div className="p-3">
              <h3 className="text-sm text-gray-900 truncate mb-1">{product.name}</h3>
              <div className="text-orange-600 mb-1">
                {product.price} {product.currency}
              </div>
              <div className="text-xs text-gray-500">
                {(product.convertedPrice / 1e3).toFixed(0)}K BIF
              </div>
              {product.packaging === "carton" && product.numberOfCartons && <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {product.numberOfCartons} cartons
                </div>}
            </div>
          </div>)}
      </div>
      
      {/* Infinite Scroll Sentinel / Loading Indicator */}
       {(hasMore || isFetching) && (
          <div ref={lastElementRef} className="py-4 text-center text-gray-500">
            {isFetching ? 'Chargement...' : 'Charger plus de produits'}
          </div>
       )}


      {filteredProducts.length === 0 && <div className="text-center py-12 px-6">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500">Aucun produit trouvé</p>
          <p className="text-sm text-gray-400 mt-1">
            Essayez de modifier vos filtres
          </p>
        </div>}
    </div>;
}
