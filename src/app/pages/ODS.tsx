import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router";
import {
  Target,
  CloudRain,
  Trees,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Users,
  MapPin
} from "lucide-react";
import { motion } from "motion/react";

export function ODS() {
  const ods13Points = [
    "Fortalecer la resiliencia y la capacidad de adaptación a los riesgos relacionados con el clima",
    "Incorporar medidas relativas al cambio climático en las políticas, estrategias y planes nacionales",
    "Mejorar la educación, la sensibilización y la capacidad humana e institucional respecto de la mitigación del cambio climático",
  ];

  const ods15Points = [
    "Velar por la conservación, el restablecimiento y el uso sostenible de los ecosistemas terrestres",
    "Promover la gestión sostenible de todos los tipos de bosques y detener la deforestación",
    "Luchar contra la desertificación y rehabilitar las tierras y los suelos degradados",
  ];

  const impacts = [
    {
      icon: BarChart3,
      title: "Evaluación basada en datos",
      description: "Proporcionamos métricas objetivas sobre el estado ambiental de cada zona",
    },
    {
      icon: MapPin,
      title: "Identificación de zonas vulnerables",
      description: "Detectamos áreas que requieren atención urgente para prevenir desastres",
    },
    {
      icon: CheckCircle2,
      title: "Recomendaciones accionables",
      description: "Ofrecemos soluciones específicas para cada situación identificada",
    },
    {
      icon: Users,
      title: "Empoderamiento comunitario",
      description: "Capacitamos a las comunidades para que tomen decisiones informadas",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-eco-green to-eco-blue text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Target className="size-16 mx-auto mb-6" />
            <h1 className="mb-4">Objetivos de Desarrollo Sostenible</h1>
            <p className="text-xl opacity-95">
              EcoRiesgo contribuye directamente a los ODS 13 y 15 de las Naciones Unidas
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* ODS Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* ODS 13 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-2 border-eco-blue/20">
              <CardHeader>
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-eco-blue text-white p-4 rounded-xl text-3xl font-bold min-w-20 text-center">
                    13
                  </div>
                  <div>
                    <CloudRain className="size-8 text-eco-blue mb-2" />
                    <CardTitle>Acción por el Clima</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Adoptar medidas urgentes para combatir el cambio climático y sus efectos
                </p>
                <ul className="space-y-3">
                  {ods13Points.map((point, index) => (
                    <li key={index} className="flex gap-3">
                      <CheckCircle2 className="size-5 text-eco-blue mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* ODS 15 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full border-2 border-eco-green/20">
              <CardHeader>
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-eco-green text-white p-4 rounded-xl text-3xl font-bold min-w-20 text-center">
                    15
                  </div>
                  <div>
                    <Trees className="size-8 text-eco-green mb-2" />
                    <CardTitle>Vida de Ecosistemas Terrestres</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Proteger, restaurar y promover el uso sostenible de los ecosistemas terrestres
                </p>
                <ul className="space-y-3">
                  {ods15Points.map((point, index) => (
                    <li key={index} className="flex gap-3">
                      <CheckCircle2 className="size-5 text-eco-green mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* How EcoRiesgo Helps */}
        <Card className="mb-16 bg-gradient-to-br from-muted/50 to-background">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <TrendingUp className="size-6 text-eco-green" />
              Cómo EcoRiesgo Contribuye a los ODS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
              Nuestra plataforma facilita la toma de decisiones informadas sobre gestión ambiental
              y ayuda a las comunidades a identificar y mitigar riesgos climáticos y ecológicos
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {impacts.map((impact, index) => {
                const Icon = impact.icon;
                return (
                  <motion.div
                    key={impact.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="flex gap-4 p-4 rounded-xl bg-card border border-border hover:shadow-md transition-shadow">
                      <div className="bg-eco-green-light p-3 rounded-xl h-fit">
                        <Icon className="size-6 text-eco-green" />
                      </div>
                      <div>
                        <h4 className="mb-2">{impact.title}</h4>
                        <p className="text-sm text-muted-foreground">{impact.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-eco-green text-white border-none">
          <CardContent className="text-center py-12">
            <h2 className="mb-4">¿Listo para hacer la diferencia?</h2>
            <p className="text-lg mb-8 opacity-95 max-w-2xl mx-auto">
              Únete a nosotros en la construcción de comunidades más resilientes y sostenibles.
              Cada evaluación contribuye a un futuro mejor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/evaluar">
                <Button
                  size="lg"
                  className="bg-white text-eco-green hover:bg-white/90"
                >
                  <MapPin className="size-5" />
                  Evaluar mi zona
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  <BarChart3 className="size-5" />
                  Ver impacto global
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
