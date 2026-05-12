import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  MapPin,
  Trees,
  Trash2,
  Droplets,
  Mountain,
  Navigation as NavigationIcon,
  Calculator,
} from "lucide-react";
import { motion } from "motion/react";
import { Label } from "@radix-ui/react-label";
import { Switch } from "@radix-ui/react-switch";
import {
  evaluacionService,
  ubicacionService,
  type Ciudad,
  type CatalogoUbicacion,
  type EvaluacionPayload,
  type Frecuencia,
  type Pendiente,
  type Provincia,
  type Vegetacion,
} from "../services/evaluacion";
import { RiskMap, type RiskMapPoint } from "../components/RiskMap";

const CITY_MATCH_RADIUS_KM = 35;

interface NormalizedCatalogCity {
  provinciaId: number;
  provincia: string;
  ciudadId: number;
  ciudad: string;
  latitud: string | number;
  longitud: string | number;
}

const DEFAULT_FORM = {
  provinciaId: "",
  ciudadId: "",
  zona: "",
  descripcion: "",
  vegetacion: "media" as Vegetacion,
  basura: false,
  cercaRio: false,
  tala: false,
  pendiente: "media" as Pendiente,
  inundaciones: "nunca" as Frecuencia,
  deslizamientos: "nunca" as Frecuencia,
  latitud: "",
  longitud: "",
};

