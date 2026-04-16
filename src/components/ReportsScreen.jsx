import { useState, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import {
  ChevronLeft,
  Download,
  FileText,
  Filter,
  Search,
  X,
  Printer,
  FileSpreadsheet,
  Package,
  User,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CalendarDays,
} from "lucide-react";
import { PullToRefresh } from "./ui/PullToRefresh";
import { useNavigate } from "react-router-dom";
import {
  useGetContainersQuery,
  useGetReportsQuery,
} from "../features/auth/apiSlicer";
import { SupplierSelect } from "./SupplierSelect";

// ─── Report modes ──────────────────────────────────────────────────────────
const MODES = [
  { id: "all", label: "Tous", icon: FileText },
  { id: "by_supplier", label: "Fournisseur", icon: User },
  { id: "by_container", label: "Conteneur", icon: Package },
];

// ─── helpers ───────────────────────────────────────────────────────────────
function fmt(n, dec = 0) {
  return Number(n || 0).toLocaleString("fr-FR", { maximumFractionDigits: dec });
}

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] || "—";
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

function groupTotal(items) {
  return items.reduce(
    (acc, r) => ({
      bif: acc.bif + Number(r.total_bif || r.convertedPrice || 0),
      usd: acc.usd + Number(r.total_usd || 0),
      rmb: acc.rmb + Number(r.total_rmb || 0),
    }),
    { bif: 0, usd: 0, rmb: 0 },
  );
}

// ─── print CSS ─────────────────────────────────────────────────────────────
const PRINT_CSS = `
@media print {
  @page { margin: 12mm; size: A4 landscape; }
  body * { visibility: hidden; }
  #print-root, #print-root * { visibility: visible; }
  #print-root { position: absolute; left: 0; top: 0; width: 100%; display: block !important; }
  .no-print { display: none !important; }
  body { font-family: Arial, sans-serif; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; page-break-inside: auto; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
  th {
    background-color: #ea580c !important;
    color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    padding: 7px 6px;
    text-align: left;
    font-size: 10px;
  }
  td { padding: 6px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
  tr:nth-child(even) td { background-color: #fff7ed !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .print-section-title {
    font-size: 13px;
    font-weight: bold;
    color: #ea580c !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    margin: 14px 0 4px;
    border-bottom: 2px solid #ea580c;
    padding-bottom: 3px;
  }
  .print-total-row { font-weight: bold; background: #fff7ed !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .print-grand-total {
    text-align: right;
    font-weight: bold;
    font-size: 13px;
    margin-top: 16px;
    padding: 10px;
    border-top: 2px solid #ea580c;
    color: #ea580c !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
#print-root { display: none; }
`;

// ─── Print table for a group of products ───────────────────────────────────
function PrintTable({ rows }) {
  const total = groupTotal(rows);
  return (
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Produit</th>
          <th>Fournisseur</th>
          <th>Conteneur</th>
          <th>Qté</th>
          <th>CBM (m³)</th>
          <th>Prix Unit.</th>
          <th>Dédouanement</th>
          <th>Total BIF</th>
          <th>Total USD</th>
          <th>Total RMB</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.id}>
            <td>{i + 1}</td>
            <td>
              <strong>{r.name}</strong>
            </td>
            <td>{r.supplier_name || "—"}</td>
            <td>
              {r.container_name
                ? `${r.container_name} (${r.container_serial || ""})`
                : "—"}
            </td>
            <td>{r.quantity}</td>
            <td>{r.cbm > 0 ? r.cbm : "—"}</td>
            <td>
              {r.price} {r.currency}
            </td>
            <td>
              {r.customs_price > 0
                ? `${r.customs_price} ${r.customs_price_currency || ""}`
                : "—"}
            </td>
            <td>{fmt(r.total_bif || r.convertedPrice)}</td>
            <td>{fmt(r.total_usd, 2)}</td>
            <td>{fmt(r.total_rmb, 2)}</td>
            <td>{r.date || "—"}</td>
          </tr>
        ))}
        <tr className="print-total-row">
          <td colSpan={8} style={{ textAlign: "right" }}>
            SOUS-TOTAL
          </td>
          <td>{fmt(total.bif)}</td>
          <td>{fmt(total.usd, 2)}</td>
          <td>{fmt(total.rmb, 2)}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  );
}

