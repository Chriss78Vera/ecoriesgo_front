import http from "../config/axios";

export type RiskLevel = "bajo" | "medio" | "alto";
export type Vegetacion = "alta" | "media" | "baja";
export type Pendiente = "baja" | "media" | "alta";
export type Frecuencia = "nunca" | "a_veces" | "frecuente";

export interface Provincia {
  id: number;
  codigo: string;
  nombre: string;
  latitud: string;
  longitud: string;
  created_at?: string;
}

export interface Ciudad {
  id: number;
  provincia_id: number;
  codigo: string;
  nombre: string;
  latitud: string;
  longitud: string;
  created_at?: string;
}

export interface CatalogoUbicacion {
  provincia_id: number;
  provincia_codigo: string;
  provincia_nombre: string;
  provincia_latitud: string;
  provincia_longitud: string;
  ciudad_id: number;
  ciudad_codigo: string;
  ciudad_nombre: string;
  ciudad_latitud: string;
  ciudad_longitud: string;
}

export interface EvaluacionPayload {
  provincia_id: number;
  ciudad_id: number;
  zona: string;
  descripcion: string;
  latitud: number;
  longitud: number;
  vegetacion: Vegetacion;
  basura: boolean;
  cerca_rio: boolean;
  tala: boolean;
  pendiente: Pendiente;
  inundaciones: Frecuencia;
  deslizamientos: Frecuencia;
}

export interface EvaluacionResponse extends EvaluacionPayload {
  id: number;
  puntaje: number;
  nivel_riesgo: RiskLevel;
  color_riesgo: "verde" | "amarillo" | "rojo" | string;
  recomendaciones: string[];
  fecha_registro: string;
  provincia_nombre?: string;
  ciudad_nombre?: string;
}

export interface EvaluacionListItem {
  id: number;
  zona: string;
  puntaje: number;
  nivel_riesgo: RiskLevel;
  color_riesgo: string;
  provincia_nombre: string;
  ciudad_nombre: string;
  fecha_registro: string;
  latitud?: string | number;
  longitud?: string | number;
}

export interface EvaluacionHistoryParams {
  provinciaId?: string | number;
  ciudadId?: string | number;
  page?: number;
  limit?: number;
}

export interface EvaluacionHistoryResponse {
  items: EvaluacionListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardResumen {
  total_zonas: number;
  riesgo_bajo: number;
  riesgo_medio: number;
  riesgo_alto: number;
  promedio_puntaje: number;
  factor_mas_frecuente?: {
    factor: string;
    total: number;
  } | null;
  distribucion_riesgo: Array<{
    nivel_riesgo: RiskLevel;
    color_riesgo: string;
    total: number;
  }>;
  evaluaciones_recientes: EvaluacionListItem[];
}

export const ubicacionService = {
  provincias: () => http.get<Provincia[]>("/ubicaciones/provincias"),
  ciudades: (provinciaId?: number) =>
    http.get<Ciudad[]>(
      provinciaId
        ? `/ubicaciones/ciudades?provinciaId=${provinciaId}`
        : "/ubicaciones/ciudades"
    ),
  catalogo: () => http.get<CatalogoUbicacion[]>("/ubicaciones/catalogo"),
};

export const evaluacionService = {
  create: (payload: EvaluacionPayload) =>
    http.post<EvaluacionResponse>("/evaluaciones", payload),
  list: () => http.get<EvaluacionListItem[]>("/evaluaciones"),
  history: (params: EvaluacionHistoryParams = {}) =>
    http.get<EvaluacionHistoryResponse>(
      `/evaluaciones?${new URLSearchParams(
        Object.entries(params)
          .filter(([, value]) => value !== undefined && value !== "")
          .map(([key, value]) => [key, String(value)])
      ).toString()}`
    ),
  getById: (id: string | number) =>
    http.get<EvaluacionResponse>(`/evaluaciones/${id}`),
  dashboard: (params: Pick<EvaluacionHistoryParams, "provinciaId" | "ciudadId"> = {}) =>
    http.get<DashboardResumen>(
      `/evaluaciones/resumen/dashboard?${new URLSearchParams(
        Object.entries(params)
          .filter(([, value]) => value !== undefined && value !== "")
          .map(([key, value]) => [key, String(value)])
      ).toString()}`
    ),
  remove: (id: string | number) =>
    http.delete<void>(`/evaluaciones/${id}`),
};
