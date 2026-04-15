import {
  Plus,
  ShoppingBag,
  DollarSign,
  Package,
  RefreshCw,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";

export function Home(props) {
  const context = useOutletContext() || {};
  const products = props.products || context.products || [];
  const onAddClick = props.onAddClick || context.onAddClick;
  const onProductClick = props.onProductClick || context.onProductClick;
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.convertedPrice, 0);
  const onRefresh = props.onRefresh || context.onRefresh;
  return (
    // add refresh button
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-6 pt-12 pb-8 text-gray-900 bg-orange-500 shadow-sm">
        <div className="flex flex-row items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Eden Mart</h1>
          <button
            onClick={onRefresh}
            className="flex items-right gap-2 px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-white">Gérez vos produits facilement</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 px-6 mb-6 -mt-6">
        <div className="p-5 bg-white border-b-4 border-orange-500 shadow-md rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl text-gray-900">{totalProducts}</div>
          <div className="text-sm text-gray-500">Produits</div>
        </div>

        <div className="p-5 bg-white border-b-4 border-green-500 shadow-md rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-xl">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl text-gray-900">
            {(totalValue / 1e6).toFixed(1)}M
          </div>
          <div className="text-sm text-gray-500">BIF Total</div>
        </div>
      </div>

      {/* Add Button */}
      <div className="px-6 mb-6">
        <button
          onClick={onAddClick}
          className="flex items-center justify-center w-full gap-3 p-5 text-white transition-transform bg-orange-600 shadow-lg rounded-2xl active:scale-95 hover:bg-orange-700"
        >
          <Plus className="w-6 h-6" />
          <span className="text-lg">Ajouter un achat</span>
        </button>
      </div>

      {/* Recent Purchases */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-gray-900">Achats récents</h2>
          <ShoppingBag className="w-5 h-5 text-gray-400" />
        </div>

        <div className="space-y-3">
          {products.slice(0, 5).map((product) => (
            <div
              key={product.id}
              onClick={() => onProductClick(product.id)}
              className="flex items-center gap-4 p-4 transition-transform bg-white shadow-sm rounded-2xl active:scale-98"
            >
              <img
                src={
                  Array.isArray(product.photo)
                    ? product.photo[0] ||
                      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800"
                    : product.photo
                }
                alt={product.name}
                className="object-cover w-16 h-16 rounded-xl"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 truncate">{product.name}</h3>
                <p className="text-sm text-gray-500 capitalize">
                  {product.type}
                </p>
              </div>
              <div className="text-right">
                <div className="text-blue-600">
                  {product.price} {product.currency}
                </div>
                <div className="text-xs text-gray-500">{product.date}</div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="py-12 text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500">Aucun achat enregistré</p>
            <p className="mt-1 text-sm text-gray-400">
              Commencez par ajouter votre premier produit
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