export function Evaluar() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [riskPoints, setRiskPoints] = useState<RiskMapPoint[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [catalogo, setCatalogo] = useState<CatalogoUbicacion[]>([]);
  const [locationLocked, setLocationLocked] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  const selectedCiudad = useMemo(
    () => ciudades.find((ciudad) => String(ciudad.id) === formData.ciudadId),
    [ciudades, formData.ciudadId]
  );

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      ubicacionService.provincias(),
      evaluacionService.list(),
      ubicacionService.catalogo(),
    ])
      .then(([provinciasData, evaluacionesData, catalogoData]) => {
        if (!isMounted) return;
        setProvincias(provinciasData);
        setRiskPoints(evaluacionesData);
        setCatalogo(catalogoData);
      })
      .catch((error) => {
        console.warn("No se pudo cargar informacion inicial del API.", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!formData.provinciaId) {
      setCiudades([]);
      setFormData((current) => ({ ...current, ciudadId: "" }));
      return;
    }

    let isMounted = true;
    const provinciaId = Number(formData.provinciaId);

    ubicacionService
      .ciudades(provinciaId)
      .then((data) => {
        if (!isMounted) return;
        setCiudades(data);
        setFormData((current) => ({
          ...current,
          ciudadId: data.some((ciudad) => String(ciudad.id) === current.ciudadId)
            ? current.ciudadId
            : "",
        }));
      })
      .catch((error) => {
        console.warn("No se pudieron cargar ciudades.", error);
      });

    return () => {
      isMounted = false;
    };
  }, [formData.provinciaId]);

  useEffect(() => {
    if (!selectedCiudad || formData.latitud || formData.longitud) return;

    setFormData((current) => ({
      ...current,
      latitud: selectedCiudad.latitud,
      longitud: selectedCiudad.longitud,
    }));
  }, [selectedCiudad, formData.latitud, formData.longitud]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const payload: EvaluacionPayload = {
      provincia_id: Number(formData.provinciaId),
      ciudad_id: Number(formData.ciudadId),
      zona: formData.zona,
      descripcion: formData.descripcion,
      latitud: Number(formData.latitud),
      longitud: Number(formData.longitud),
      vegetacion: formData.vegetacion,
      basura: formData.basura,
      cerca_rio: formData.cercaRio,
      tala: formData.tala,
      pendiente: formData.pendiente,
      inundaciones: formData.inundaciones,
      deslizamientos: formData.deslizamientos,
    };

    try {
      const savedEvaluation = await evaluacionService.create(payload);
      localStorage.setItem("lastEvaluation", JSON.stringify(savedEvaluation));
      navigate("/resultado");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo guardar la evaluacion.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage("Tu navegador no permite obtener la ubicacion.");
      return;
    }

    setErrorMessage("");
    setLocationLocked(false);
    setFormData((current) => ({
      ...current,
      provinciaId: "",
      ciudadId: "",
      latitud: "",
      longitud: "",
    }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const match = findNearestCatalogCity(latitude, longitude, catalogo);

        console.group("EcoRiesgo debug ubicacion");
        console.log("Coordenadas del navegador:", {
          latitud: latitude,
          longitud: longitude,
          precisionMetros: position.coords.accuracy,
        });
        console.log("Catalogo cargado para comparar:", {
          total: catalogo.length,
          primerItemCrudo: catalogo[0],
          ciudadesNormalizadas: normalizeCatalogCities(catalogo).slice(0, 5),
        });
        console.log("Ciudad mas cercana encontrada:", match);
        console.log("Radio maximo permitido km:", CITY_MATCH_RADIUS_KM);
        console.log("Decision:", {
          aceptada: Boolean(match && match.distanceKm <= CITY_MATCH_RADIUS_KM),
          distanciaKm: match?.distanceKm,
        });
        console.groupEnd();

        if (!match || match.distanceKm > CITY_MATCH_RADIUS_KM) {
          setErrorMessage(
            "Tu ubicacion actual no coincide con una ciudad registrada. Selecciona provincia y ciudad manualmente."
          );
          return;
        }

        setFormData((current) => ({
          ...current,
          provinciaId: String(match.city.provinciaId),
          ciudadId: String(match.city.ciudadId),
          latitud: latitude.toFixed(6),
          longitud: longitude.toFixed(6),
        }));
        setLocationLocked(true);
      },
      (error) => {
        console.error("Error getting location:", error);
        setErrorMessage("No se pudo obtener la ubicacion. Selecciona provincia y ciudad manualmente.");
      }
    );
  };

  const unlockLocationFields = () => {
    setLocationLocked(false);
    setErrorMessage("");
    setFormData((current) => ({
      ...current,
      provinciaId: "",
      ciudadId: "",
      latitud: "",
      longitud: "",
    }));
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-3">Evaluar Zona Ambiental</h1>
          <p className="text-muted-foreground text-lg">
            Completa el formulario y el backend calculara el riesgo ambiental.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-5 text-eco-green" />
                Informacion de la Zona
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Provincia</label>
                  <select
                    required
                    value={formData.provinciaId}
                    disabled={locationLocked}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        provinciaId: e.target.value,
                        latitud: "",
                        longitud: "",
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-eco-green disabled:opacity-60"
                  >
                    <option value="">Selecciona una provincia</option>
                    {provincias.map((provincia) => (
                      <option key={provincia.id} value={provincia.id}>
                        {provincia.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Ciudad</label>
                  <select
                    required
                    value={formData.ciudadId}
                    disabled={!formData.provinciaId || locationLocked}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ciudadId: e.target.value,
                        latitud:
                          ciudades.find((ciudad) => String(ciudad.id) === e.target.value)
                            ?.latitud ?? "",
                        longitud:
                          ciudades.find((ciudad) => String(ciudad.id) === e.target.value)
                            ?.longitud ?? "",
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-eco-green disabled:opacity-60"
                  >
                    <option value="">Selecciona una ciudad</option>
                    {ciudades.map((ciudad) => (
                      <option key={ciudad.id} value={ciudad.id}>
                        {ciudad.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2">Nombre de la zona</label>
                <input
                  type="text"
                  required
                  value={formData.zona}
                  onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-eco-green"
                  placeholder="Ej: Parque cercano a quebrada"
                />
              </div>

              <div>
                <label className="block mb-2">Descripcion</label>
                <textarea
                  required
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  className="min-h-28 w-full resize-y px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-eco-green"
                  placeholder="Ej: Zona con basura acumulada y poca vegetacion"
                />
              </div>

              <Button
                type="button"
                onClick={useCurrentLocation}
                variant="outline"
                className="w-full"
              >
                <NavigationIcon className="size-4" />
                Usar mi ubicacion actual
              </Button>

              {locationLocked && (
                <div className="flex flex-col gap-3 rounded-lg border border-eco-green/30 bg-eco-green-light px-4 py-3 text-eco-green sm:flex-row sm:items-center sm:justify-between">
                  <span>Ubicacion validada. Puedes mover el pin en el mapa para buscar tu barrio.</span>
                  <Button type="button" variant="ghost" size="sm" onClick={unlockLocationFields}>
                    Seleccionar la provincia o cuidad.
                  </Button>
                </div>
              )}

              <RiskMap
                barrio={selectedCiudad?.nombre ?? ""}
                latitude={formData.latitud}
                longitude={formData.longitud}
                points={riskPoints}
                showSelectedMarker={Boolean(formData.latitud && formData.longitud)}
                showDetails={false}
                onChange={({ latitude, longitude }) =>
                  setFormData((current) => ({
                    ...current,
                    latitud: latitude,
                    longitud: longitude,
                  }))
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trees className="size-5 text-eco-green" />
                Factores Ambientales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block mb-2">Nivel de vegetacion</label>
                <select
                  value={formData.vegetacion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vegetacion: e.target.value as Vegetacion,
                    })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-eco-green"
                >
                  <option value="alta">Alta - Abundante cobertura vegetal</option>
                  <option value="media">Media - Cobertura moderada</option>
                  <option value="baja">Baja - Poca o ninguna vegetacion</option>
                </select>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <SwitchField
                  label="Basura acumulada"
                  checked={formData.basura}
                  onChange={(checked) => setFormData({ ...formData, basura: checked })}
                  icon={Trash2}
                />
                <SwitchField
                  label="Cerca de rio o quebrada"
                  checked={formData.cercaRio}
                  onChange={(checked) => setFormData({ ...formData, cercaRio: checked })}
                  icon={Droplets}
                />
                <SwitchField
                  label="Tala de arboles"
                  checked={formData.tala}
                  onChange={(checked) => setFormData({ ...formData, tala: checked })}
                  icon={Trees}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mountain className="size-5 text-eco-yellow" />
                Caracteristicas del Terreno
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <SelectField
                label="Pendiente"
                value={formData.pendiente}
                onChange={(value) =>
                  setFormData({ ...formData, pendiente: value as Pendiente })
                }
                options={[
                  ["baja", "Baja"],
                  ["media", "Media"],
                  ["alta", "Alta"],
                ]}
              />
              <SelectField
                label="Inundaciones"
                value={formData.inundaciones}
                onChange={(value) =>
                  setFormData({ ...formData, inundaciones: value as Frecuencia })
                }
                options={[
                  ["nunca", "Nunca"],
                  ["a_veces", "A veces"],
                  ["frecuente", "Frecuente"],
                ]}
              />
              <SelectField
                label="Deslizamientos"
                value={formData.deslizamientos}
                onChange={(value) =>
                  setFormData({ ...formData, deslizamientos: value as Frecuencia })
                }
                options={[
                  ["nunca", "Nunca"],
                  ["a_veces", "A veces"],
                  ["frecuente", "Frecuente"],
                ]}
              />
            </CardContent>
          </Card>

          {errorMessage && (
            <div className="rounded-lg border border-eco-red/30 bg-eco-red-light px-4 py-3 text-eco-red">
              {errorMessage}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            <Calculator className="size-5" />
            {isSubmitting ? "Guardando..." : "Guardar Evaluacion Ambiental"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function findNearestCatalogCity(
  latitude: number,
  longitude: number,
  catalogo: CatalogoUbicacion[]
) {
  const cities = normalizeCatalogCities(catalogo);

  return cities.reduce<{
    city: NormalizedCatalogCity;
    distanceKm: number;
  } | null>((nearest, city) => {
    const cityLatitude = Number(city.latitud);
    const cityLongitude = Number(city.longitud);

    if (!Number.isFinite(cityLatitude) || !Number.isFinite(cityLongitude)) {
      return nearest;
    }

    const distanceKm = getDistanceKm(latitude, longitude, cityLatitude, cityLongitude);

    if (!nearest || distanceKm < nearest.distanceKm) {
      return { city, distanceKm };
    }

    return nearest;
  }, null);
}

function normalizeCatalogCities(catalogo: CatalogoUbicacion[]): NormalizedCatalogCity[] {
  return catalogo.flatMap((item) => {
    const nestedCities = (item as any).ciudades;

    if (Array.isArray(nestedCities)) {
      return nestedCities.map((city) => ({
        provinciaId: Number((item as any).id),
        provincia: String((item as any).nombre ?? ""),
        ciudadId: Number(city.id),
        ciudad: String(city.nombre ?? ""),
        latitud: city.latitud,
        longitud: city.longitud,
      }));
    }

    return [
      {
        provinciaId: Number((item as any).provincia_id),
        provincia: String((item as any).provincia_nombre ?? ""),
        ciudadId: Number((item as any).ciudad_id),
        ciudad: String((item as any).ciudad_nombre ?? ""),
        latitud: (item as any).ciudad_latitud,
        longitud: (item as any).ciudad_longitud,
      },
    ];
  });
}

function getDistanceKm(
  fromLatitude: number,
  fromLongitude: number,
  toLatitude: number,
  toLongitude: number
) {
  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(toLatitude - fromLatitude);
  const deltaLongitude = toRadians(toLongitude - fromLongitude);
  const startLatitude = toRadians(fromLatitude);
  const endLatitude = toRadians(toLatitude);
  const value =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(deltaLongitude / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <div>
      <label className="block mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-eco-green"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

function SwitchField({
  label,
  checked,
  onChange,
  icon: Icon,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 rounded-lg border border-border bg-muted/30">
      <div className="flex items-center gap-3">
        <Icon className="size-5 text-muted-foreground" />
        <Label className="cursor-pointer">{label}</Label>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-eco-green bg-switch-background relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors"
      >
        <span
          className={`${checked ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>
    </div>
  );
}
