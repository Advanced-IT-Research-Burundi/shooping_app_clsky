import { useState, useEffect } from "react";
import { X, PlusCircle, Trash2, ChevronDown, AlertCircle, Receipt } from "lucide-react";
import { toast } from "sonner";
import {
  useGetDepensesQuery,
  useAddDepenseMutation,
  useDeleteDepenseMutation,
  useGetDevisesQuery,
} from "../features/auth/apiSlicer";

// ─── helpers ───────────────────────────────────────────────────────────────
function fmt(n, dec = 0) {
  return Number(n || 0).toLocaleString("fr-FR", { maximumFractionDigits: dec });
}

const DEFAULT_RATES = { USD: 7500, RMB: 1050, BIF: 1 };

// ─── Single depense row (read mode) ────────────────────────────────────────
function DepenseRow({ d, onDelete }) {
  return (
    <div className="flex items-start justify-between gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{d.description || "—"}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          <span className="font-bold text-orange-600">{fmt(d.montant, 2)} {d.currency}</span>
          {d.montant_bif > 0 && d.currency !== "BIF" && (
            <span className="ml-2 text-gray-400">≈ {fmt(d.montant_bif)} BIF</span>
          )}
          {d.product_name && <span className="ml-2 text-blue-500">· {d.product_name}</span>}
        </p>
      </div>
      <button
        onClick={() => onDelete(d.id)}
        className="p-1.5 text-red-400 hover:text-red-600 active:scale-95 transition shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
/**
 * Props:
 *   open        boolean
 *   onClose     () => void
 *   productId   string | null  (pre-selects a product; if null, shows a free-form product_id input)
 *   productName string | null
 *   products    array          (list of all products for the select)
 */
export function AddDepenseModal({ open, onClose, productId = null, productName = null, products = [] }) {
  const { data: devisesList } = useGetDevisesQuery();
  const currencies = devisesList ? devisesList.map((d) => d.code) : ["USD", "RMB", "BIF"];

  // ── form state ────────────────────────────────────────────────────────
  const [selProductId, setSelProductId] = useState(productId || "");
  const [montant, setMontant]           = useState("");
  const [description, setDescription]  = useState("");
  const [currency, setCurrency]         = useState("USD");
  const [rate, setRate]                 = useState("");
  const [errors, setErrors]            = useState([]);

  // Sync when productId prop changes (e.g. modal opened from different product)
  useEffect(() => {
    if (productId) setSelProductId(productId);
  }, [productId]);

  // Auto-fill rate default when currency changes
  useEffect(() => {
    setRate(DEFAULT_RATES[currency]?.toString() || "");
  }, [currency]);

  // ── RTK Query ─────────────────────────────────────────────────────────
  const { data: depenses = [], isLoading: loadingList } = useGetDepensesQuery(
    selProductId || undefined,
    { skip: !open },
  );
  const [addDepense, { isLoading: adding }]   = useAddDepenseMutation();
  const [deleteDepense]                        = useDeleteDepenseMutation();

  // ── computed ──────────────────────────────────────────────────────────
  const montantBIF =
    currency === "BIF"
      ? parseFloat(montant) || 0
      : (parseFloat(montant) || 0) * (parseFloat(rate) || 1);

  const totalDepensesFiltered = depenses.reduce(
    (acc, d) => acc + Number(d.montant_bif || 0),
    0,
  );

  // ── handlers ─────────────────────────────────────────────────────────
  const reset = () => {
    setMontant("");
    setDescription("");
    setCurrency("USD");
    setRate(DEFAULT_RATES["USD"].toString());
    setErrors([]);
  };

  const handleAdd = async () => {
    setErrors([]);
    const errs = [];
    if (!selProductId) errs.push("Veuillez sélectionner un produit.");
    if (!montant || isNaN(parseFloat(montant)) || parseFloat(montant) <= 0)
      errs.push("Le montant est requis et doit être > 0.");
    if (!currency) errs.push("La devise est requise.");
    if (!rate || isNaN(parseFloat(rate)) || parseFloat(rate) <= 0)
      errs.push("Le taux est requis et doit être > 0.");
    if (errs.length) { setErrors(errs); return; }

    try {
      await addDepense({
        product_id:  selProductId,
        montant:     parseFloat(montant),
        description: description.trim() || null,
        currency,
        rate:        parseFloat(rate),
      }).unwrap();
      toast.success("Dépense enregistrée !");
      reset();
    } catch (err) {
      const msgs = err?.data?.errors
        ? Object.values(err.data.errors).flat()
        : [err?.data?.message || "Erreur lors de l'enregistrement."];
      setErrors(msgs);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDepense(id).unwrap();
      toast.success("Dépense supprimée.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="bg-white w-full max-w-lg rounded-t-3xl max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="bg-orange-100 p-2 rounded-xl">
              <Receipt className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Dépenses supplémentaires</h2>
              {(productName || selProductId) && (
                <p className="text-[11px] text-gray-400">{productName || `Produit #${selProductId}`}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 active:bg-gray-100 rounded-xl">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <ul className="text-sm text-red-700 list-disc list-inside space-y-0.5">
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {/* Product selector (only if no productId fixed) */}
          {!productId && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Produit *
              </label>
              <div className="relative">
                <select
                  value={selProductId}
                  onChange={(e) => setSelProductId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white text-sm"
                >
                  <option value="">— Sélectionner un produit —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          {/* New depense form */}
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 space-y-4">
            <p className="text-xs font-bold text-orange-700 uppercase tracking-wide">Nouvelle dépense</p>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Transport, Emballage, Taxe..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white"
              />
            </div>

            {/* Montant + Devise */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Montant *</label>
                <input
                  type="number"
                  step="0.01"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Devise *</label>
                <div className="relative">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white text-sm font-bold text-orange-600"
                  >
                    {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Rate */}
            {currency !== "BIF" && (
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Taux (1 {currency} = ? BIF) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="Ex: 7500"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white"
                />
              </div>
            )}

            {/* Preview */}
            {montant > 0 && (
              <div className="bg-white rounded-xl px-4 py-2.5 border border-orange-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">Estimation BIF</span>
                <span className="text-sm font-black text-orange-600">{fmt(montantBIF)} BIF</span>
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={adding}
              className="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-60"
            >
              <PlusCircle className="w-4 h-4" />
              {adding ? "Enregistrement..." : "Ajouter la dépense"}
            </button>
          </div>

          {/* List of existing depenses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Dépenses enregistrées
                {depenses.length > 0 && <span className="ml-1 text-orange-600">({depenses.length})</span>}
              </p>
              {totalDepensesFiltered > 0 && (
                <span className="text-xs font-bold text-orange-600">{fmt(totalDepensesFiltered)} BIF</span>
              )}
            </div>

            {loadingList ? (
              <p className="text-center text-sm text-gray-400 py-4">Chargement...</p>
            ) : depenses.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                Aucune dépense enregistrée
              </p>
            ) : (
              <div className="space-y-2">
                {depenses.map((d) => (
                  <DepenseRow key={d.id} d={d} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
