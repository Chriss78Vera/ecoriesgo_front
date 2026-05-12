import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Save,
  Repeat,
  Lightbulb,
} from "lucide-react";
import { motion } from "motion/react";
import { RiskMap } from "../components/RiskMap";
import type { EvaluacionResponse, RiskLevel } from "../services/evaluacion";

export function Resultado() {
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState<EvaluacionResponse | null>(null);

  useEffect(() => {
    const lastEval = localStorage.getItem("lastEvaluation");
    if (!lastEval) {
      navigate("/evaluar");
      return;
    }
    setEvaluation(JSON.parse(lastEval));
  }, [navigate]);

  if (!evaluation) return null;

  const config = getRiskConfig(evaluation.nivel_riesgo);
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className={`${config.lightBg} border-2 ${config.border} mb-6`}>
            <CardContent className="pt-6">
              <div className="text-center">
                <Icon className={`size-20 ${config.color} mx-auto mb-4`} />
                <Badge variant={config.badge} className="mb-3 text-lg px-4 py-2">
                  {config.title}
                </Badge>
                <h1 className="mb-2">{evaluation.zona}</h1>
                <p className="text-muted-foreground text-lg mb-6">
                  {evaluation.ciudad_nombre ?? `Ciudad ${evaluation.ciudad_id}`}
                </p>

                <div className="inline-block">
                  <div className={`text-6xl font-bold mb-2 ${config.color}`}>
                    {evaluation.puntaje}
                  </div>
                  <p className="text-muted-foreground">Puntaje de riesgo / 100</p>
                </div>

                <p className="text-lg mt-6 max-w-2xl mx-auto">{config.message}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-5 text-eco-blue" />
                Ubicacion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <RiskMap
                barrio={evaluation.ciudad_nombre ?? ""}
                latitude={String(evaluation.latitud)}
                longitude={String(evaluation.longitud)}
                points={[evaluation]}
                readOnly
              />
              <p className="text-muted-foreground">
                Coordenadas: {evaluation.latitud}, {evaluation.longitud}
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="size-5 text-eco-yellow" />
                Recomendaciones Personalizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {evaluation.recomendaciones.map((rec, index) => (
                  <motion.li
                    key={rec}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-3 items-start"
                  >
                    <CheckCircle2 className="size-5 text-eco-green mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/evaluar" className="flex-1">
              <Button variant="outline" className="w-full" size="lg">
                <Repeat className="size-5" />
                Evaluar otra zona
              </Button>
            </Link>
            <Link to="/dashboard" className="flex-1">
              <Button className="w-full" size="lg">
                <Save className="size-5" />
                Ver todas las evaluaciones
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function getRiskConfig(level: RiskLevel) {
  switch (level) {
    case "bajo":
      return {
        icon: CheckCircle2,
        color: "text-eco-green",
        lightBg: "bg-eco-green-light",
        border: "border-eco-green/20",
        badge: "success" as const,
        title: "Riesgo Bajo",
        message: "La zona presenta condiciones ambientales favorables.",
      };
    case "medio":
      return {
        icon: AlertCircle,
        color: "text-eco-yellow",
        lightBg: "bg-eco-yellow-light",
        border: "border-eco-yellow/20",
        badge: "warning" as const,
        title: "Riesgo Medio",
        message: "Se requiere atencion a algunos factores ambientales.",
      };
    default:
      return {
        icon: AlertTriangle,
        color: "text-eco-red",
        lightBg: "bg-eco-red-light",
        border: "border-eco-red/20",
        badge: "danger" as const,
        title: "Riesgo Alto",
        message: "Se necesitan acciones urgentes para mitigar riesgos.",
      };
  }
}
