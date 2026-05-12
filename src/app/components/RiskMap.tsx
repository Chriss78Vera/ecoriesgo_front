import { Fragment, useEffect, useMemo } from "react";
import L from "leaflet";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

type RiskLevel = "bajo" | "medio" | "alto";

export interface RiskMapPoint {
  id?: string | number;
  latitude?: string | number;
  longitude?: string | number;
  latitud?: string | number;
  longitud?: string | number;
  lat?: string | number;
  lng?: string | number;
  riskLevel?: string;
  nivel_riesgo?: string;
  nivelRiesgo?: string;
  riesgo?: string;
  level?: string;
  zoneName?: string;
  zona?: string;
  nombreZona?: string;
  barrio?: string;
  ciudad_nombre?: string;
  provincia_nombre?: string;
}

interface RiskMapProps {
  latitude: string;
  longitude: string;
  barrio: string;
  points?: RiskMapPoint[];
  onChange?: (position: { latitude: string; longitude: string }) => void;
  readOnly?: boolean;
  showSelectedMarker?: boolean;
  showDetails?: boolean;
}

const DEFAULT_POSITION: [number, number] = [4.711, -74.0721];
const RISK_AREA_RADIUS_METERS = 420;

function toNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function normalizePoint(point: RiskMapPoint) {
  const lat = toNumber(point.latitude ?? point.latitud ?? point.lat);
  const lng = toNumber(point.longitude ?? point.longitud ?? point.lng);

  if (lat === null || lng === null) {
    return null;
  }

  return {
    ...point,
    lat,
    lng,
    riskLevel: normalizeRisk(
      point.riskLevel ??
        point.nivel_riesgo ??
        point.nivelRiesgo ??
        point.riesgo ??
        point.level
    ),
  };
}

function normalizeRisk(value: unknown): RiskLevel {
  const risk = String(value ?? "").toLowerCase();

  if (risk.includes("alto") || risk.includes("red") || risk.includes("rojo")) {
    return "alto";
  }

  if (risk.includes("medio") || risk.includes("amarillo") || risk.includes("yellow")) {
    return "medio";
  }

  return "bajo";
}

function getRiskColor(level: RiskLevel) {
  if (level === "alto") return "#ef4444";
  if (level === "medio") return "#fbbf24";
  return "#10b981";
}

function createLocationIcon() {
  return L.divIcon({
    className: "risk-map-location-icon",
    html: '<span></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function formatCoordinate(value: number) {
  return value.toFixed(6);
}

function MapPositionSync({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true });
  }, [map, position]);

  return null;
}

function LocationEvents({
  onChange,
}: {
  onChange: NonNullable<RiskMapProps["onChange"]>;
}) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: formatCoordinate(event.latlng.lat),
        longitude: formatCoordinate(event.latlng.lng),
      });
    },
  });

  return null;
}

export function RiskMap({
  latitude,
  longitude,
  barrio,
  points = [],
  onChange,
  readOnly = false,
  showSelectedMarker = true,
  showDetails = true,
}: RiskMapProps) {
  const selectedPosition = useMemo<[number, number]>(() => {
    const lat = toNumber(latitude);
    const lng = toNumber(longitude);

    if (lat !== null && lng !== null) {
      return [lat, lng];
    }

    return DEFAULT_POSITION;
  }, [latitude, longitude]);

  const locationIcon = useMemo(() => createLocationIcon(), []);
  const normalizedPoints = useMemo(
    () => points.map(normalizePoint).filter(Boolean),
    [points]
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <MapContainer
        center={selectedPosition}
        zoom={14}
        scrollWheelZoom
        className="h-[28rem] w-full md:h-[32rem]"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapPositionSync position={selectedPosition} />
        {!readOnly && onChange && <LocationEvents onChange={onChange} />}
        {showSelectedMarker && (
          <Marker
            position={selectedPosition}
            icon={locationIcon}
            draggable={!readOnly}
            eventHandlers={{
              dragend(event) {
                if (!onChange) return;

                const marker = event.target;
                const nextPosition = marker.getLatLng();
                onChange({
                  latitude: formatCoordinate(nextPosition.lat),
                  longitude: formatCoordinate(nextPosition.lng),
                });
              },
            }}
          >
            <Popup>
              {barrio || "Ubicación seleccionada"}
              {showDetails && (
                <>
                  <br />
                  {latitude || formatCoordinate(selectedPosition[0])}, {longitude || formatCoordinate(selectedPosition[1])}
                </>
              )}
            </Popup>
          </Marker>
        )}

        {normalizedPoints.map((point, index) => {
          const color = getRiskColor(point.riskLevel);

          return (
            <Fragment key={point.id ?? `${point.lat}-${point.lng}-${index}`}>
              <Circle
                center={[point.lat, point.lng]}
                radius={RISK_AREA_RADIUS_METERS}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.18,
                  opacity: 0.55,
                  weight: 2,
                }}
              />
              <CircleMarker
                center={[point.lat, point.lng]}
                radius={9}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.85,
                  weight: 2,
                }}
              >
                <Popup>
                  {point.zoneName ?? point.zona ?? point.nombreZona ?? "Zona evaluada"}
                  <br />
                  Riesgo: {point.riskLevel}
                  {(point.barrio || point.ciudad_nombre) && (
                    <>
                      <br />
                      Ciudad: {point.barrio ?? point.ciudad_nombre}
                    </>
                  )}
                </Popup>
              </CircleMarker>
            </Fragment>
          );
        })}
      </MapContainer>

      {showDetails && (
        <div className="grid gap-2 border-t border-border bg-white p-4 text-sm text-muted-foreground sm:grid-cols-3">
          <span>Barrio: {barrio || "Sin definir"}</span>
        </div>
      )}
    </div>
  );
}
