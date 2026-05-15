import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  MapPin,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Filter,
  LocateFixed,
  Lightbulb,
} from "lucide-react";
import { motion } from "motion/react";
import { RiskMap, type RiskMapPoint } from "../components/RiskMap";
import {
  evaluacionService,
  type DashboardResumen,
  type EvaluacionResponse,
  type EvaluacionListItem,
} from "../services/evaluacion";

const EMPTY_DASHBOARD: DashboardResumen = {
  total_zonas: 0,
  riesgo_bajo: 0,
  riesgo_medio: 0,
  riesgo_alto: 0,
  promedio_puntaje: 0,
  factor_mas_frecuente: null,
  distribucion_riesgo: [],
  evaluaciones_recientes: [],
};

export function Dashboard() {
  const [summary, setSummary] = useState<DashboardResumen>(EMPTY_DASHBOARD);
  const [evaluations, setEvaluations] = useState<EvaluacionListItem[]>([]);
  const [selectedMapPoint, setSelectedMapPoint] = useState<RiskMapPoint | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluacionResponse | null>(null);
  const [selectedLoadingId, setSelectedLoadingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    const filters = {
      pais: selectedCountry || undefined,
      page: currentPage,
      limit: pageSize,
    };

    Promise.all([
      evaluacionService.dashboard({ pais: filters.pais }),
      evaluacionService.history(filters),
    ])
      .then(([dashboardData, historyData]) => {
        setSummary(dashboardData);
        setEvaluations(historyData.items);
        setPagination({
          total: historyData.total,
          totalPages: Math.max(historyData.totalPages, 1),
        });
      })
      .catch((error) => {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo cargar el dashboard.";
        setErrorMessage(message);
      });
  }, [selectedCountry, currentPage, pageSize]);

  const latestEvaluation = useMemo(
    () =>
      [...evaluations]
        .reverse()
        .find((item) => item.latitud && item.longitud) ?? evaluations[0],
    [evaluations]
  );

  const activeMapPoint = selectedMapPoint ?? latestEvaluation;
  const mapPoints = selectedMapPoint
    ? [...evaluations, selectedMapPoint]
    : evaluations;

  const riskData = [
    { name: "Bajo", value: summary.riesgo_bajo, color: "var(--eco-green)" },
    { name: "Medio", value: summary.riesgo_medio, color: "var(--eco-yellow)" },
    { name: "Alto", value: summary.riesgo_alto, color: "var(--eco-red)" },
  ];

  const factorsData = summary.factor_mas_frecuente
    ? [
        {
          name: summary.factor_mas_frecuente.factor,
          value: summary.factor_mas_frecuente.total,
        },
      ]
    : [];

  const countries = useMemo(() => ["Ecuador"], []);

  const kpiCards = [
    {
      title: "Zonas Evaluadas",
      value: summary.total_zonas,
      icon: MapPin,
      color: "text-eco-blue",
      bgColor: "bg-eco-blue-light",
    },
    {
      title: "Riesgo Alto",
      value: summary.riesgo_alto,
      icon: AlertTriangle,
      color: "text-eco-red",
      bgColor: "bg-eco-red-light",
    },
    {
      title: "Riesgo Medio",
      value: summary.riesgo_medio,
      icon: AlertCircle,
      color: "text-eco-yellow",
      bgColor: "bg-eco-yellow-light",
    },
    {
      title: "Riesgo Bajo",
      value: summary.riesgo_bajo,
      icon: CheckCircle2,
      color: "text-eco-green",
      bgColor: "bg-eco-green-light",
    },
  ];

  const handleShowOnMap = async (item: EvaluacionListItem) => {
    setSelectedLoadingId(item.id);
    setErrorMessage("");

    try {
      const evaluation = await evaluacionService.getById(item.id);

      setSelectedMapPoint(evaluation);
      setSelectedEvaluation(evaluation);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo cargar la ubicacion de la evaluacion.";
      setErrorMessage(message);
    } finally {
      setSelectedLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2">Dashboard Ambiental</h1>
          <p className="text-muted-foreground text-lg">
            Analisis completo de evaluaciones de riesgo ambiental
          </p>
        </motion.div>

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-eco-red/30 bg-eco-red-light px-4 py-3 text-eco-red">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className={`${kpi.bgColor} p-3 rounded-xl inline-block mb-3`}>
                      <Icon className={`size-6 ${kpi.color}`} />
                    </div>
                    <div className="text-3xl font-bold mb-1">{kpi.value}</div>
                    <div className="text-sm text-muted-foreground">{kpi.title}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Card className="mb-8">
          <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-end md:justify-between">
            <div className="grid gap-2 md:w-80">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Filter className="size-4 text-eco-green" />
                Filtrar por pais
              </label>
              <select
                value={selectedCountry}
                onChange={(event) => {
                  setSelectedCountry(event.target.value);
                  setCurrentPage(1);
                  setSelectedMapPoint(null);
                  setSelectedEvaluation(null);
                }}
                className="h-11 rounded-lg border border-border bg-input-background px-3 focus:outline-none focus:ring-2 focus:ring-eco-green"
              >
                <option value="">Todos los paises</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2 md:w-48">
              <label className="text-sm font-medium">Datos por pagina</label>
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setCurrentPage(1);
                }}
                className="h-11 rounded-lg border border-border bg-input-background px-3 focus:outline-none focus:ring-2 focus:ring-eco-green"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5 text-eco-green" />
                Distribucion por Nivel de Riesgo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={riskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="size-5 text-eco-yellow" />
                Factor Ambiental Mas Frecuente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={factorsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value})`}
                    outerRadius={80}
                    fill="var(--eco-blue)"
                    dataKey="value"
                  >
                    {factorsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 80 + 155}, 70%, 42%)`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5 text-eco-blue" />
              Mapa de Zonas Evaluadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border border-border bg-muted">
              <RiskMap
                barrio={activeMapPoint?.ciudad_nombre ?? ""}
                latitude={activeMapPoint?.latitud ? String(activeMapPoint.latitud) : ""}
                longitude={activeMapPoint?.longitud ? String(activeMapPoint.longitud) : ""}
                points={mapPoints}
                readOnly
                showSelectedMarker={Boolean(activeMapPoint?.latitud && activeMapPoint?.longitud)}
              />
              <div className="flex flex-wrap gap-4 justify-center border-t border-border bg-white p-4">
                <LegendItem label="Riesgo Bajo" color="var(--eco-green)" />
                <LegendItem label="Riesgo Medio" color="var(--eco-yellow)" />
                <LegendItem label="Riesgo Alto" color="var(--eco-red)" />
              </div>
            </div>

            {selectedEvaluation && (
              <div className="mt-6 rounded-xl border border-border bg-white p-5">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="flex items-center gap-2">
                      <Lightbulb className="size-5 text-eco-yellow" />
                      Recomendaciones para {selectedEvaluation.zona}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedEvaluation.ciudad_nombre ?? activeMapPoint?.ciudad_nombre} · Puntaje {selectedEvaluation.puntaje}
                    </p>
                  </div>
                  <Badge variant={getBadgeVariant(selectedEvaluation.nivel_riesgo)}>
                    {capitalize(selectedEvaluation.nivel_riesgo)}
                  </Badge>
                </div>

                {selectedEvaluation.recomendaciones.length > 0 ? (
                  <ul className="space-y-3">
                    {selectedEvaluation.recomendaciones.map((recommendation) => (
                      <li key={recommendation} className="flex gap-3">
                        <CheckCircle2 className="mt-0.5 size-5 flex-shrink-0 text-eco-green" />
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">
                    Esta evaluacion no tiene recomendaciones registradas.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5 text-eco-green" />
              Historial de Evaluaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {evaluations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay evaluaciones registradas. Comienza evaluando una zona.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">Zona</th>
                      <th className="text-left py-3 px-4">Ciudad</th>
                      <th className="text-left py-3 px-4">Puntaje</th>
                      <th className="text-left py-3 px-4">Nivel de Riesgo</th>
                      <th className="text-left py-3 px-4">Fecha</th>
                      <th className="text-left py-3 px-4">Mapa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.map((item) => (
                      <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">{item.zona}</td>
                        <td className="py-3 px-4">{item.ciudad_nombre}</td>
                        <td className="py-3 px-4 font-semibold">{item.puntaje}</td>
                        <td className="py-3 px-4">
                          <Badge variant={getBadgeVariant(item.nivel_riesgo)}>
                            {capitalize(item.nivel_riesgo)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(item.fecha_registro).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleShowOnMap(item)}
                            disabled={selectedLoadingId === item.id}
                            className="whitespace-nowrap"
                          >
                            <LocateFixed className="size-4" />
                            {selectedLoadingId === item.id ? "Cargando" : "Ver"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pagination.total > 0 && (
              <div className="mt-6 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando pagina {currentPage} de {pagination.totalPages} ({pagination.total} registros)
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={currentPage >= pagination.totalPages}
                    onClick={() =>
                      setCurrentPage((page) => Math.min(page + 1, pagination.totalPages))
                    }
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LegendItem({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="size-4 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

function getBadgeVariant(level: string) {
  if (level === "bajo") return "success";
  if (level === "medio") return "warning";
  return "danger";
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