// ─── Card for a product (screen) ───────────────────────────────────────────
function ProductCard({ report, index }) {
  return (
    <div className="flex items-start gap-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="bg-orange-50 text-orange-600 font-bold rounded-xl w-8 h-8 flex items-center justify-center text-xs shrink-0">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm leading-snug">
          {report.name}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {report.supplier_name && (
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <User className="w-2.5 h-2.5" />
              {report.supplier_name}
            </span>
          )}
          {report.container_name && (
            <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Package className="w-2.5 h-2.5" />
              {report.container_name}
            </span>
          )}
          {report.date && (
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <CalendarDays className="w-2.5 h-2.5" />
              {report.date}
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold">
              Prix
            </p>
            <p className="text-sm font-black text-gray-900">
              {report.price}{" "}
              <span className="text-orange-600">{report.currency}</span>
            </p>
          </div>
          {report.total_bif > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">
                BIF
              </p>
              <p className="text-sm font-bold text-orange-600">
                {fmt(report.total_bif)}
              </p>
            </div>
          )}
          {report.total_usd > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">
                USD
              </p>
              <p className="text-sm font-bold text-green-600">
                {fmt(report.total_usd, 2)}
              </p>
            </div>
          )}
          {report.total_rmb > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">
                RMB
              </p>
              <p className="text-sm font-bold text-red-500">
                {fmt(report.total_rmb, 2)}
              </p>
            </div>
          )}
          {report.customs_price > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">
                Dédouanement
              </p>
              <p className="text-sm font-bold text-gray-600">
                {report.customs_price} {report.customs_price_currency}
              </p>
            </div>
          )}
          {report.cbm > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">
                CBM
              </p>
              <p className="text-sm font-bold text-purple-600">
                {report.cbm} m³
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[10px] text-gray-400 uppercase font-bold">Qté</p>
        <p className="text-lg font-black text-gray-900">{report.quantity}</p>
      </div>
    </div>
  );
}

