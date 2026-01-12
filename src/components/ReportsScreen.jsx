import { useState, useEffect } from "react";
import { apiGet } from "../api/axios";
import { Button } from "./ui/button";
import { ChevronLeft, Download, CalendarDays, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ReportsScreen() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/product_reportss");
      if (res.success) {
        setReports(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 active:bg-gray-100 rounded-xl transition"
        >
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">
          Rapports des Produits
        </h1>
      </div>

      {/* Export Action */}
      <div className="px-6 pt-5">
        <Button
          onClick={() =>
            window.open(
              `${import.meta.env.VITE_API_BASE_URL}/products/report/export`,
              "_blank"
            )
          }
          className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 rounded-2xl shadow-md flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Exporter tous les rapports (CSV)
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Chargement des rapports...
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Aucun rapport disponible.
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="relative bg-white rounded-2xl shadow-sm p-4 transition active:scale-[0.98]"
              >
                {/* Accent bar */}
                <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-orange-500" />

                <div className="pl-3 space-y-2">
                  {/* Title */}
                  <h4 className="font-semibold text-gray-900 truncate">
                    {report.name}
                  </h4>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {report.date}
                    </span>
                    <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                      <Tag className="w-3 h-3" />
                      {report.category}
                    </span>
                  </div>

                  {/* Prices */}
                  <div className="flex justify-between items-end pt-2">
                    <div className="text-orange-600 font-bold text-lg">
                      {report.price} {report.currency}
                    </div>
                    <div className="text-xs text-gray-400 text-right">
                      Total
                      <br />
                      <span className="font-medium text-gray-600">
                        {report.convertedPrice?.toLocaleString()} BIF
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
