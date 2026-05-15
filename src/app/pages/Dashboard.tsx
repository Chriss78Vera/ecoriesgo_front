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
  Check,
  ChevronsUpDown,
  Filter,
  LocateFixed,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import { motion } from "motion/react";
import { RiskMap, type RiskMapPoint } from "../components/RiskMap";
import {
  evaluacionService,
  ubicacionService,
  type Ciudad,
  type DashboardResumen,
  type EvaluacionResponse,
  type EvaluacionListItem,
  type Provincia,
} from "../services/evaluacion";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { cn } from "../components/ui/utils";

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
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [selectedProvinciaId, setSelectedProvinciaId] = useState("");
  const [selectedCiudadId, setSelectedCiudadId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    const filters = {
      provinciaId: selectedProvinciaId || undefined,
      ciudadId: selectedCiudadId || undefined,
      page: currentPage,
      limit: pageSize,
    };

    Promise.all([
      evaluacionService.dashboard({
        provinciaId: filters.provinciaId,
        ciudadId: filters.ciudadId,
      }),
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
  }, [selectedProvinciaId, selectedCiudadId, currentPage, pageSize]);

  useEffect(() => {
    ubicacionService
      .provincias()
      .then(setProvincias)
      .catch(() => setErrorMessage("No se pudieron cargar las provincias."));
  }, []);

  useEffect(() => {
    if (!selectedProvinciaId) {
      setCiudades([]);
      setSelectedCiudadId("");
      return;
    }

    ubicacionService
      .ciudades(Number(selectedProvinciaId))
      .then((data) => {
        setCiudades(data);
        setSelectedCiudadId((current) =>
          data.some((city) => String(city.id) === current) ? current : ""
        );
      })
      .catch(() => setErrorMessage("No se pudieron cargar las ciudades."));
  }, [selectedProvinciaId]);

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
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5 text-eco-green" />
                Historial de Evaluaciones
              </CardTitle>
              <div className="rounded-full border border-eco-green/30 bg-eco-green-light px-4 py-2 text-sm font-medium text-eco-green">
                {pagination.total} registros
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 rounded-xl border border-border bg-muted/30 p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Filter className="size-4 text-eco-green" />
                Filtros del historial
              </div>
              <div className="grid gap-3 md:grid-cols-[minmax(0,280px)_minmax(0,280px)_140px_auto] md:items-end md:justify-start">
                <SearchableFilterSelect
                  label="Provincia"
                  value={selectedProvinciaId}
                  onChange={(value) => {
                    setSelectedProvinciaId(value);
                    setSelectedCiudadId("");
                    setCurrentPage(1);
                    setSelectedMapPoint(null);
                    setSelectedEvaluation(null);
                  }}
                  options={provincias.map((provincia) => ({
                    value: String(provincia.id),
                    label: provincia.nombre,
                  }))}
                  placeholder="Todas las provincias"
                  searchPlaceholder="Buscar provincia..."
                  emptyMessage="No se encontraron provincias."
                />
                <SearchableFilterSelect
                  label="Ciudad"
                  value={selectedCiudadId}
                  onChange={(value) => {
                    setSelectedCiudadId(value);
                    setCurrentPage(1);
                    setSelectedMapPoint(null);
                    setSelectedEvaluation(null);
                  }}
                  options={ciudades.map((ciudad) => ({
                    value: String(ciudad.id),
                    label: ciudad.nombre,
                  }))}
                  placeholder="Todas las ciudades"
                  searchPlaceholder="Buscar ciudad..."
                  emptyMessage="No se encontraron ciudades."
                  disabled={!selectedProvinciaId}
                />
                <FilterSelect
                  label="Por pagina"
                  value={String(pageSize)}
                  onChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}
                  options={[5, 10, 20, 50].map((size) => ({
                    value: String(size),
                    label: `${size} datos`,
                  }))}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedProvinciaId("");
                    setSelectedCiudadId("");
                    setCurrentPage(1);
                    setSelectedMapPoint(null);
                    setSelectedEvaluation(null);
                  }}
                  className="h-11 border-eco-green/40 text-eco-green hover:bg-eco-green-light"
                >
                  <RotateCcw className="size-4" />
                  Limpiar
                </Button>
              </div>
            </div>

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
              <div className="mt-6 flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Mostrando pagina {currentPage} de {pagination.totalPages} ({pagination.total} registros)
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                    className="min-w-28 border-eco-green/40 text-eco-green hover:bg-eco-green-light disabled:opacity-50"
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
                    className="min-w-28 border-eco-green/40 text-eco-green hover:bg-eco-green-light disabled:opacity-50"
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

function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-border bg-white px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-eco-green focus:ring-2 focus:ring-eco-green/20 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SearchableFilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="grid gap-2 text-sm font-medium">
      <span>{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 text-left text-sm font-normal text-foreground shadow-sm outline-none transition hover:border-eco-green/50 focus:border-eco-green focus:ring-2 focus:ring-eco-green/20 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            <span className={cn("min-w-0 truncate", !selectedOption && "text-muted-foreground")}>
              {selectedOption?.label ?? placeholder}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList className="max-h-48">
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value={placeholder}
                  keywords={["todos", "todas", "limpiar"]}
                  onSelect={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="min-h-9"
                >
                  <Check className={cn("size-4", value === "" ? "opacity-100" : "opacity-0")} />
                  <span className="truncate">{placeholder}</span>
                </CommandItem>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    keywords={[option.value]}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className="min-h-9"
                  >
                    <Check
                      className={cn(
                        "size-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
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