// ─── Collapsible group section (screen) ────────────────────────────────────
function GroupSection({ title, icon: Icon, items, color = "orange" }) {
  const [open, setOpen] = useState(true);
  const total = groupTotal(items);
  const colorMap = {
    orange: "bg-orange-600",
    blue: "bg-blue-600",
    purple: "bg-purple-600",
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 mb-2"
      >
        <div className="flex items-center gap-3">
          <div className={`${colorMap[color]} p-2 rounded-xl`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-900 text-sm">{title}</p>
            <p className="text-[10px] text-gray-400">
              {items.length} produit{items.length > 1 ? "s" : ""} ·{" "}
              {fmt(total.bif)} BIF
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {open && (
        <div className="flex flex-col gap-2 pl-2">
          {items.map((r, i) => (
            <ProductCard key={r.id} report={r} index={i} />
          ))}
          <div className="bg-orange-50 rounded-xl px-4 py-2 flex flex-wrap gap-4 border border-orange-100">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">
                Total BIF
              </p>
              <p className="font-black text-orange-600">{fmt(total.bif)}</p>
            </div>
            {total.usd > 0 && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">
                  Total USD
                </p>
                <p className="font-black text-green-600">{fmt(total.usd, 2)}</p>
              </div>
            )}
            {total.rmb > 0 && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">
                  Total RMB
                </p>
                <p className="font-black text-red-500">{fmt(total.rmb, 2)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export function ReportsScreen() {
  const navigate = useNavigate();

  // Filters
  const [supplierId, setSupplierId] = useState("");
  const [containerId, setContainerId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [mode, setMode] = useState("all");

  const { data: containers } = useGetContainersQuery();
  const {
    data: reports,
    isLoading,
    isFetching,
    refetch,
  } = useGetReportsQuery({
    supplier_id: supplierId,
    container_id: containerId,
    start_date: startDate,
    end_date: endDate,
  });

  const filteredReports = useMemo(() => {
    const list = Array.isArray(reports) ? reports : [];
    if (!searchTerm) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(
      (r) =>
        (r.name?.toLowerCase() || "").includes(term) ||
        (r.description?.toLowerCase() || "").includes(term) ||
        (r.supplier_name?.toLowerCase() || "").includes(term),
    );
  }, [reports, searchTerm]);

  const grandTotal = useMemo(
    () => groupTotal(filteredReports),
    [filteredReports],
  );

  const bySupplier = useMemo(
    () => groupBy(filteredReports, "supplier_name"),
    [filteredReports],
  );
  const byContainer = useMemo(
    () => groupBy(filteredReports, "container_name"),
    [filteredReports],
  );

  const hasActiveFilters =
    supplierId || containerId || startDate || endDate || searchTerm;

  const clearFilters = () => {
    setSupplierId("");
    setContainerId("");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
  };

  // ── Print ────────────────────────────────────────────────────────────────
  const handlePrint = () => window.print();

  // ── Excel export ─────────────────────────────────────────────────────────
  const handleExcelExport = () => {
    const wb = XLSX.utils.book_new();

    const toRow = (r, extra = {}) => ({
      Produit: r.name,
      Fournisseur: r.supplier_name || "—",
      Conteneur: r.container_name
        ? `${r.container_name} (${r.container_serial || ""})`
        : "—",
      Quantité: r.quantity,
      "CBM (m³)": r.cbm || 0,
      "Prix unitaire": r.price,
      Devise: r.currency,
      Dédouanement: r.customs_price || 0,
      "Devise dédouanement": r.customs_price_currency || "",
      "Total BIF": Number(r.total_bif || r.convertedPrice || 0),
      "Total USD": Number(r.total_usd || 0),
      "Total RMB": Number(r.total_rmb || 0),
      "Date achat": r.date || "",
      ...extra,
    });

    if (mode === "all") {
      const ws = XLSX.utils.json_to_sheet(filteredReports.map((r) => toRow(r)));
      XLSX.utils.book_append_sheet(wb, ws, "Tous les produits");
    } else if (mode === "by_supplier") {
      Object.entries(bySupplier).forEach(([name, items]) => {
        const rows = items.map((r) => toRow(r));
        // totals row
        const t = groupTotal(items);
        rows.push({
          Produit: "TOTAL",
          "Total BIF": t.bif,
          "Total USD": t.usd,
          "Total RMB": t.rmb,
        });
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
      });
    } else if (mode === "by_container") {
      Object.entries(byContainer).forEach(([name, items]) => {
        const rows = items.map((r) => toRow(r));
        const t = groupTotal(items);
        rows.push({
          Produit: "TOTAL",
          "Total BIF": t.bif,
          "Total USD": t.usd,
          "Total RMB": t.rmb,
        });
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
      });
    }

    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `rapport-produits-${date}.xlsx`);
  };

  // ── Print title ──────────────────────────────────────────────────────────
  const printTitle =
    mode === "by_supplier"
      ? "RAPPORT PAR FOURNISSEUR"
      : mode === "by_container"
        ? "RAPPORT PAR CONTENEUR"
        : "LISTE DES PRODUITS ACHETÉS";

  // ── Print groups helper ──────────────────────────────────────────────────
  const printGroups =
    mode === "by_supplier"
      ? Object.entries(bySupplier)
      : mode === "by_container"
        ? Object.entries(byContainer)
        : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <style>{PRINT_CSS}</style>

      {/* ══ PRINTABLE AREA (hidden on screen) ══════════════════════════════ */}
      <div id="print-root" className="p-8 bg-white">
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 24,
            paddingBottom: 12,
            borderBottom: "2px solid #ea580c",
          }}
        >
          <h1 style={{ color: "#ea580c", fontSize: 22, margin: 0 }}>
            CLSKY MOBILE INVENTORY
          </h1>
          <h2 style={{ fontSize: 16, margin: "4px 0 0" }}>{printTitle}</h2>
          <p style={{ color: "#6b7280", fontSize: 11, margin: "4px 0 0" }}>
            Généré le {new Date().toLocaleDateString("fr-FR")} à{" "}
            {new Date().toLocaleTimeString("fr-FR")}
          </p>
        </div>

        {/* Applied filters summary */}
        <div
          style={{
            fontSize: 10,
            color: "#6b7280",
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            {supplierId && <span>Fournisseur · </span>}
            {containerId && <span>Conteneur · </span>}
            {startDate && (
              <span>
                Période : {startDate} → {endDate || "aujourd'hui"} ·{" "}
              </span>
            )}
            <span>{filteredReports.length} produit(s)</span>
          </div>
        </div>

        {/* Tables */}
        {printGroups ? (
          printGroups.map(([groupName, items]) => (
            <div key={groupName}>
              <div className="print-section-title">{groupName}</div>
              <PrintTable rows={items} />
            </div>
          ))
        ) : (
          <PrintTable rows={filteredReports} />
        )}

        {/* Grand total */}
        <div className="print-grand-total">
          TOTAL GÉNÉRAL — BIF : {fmt(grandTotal.bif)}
          {grandTotal.usd > 0 && ` | USD : ${fmt(grandTotal.usd, 2)}`}
          {grandTotal.rmb > 0 && ` | RMB : ${fmt(grandTotal.rmb, 2)}`}
        </div>
      </div>

      {/* ══ HEADER (screen only) ══════════════════════════════════════════ */}
      <div className="no-print bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 active:bg-gray-100 rounded-xl"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Rapports</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className={`p-2 rounded-xl transition-colors bg-gray-100 text-gray-600 active:scale-95 ${isFetching ? "opacity-50" : ""}`}
            title="Actualiser"
          >
            <RefreshCw
              className={`w-5 h-5 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`p-2 rounded-xl transition-colors relative ${showFilters || hasActiveFilters ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-600"}`}
          >
            <Filter className="w-5 h-5" />
            {hasActiveFilters && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-600 rounded-full" />
            )}
          </button>
          <button
            onClick={handleExcelExport}
            className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-medium"
            title="excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-orange-600 text-white px-3 py-2 rounded-xl text-sm font-medium"
          >
            <Printer className="w-4 h-4" />
            print
          </button>
        </div>
      </div>

      {/* ══ MODE TABS ════════════════════════════════════════════════════ */}
      <div className="no-print bg-white border-b border-gray-100 px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap font-medium transition-all ${
              mode === id
                ? "bg-orange-600 text-white shadow"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ══ FILTER PANEL ════════════════════════════════════════════════ */}
      {showFilters && (
        <div className="no-print bg-white border-b border-gray-100 px-4 py-4 space-y-3 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Filtres</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-orange-600 font-medium"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Supplier */}
          <SupplierSelect value={supplierId} setSupplierId={setSupplierId} />

          {/* Container */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Conteneur
            </label>
            <select
              value={containerId}
              onChange={(e) => setContainerId(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
            >
              <option value="">Tous les conteneurs</option>
              {(containers || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.serial_number})
                </option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Du
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Au
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ══ STATS BAR ════════════════════════════════════════════════════ */}
      <div className="no-print bg-white border-b border-gray-100 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {filteredReports.length} produit
          {filteredReports.length !== 1 ? "s" : ""}
          {isFetching && (
            <span className="ml-2 text-orange-500 animate-pulse">
              • chargement
            </span>
          )}
        </span>
        <div className="flex gap-3 text-xs font-bold">
          {grandTotal.bif > 0 && (
            <span className="text-orange-600">{fmt(grandTotal.bif)} BIF</span>
          )}
          {grandTotal.usd > 0 && (
            <span className="text-green-600">{fmt(grandTotal.usd, 2)} USD</span>
          )}
          {grandTotal.rmb > 0 && (
            <span className="text-red-500">{fmt(grandTotal.rmb, 2)} RMB</span>
          )}
        </div>
      </div>

      {/* ══ CONTENT ══════════════════════════════════════════════════════ */}
      <div className="no-print flex-1 overflow-y-auto">
        <PullToRefresh onRefresh={() => refetch()} isRefreshing={isFetching}>
          <div className="p-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
                <p className="text-gray-500 text-sm">Chargement...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">Aucun produit trouvé</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-orange-600 text-sm font-medium border border-orange-200 px-4 py-2 rounded-xl"
                  >
                    Effacer les filtres
                  </button>
                )}
              </div>
            ) : mode === "all" ? (
              <div className="flex flex-col gap-2">
                {filteredReports.map((r, i) => (
                  <ProductCard key={r.id} report={r} index={i} />
                ))}
              </div>
            ) : mode === "by_supplier" ? (
              Object.entries(bySupplier).map(([name, items]) => (
                <GroupSection
                  key={name}
                  title={name}
                  icon={User}
                  items={items}
                  color="blue"
                />
              ))
            ) : (
              Object.entries(byContainer).map(([name, items]) => (
                <GroupSection
                  key={name}
                  title={name}
                  icon={Package}
                  items={items}
                  color="purple"
                />
              ))
            )}
          </div>
        </PullToRefresh>
      </div>
    </div>
  );
}
