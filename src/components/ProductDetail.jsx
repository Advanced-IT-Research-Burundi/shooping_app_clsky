import { ArrowLeft, Edit, Trash2, Package, Box, Calendar, DollarSign } from "lucide-react";
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
const packagingLabels = {
  unit: "Unit\xE9",
  carton: "Carton",
  other: "Autre"
};
export function ProductDetail({ product, onBack, onDelete, onEdit }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(product);
  const handleDelete = () => {
    onDelete(product.id);
  };
  const handleSaveEdit = () => {
    onEdit(editedProduct);
    setIsEditing(false);
  };
  if (isEditing) {
    return <div className="min-h-screen bg-gray-50">
        {
      /* Header */
    }
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <button onClick={() => setIsEditing(false)} className="p-2 -ml-2 active:bg-gray-100 rounded-xl transition">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl text-gray-900">Modifier</h1>
          <button onClick={handleSaveEdit} className="text-orange-600 px-4 py-2 rounded-xl active:bg-orange-50 transition">
            Sauver
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="text-sm text-gray-700 mb-2 block">Nom du produit</label>
            <input
      type="text"
      value={editedProduct.name}
      onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
    />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-2 block">Description</label>
            <textarea
      value={editedProduct.description}
      onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
      rows={3}
      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
    />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Prix</label>
              <input
      type="number"
      step="0.01"
      value={editedProduct.price}
      onChange={(e) => setEditedProduct({ ...editedProduct, price: parseFloat(e.target.value) || 0 })}
      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
    />
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-2 block">Taux de change</label>
              <input
      type="number"
      step="0.01"
      value={editedProduct.exchangeRate}
      onChange={(e) => {
        const rate = parseFloat(e.target.value) || 0;
        setEditedProduct({
          ...editedProduct,
          exchangeRate: rate,
          convertedPrice: editedProduct.price * rate
        });
      }}
      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
    />
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50">
      {
    /* Header with Image */
  }
      <div className="relative">
        <img
          src={Array.isArray(product.photo) ? (product.photo[0] || 'https://via.placeholder.com/640x480?text=No+Image') : product.photo}
          alt={product.name}
          className="w-full h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        
        {
    /* Back Button */
  }
        <button
    onClick={onBack}
    className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg active:scale-95 transition"
  >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>

        {
    /* Type Badge */
  }
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-2">
          <span className="text-xl">{typeIcons[product.type] || typeIcons.other}</span>
          <span className="text-sm text-gray-800">{typeLabels[product.type] || product.type}</span>
        </div>
      </div>

      {
    /* Content */
  }
      <div className="px-6 -mt-6 relative pb-24">
        {
    /* Main Info Card */
  }
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-4">
          <h1 className="text-2xl text-gray-900 mb-2">{product.name}</h1>
          {product.description && <p className="text-gray-600 mb-4">{product.description}</p>}

          {
    /* Price Info */
  }
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700">Prix d'achat</span>
              <div className="text-2xl text-orange-600">
                {product.price} {product.currency}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Taux de change: {product.exchangeRate}</span>
              <span className="text-gray-800">
                {product.convertedPrice.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} BIF
              </span>
            </div>
          </div>

          {
    /* Action Buttons */
  }
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

        {
    /* Details Card */
  }
        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
          <h2 className="text-lg text-gray-900 mb-4">Détails</h2>

          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="bg-orange-100 p-3 rounded-xl">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Emballage</div>
              <div className="text-gray-900">{packagingLabels[product.packaging]}</div>
            </div>
          </div>

          {product.packaging === "carton" && <>
              {product.piecesPerCarton && <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <Box className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Pièces par carton</div>
                    <div className="text-gray-900">{product.piecesPerCarton}</div>
                  </div>
                </div>}
              {product.numberOfCartons && <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <Box className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Nombre de cartons</div>
                    <div className="text-gray-900">{product.numberOfCartons}</div>
                  </div>
                </div>}
            </>}

          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="bg-orange-100 p-3 rounded-xl">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Devise</div>
              <div className="text-gray-900">{product.currency}</div>
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

      {
    /* Delete Confirmation Modal */
  }
      {showDeleteConfirm && <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-6">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 animate-slide-up">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">Supprimer le produit ?</h3>
              <p className="text-gray-600">
                Cette action est irréversible. Le produit sera définitivement supprimé.
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
        </div>}
    </div>;
}
