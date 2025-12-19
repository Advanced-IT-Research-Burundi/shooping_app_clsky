import { Search, Filter, Package, Box } from 'lucide-react';
import { useState } from 'react';
import { Product } from '../App';

interface ProductListProps {
  products: Product[];
  onProductClick: (productId: string) => void;
}

const typeIcons = {
  food: '🍎',
  electronics: '📱',
  clothing: '👕',
  other: '📦'
};

const typeLabels = {
  food: 'Alimentaire',
  electronics: 'Électronique',
  clothing: 'Vêtements',
  other: 'Autres'
};

export function ProductList({ products, onProductClick }: ProductListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<Product['type'] | 'all'>('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || product.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl text-gray-900">Produits</h1>
          <div className="bg-blue-100 px-3 py-1 rounded-full text-sm text-blue-600">
            {filteredProducts.length}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Tous
          </button>
          {Object.entries(typeLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterType(key as Product['type'])}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                filterType === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <span>{typeIcons[key as Product['type']]}</span>
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
                src={product.photo}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs">
                {typeIcons[product.type]}
              </div>
              {product.packaging === 'carton' && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white p-1.5 rounded-lg">
                  <Box className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-sm text-gray-900 truncate mb-1">{product.name}</h3>
              <div className="text-blue-600 mb-1">
                {product.price} {product.currency}
              </div>
              <div className="text-xs text-gray-500">
                {(product.convertedPrice / 1000).toFixed(0)}K BIF
              </div>
              {product.packaging === 'carton' && product.numberOfCartons && (
                <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {product.numberOfCartons} cartons
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

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
    </div>
  );
}
