import { useState, useRef } from "react";
import { Camera, X, Upload, ChevronDown } from "lucide-react";
const currencies = ["USD", "EUR", "BIF", "GBP", "CAD", "JPY"];
const productTypes = [
  { value: "food", label: "Alimentaire", icon: "\u{1F34E}" },
  { value: "electronics", label: "\xC9lectronique", icon: "\u{1F4F1}" },
  { value: "clothing", label: "V\xEAtements", icon: "\u{1F455}" },
  { value: "other", label: "Autres", icon: "\u{1F4E6}" }
];
const packagingTypes = [
  { value: "unit", label: "Unit\xE9" },
  { value: "carton", label: "Carton" },
  { value: "other", label: "Autre" }
];
export function AddPurchase({ onSubmit, onCancel }) {
  const [photo, setPhoto] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState("2850");
  const [type, setType] = useState("other");
  const [packaging, setPackaging] = useState("unit");
  const [piecesPerCarton, setPiecesPerCarton] = useState("");
  const [numberOfCartons, setNumberOfCartons] = useState("");
  const fileInputRef = useRef(null);
  const convertedPrice = price && exchangeRate ? parseFloat(price) * parseFloat(exchangeRate) : 0;
  const handlePhotoCapture = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !photo) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    const product = {
      name,
      description,
      price: parseFloat(price),
      currency,
      exchangeRate: parseFloat(exchangeRate),
      convertedPrice,
      type,
      packaging,
      photo
    };
    if (packaging === "carton") {
      product.piecesPerCarton = piecesPerCarton ? parseInt(piecesPerCarton) : void 0;
      product.numberOfCartons = numberOfCartons ? parseInt(numberOfCartons) : void 0;
    }
    onSubmit(product);
  };
  return <div className="min-h-screen bg-gray-50">
      {
    /* Header */
  }
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={onCancel} className="p-2 -ml-2 active:bg-gray-100 rounded-xl transition">
          <X className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl text-gray-900">Ajouter un achat</h1>
        <div className="w-10" />
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 pb-24">
        {
    /* Photo Section */
  }
        <div className="space-y-3">
          <label className="text-sm text-gray-700">Photo du produit *</label>
          {!photo ? <button
    type="button"
    onClick={() => fileInputRef.current?.click()}
    className="w-full bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-8 flex flex-col items-center gap-3 active:scale-98 transition-transform shadow-lg"
  >
              <div className="bg-white/20 p-4 rounded-full">
                <Camera className="w-8 h-8" />
              </div>
              <span className="text-lg">Prendre une photo</span>
              <span className="text-sm text-orange-100">ou télécharger une image</span>
            </button> : <div className="relative">
              <img src={photo} alt="Product" className="w-full h-64 object-cover rounded-2xl" />
              <button
    type="button"
    onClick={() => setPhoto("")}
    className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full shadow-lg active:scale-95 transition"
  >
                <X className="w-5 h-5" />
              </button>
              <button
    type="button"
    onClick={() => fileInputRef.current?.click()}
    className="absolute bottom-3 right-3 bg-white text-gray-700 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 active:scale-95 transition"
  >
                <Upload className="w-4 h-4" />
                Changer
              </button>
            </div>}
          <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    capture="environment"
    onChange={handlePhotoCapture}
    className="hidden"
  />
        </div>

        {
    /* Product Info */
  }
        <div className="bg-white rounded-2xl p-5 space-y-5 shadow-sm">
          <div>
            <label className="text-sm text-gray-700 mb-2 block">Nom du produit *</label>
            <input
    type="text"
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="Ex: Smartphone Samsung"
    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
  />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-2 block">Description</label>
            <textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Détails supplémentaires..."
    rows={3}
    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
  />
          </div>
        </div>

        {
    /* Pricing */
  }
        <div className="bg-white rounded-2xl p-5 space-y-5 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Prix d'achat *</label>
              <input
    type="number"
    step="0.01"
    value={price}
    onChange={(e) => setPrice(e.target.value)}
    placeholder="0.00"
    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
  />
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-2 block">Devise *</label>
              <div className="relative">
                <select
    value={currency}
    onChange={(e) => setCurrency(e.target.value)}
    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white"
  >
                  {currencies.map((curr) => <option key={curr} value={curr}>{curr}</option>)}
                </select>
                <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-2 block">Taux de change (vers BIF)</label>
            <input
    type="number"
    step="0.01"
    value={exchangeRate}
    onChange={(e) => setExchangeRate(e.target.value)}
    placeholder="2850"
    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
  />
          </div>

          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <div className="text-sm text-gray-600 mb-1">Prix converti</div>
            <div className="text-2xl text-orange-600">
              {convertedPrice.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} BIF
            </div>
          </div>
        </div>

        {
    /* Product Type */
  }
        <div className="space-y-3">
          <label className="text-sm text-gray-700">Type de produit</label>
          <div className="grid grid-cols-2 gap-3">
            {productTypes.map((pt) => <button
    key={pt.value}
    type="button"
    onClick={() => setType(pt.value)}
    className={`p-4 rounded-2xl border-2 transition-all ${type === pt.value ? "border-orange-500 bg-orange-50" : "border-gray-200 bg-white"}`}
  >
                <div className="text-3xl mb-1">{pt.icon}</div>
                <div className={`text-sm ${type === pt.value ? "text-orange-600" : "text-gray-700"}`}>
                  {pt.label}
                </div>
              </button>)}
          </div>
        </div>

        {
    /* Packaging */
  }
        <div className="bg-white rounded-2xl p-5 space-y-5 shadow-sm">
          <div>
            <label className="text-sm text-gray-700 mb-2 block">Emballage</label>
            <div className="grid grid-cols-3 gap-2">
              {packagingTypes.map((pkg) => <button
    key={pkg.value}
    type="button"
    onClick={() => setPackaging(pkg.value)}
    className={`py-3 px-2 rounded-xl border-2 text-sm transition-all ${packaging === pkg.value ? "border-orange-500 bg-orange-50 text-orange-600" : "border-gray-200 bg-white text-gray-700"}`}
  >
                  {pkg.label}
                </button>)}
            </div>
          </div>

          {packaging === "carton" && <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <label className="text-sm text-gray-700 mb-2 block">Pièces/carton</label>
                <input
    type="number"
    value={piecesPerCarton}
    onChange={(e) => setPiecesPerCarton(e.target.value)}
    placeholder="12"
    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
  />
              </div>
              <div>
                <label className="text-sm text-gray-700 mb-2 block">Nb cartons</label>
                <input
    type="number"
    value={numberOfCartons}
    onChange={(e) => setNumberOfCartons(e.target.value)}
    placeholder="10"
    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
  />
              </div>
            </div>}
        </div>

        {
    /* Submit Button */
  }
        <button
    type="submit"
    className="w-full bg-orange-600 text-white py-4 rounded-2xl shadow-lg active:scale-98 transition-transform text-lg"
  >
          Enregistrer l'achat
        </button>
      </form>
    </div>;
}
