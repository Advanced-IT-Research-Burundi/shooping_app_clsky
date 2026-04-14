import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { 
  ChevronLeft, 
  Download, 
  CalendarDays, 
  Tag, 
  FileText, 
  Filter, 
  Search, 
  X,
  Package,
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  useGetSuppliersQuery, 
  useGetContainersQuery, 
  useGetReportsQuery 
} from "../features/auth/apiSlicer";
import { SupplierSelect } from "./SupplierSelect";

export function ReportsScreen() {
  const navigate = useNavigate();
  
  // Filter State
  const [supplierId, setSupplierId] = useState("");
  const [containerId, setContainerId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Data Fetching
  const { data: containers } = useGetContainersQuery();
  const { data: reports, isLoading, isFetching } = useGetReportsQuery({
    supplier_id: supplierId,
    container_id: containerId,
    start_date: startDate,
    end_date: endDate
  });

  // Local filtering for search term
  const filteredReports = useMemo(() => {
    // reports will be an array because of transformResponse in apiSlicer
    const reportList = Array.isArray(reports) ? reports : [];
    if (!searchTerm) return reportList;
    
    const term = searchTerm.toLowerCase();
    return reportList.filter(r => 
      (r.name?.toLowerCase() || "").includes(term) ||
      (r.description?.toLowerCase() || "").includes(term)
    );
  }, [reports, searchTerm]);

  const totalBIF = useMemo(() => {
    return filteredReports.reduce((acc, curr) => {
      const price = parseFloat(curr.convertedPrice || 0);
      return acc + (isNaN(price) ? 0 : price);
    }, 0);
  }, [filteredReports]);

  const handlePrint = () => {
    window.print();
  };

  const clearFilters = () => {
    setSupplierId("");
    setContainerId("");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
  };

  const hasActiveFilters = supplierId || containerId || startDate || endDate || searchTerm;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <style>
        {`
          @media print {
            @page {
              margin: 15mm;
              size: A4;
            }
            body > *:not(.print-container) {
              display: none !important;
            }
            .print-container {
              display: block !important;
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white;
            }
            .no-print {
              display: none !important;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background-color: #f97316 !important;
              color: white !important;
              -webkit-print-color-adjust: exact;
              padding: 10px;
              text-align: left;
              font-size: 12px;
            }
            td {
              padding: 8px;
              border-bottom: 1px solid #eee;
              font-size: 11px;
            }
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 10px;
              border-bottom: 2px solid #f97316;
            }
            .print-header h1 {
              color: #f97316 !important;
              margin: 0;
              font-size: 24px;
            }
            .print-total {
              text-align: right;
              font-weight: bold;
              font-size: 14px;
              margin-top: 20px;
              padding: 10px;
              background: #fff7ed !important;
              -webkit-print-color-adjust: exact;
            }
          }
          .print-container {
            display: none;
          }
        `}
      </style>

      {/* Printable Area (Hidden on screen) */}
      <div className="print-container p-8">
        <div className="print-header text-center">
            <h1>RAPPORT D'INVENTAIRE</h1>
            <p className="text-gray-500 text-sm">Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
        </div>

        <div className="mb-6 flex justify-between items-end">
            <div className="text-xs text-gray-500">
                {supplierId && <div>Fournisseur: <strong>{reports?.find(r => r.supplier_id == supplierId)?.supplier_name}</strong></div>}
                {containerId && <div>Conteneur ID: <strong>{containerId}</strong></div>}
                {startDate && <div>Période: <strong>Du {startDate} au {endDate || 'aujourd\'hui'}</strong></div>}
            </div>
            <div className="text-xs text-right text-gray-400">
                Clsky Mobile Inventory
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Produit</th>
                    <th>Fournisseur</th>
                    <th>Catégorie</th>
                    <th>Quantité</th>
                    <th>CBM (m³)</th>
                    <th>Prix Unit.</th>
                    <th>Dédouanement</th>
                    <th>Total (BIF)</th>
                </tr>
            </thead>
            <tbody>
                {filteredReports.map(report => (
                    <tr key={report.id}>
                        <td>{report.name}</td>
                        <td>{report.supplier_name || '-'}</td>
                        <td>{report.category}</td>
                        <td>{report.quantity}</td>
                        <td>{report.cbm || '-'}</td>
                        <td>{report.price} {report.currency}</td>
                        <td>{report.customs_price || 0} {report.customs_price_currency || report.currency}</td>
                        <td className="font-bold">{report.convertedPrice?.toLocaleString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        <div className="print-total">
            VALEUR TOTALE: {totalBIF.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} BIF
        </div>
      </div>

      {/* Header (Screen only) */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 no-print">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 active:bg-gray-100 rounded-xl transition"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Rapports</h1>
        </div>
        
        <div className="flex items-center gap-2">
           <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl transition-colors ${showFilters ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}
          >
            <Filter className="w-5 h-5" />
          </button>
          <Button
            onClick={handlePrint}
            className="bg-orange-600 hover:bg-orange-700 text-white h-10 px-4 rounded-xl shadow-sm flex items-center gap-2 text-sm"
          >
            <FileText className="w-4 h-4" />
            Imprimer
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-100 p-6 space-y-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-sm">Filtres actifs</h3>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="text-xs text-orange-600 font-medium hover:underline"
              >
                Réinitialiser
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
             {/* Search */}
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Supplier */}
            <SupplierSelect 
              value={supplierId}
              onChange={(id) => setSupplierId(id)}
            />

            {/* Container */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 ml-1">Conteneur</label>
              <select
                value={containerId}
                onChange={(e) => setContainerId(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
              >
                <option value="">Tous les conteneurs</option>
                {containers?.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.serial_number})</option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 ml-1">Du</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 ml-1">Au</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-sm text-gray-500">
            {filteredReports.length} produit{filteredReports.length !== 1 ? 's' : ''} trouvé{filteredReports.length !== 1 ? 's' : ''}
          </span>
          {(isLoading || isFetching) && <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
            <p className="text-gray-500 text-sm">Chargement des données...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucun résultat</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              Nous n'avons trouvé aucun produit correspondant à vos filtres actuels.
            </p>
            {hasActiveFilters && (
              <Button 
                onClick={clearFilters}
                variant="outline"
                className="mt-6 border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                Effacer les filtres
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-4 transition-all active:scale-[0.98] hover:border-orange-200"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-base leading-tight mb-1">
                        {report.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{report.category}</span>
                        {report.supplier_name && (
                          <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                            <User className="w-2.5 h-2.5" />
                            {report.supplier_name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-2.5 h-2.5" />
                          {report.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between border-t border-gray-50 pt-3 mt-1">
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Prix Unitaire</div>
                      <div className="text-lg font-black text-gray-900">
                        {report.price} <span className="text-orange-600 font-bold text-sm ml-0.5">{report.currency}</span>
                      </div>
                      {report.customs_price > 0 && (
                        <div className="text-[10px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                          Dédouanement: {report.customs_price} {report.customs_price_currency || report.currency}
                        </div>
                      )}
                      {report.cbm > 0 && (
                        <div className="text-[10px] text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded mt-1 inline-block ml-2">
                          Vol: {report.cbm} m³
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                       <div className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Valeur BIF</div>
                      <div className="text-lg font-black text-orange-600">
                        {report.convertedPrice?.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold">Total Estimé</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* CSV Export Button Fixed at bottom (optional, as CSV was there before) */}
      <div className="p-4 bg-white border-t border-gray-200 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <Button
            onClick={() => window.open(`${import.meta.env.VITE_APP_URL || ''}/products/report/export`, "_blank")}
            variant="outline"
            className="w-full border-gray-200 text-gray-600 h-12 rounded-2xl flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter en CSV
          </Button>
      </div>
    </div>
  );
}

