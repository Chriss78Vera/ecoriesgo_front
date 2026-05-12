import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Leaf,
  MapPin,
  BarChart3,
  AlertTriangle,
  Droplets,
  Trees,
  Trash2,
  Mountain
} from "lucide-react";
import { motion } from "motion/react";

export function Home() {
  const problems = [
    { icon: Trees, title: "Deforestación", color: "text-eco-green" },
    { icon: Trash2, title: "Basura acumulada", color: "text-eco-yellow" },
    { icon: Droplets, title: "Inundaciones", color: "text-eco-blue" },
    { icon: Mountain, title: "Deslizamientos", color: "text-eco-red" },
  ];

  const odsCards = [
    {
      number: 13,
      title: "Acción por el Clima",
      description: "Adoptar medidas urgentes para combatir el cambio climático y sus efectos.",
      color: "bg-eco-blue",
    },
    {
      number: 15,
      title: "Vida de Ecosistemas Terrestres",
      description: "Proteger, restaurar y promover el uso sostenible de los ecosistemas terrestres.",
      color: "bg-eco-green",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-eco-green via-eco-blue to-eco-green/80 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="bg-white/95 p-4 rounded-2xl shadow-lg">
                <Leaf className="size-12 text-eco-green" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-sm">EcoRiesgo</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl text-white mx-auto drop-shadow-sm">
              Evalúa el riesgo ambiental de tu comunidad con datos
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/evaluar">
                <Button size="lg" className="bg-white text-eco-green hover:bg-white/90 shadow-lg">
                  <MapPin className="size-5" />
                  Evaluar zona
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="border-white bg-white/95 text-eco-green hover:bg-white">
                  <BarChart3 className="size-5" />
                  Ver dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ODS Cards */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center mb-12">Objetivos de Desarrollo Sostenible</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {odsCards.map((ods, index) => (
              <motion.div
                key={ods.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`${ods.color} text-white p-4 rounded-xl text-2xl font-bold min-w-16 text-center`}>
                        {ods.number}
                      </div>
                      <div>
                        <CardTitle>{ods.title}</CardTitle>
                        <p className="text-muted-foreground mt-2">{ods.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <AlertTriangle className="size-12 text-eco-yellow mx-auto mb-4" />
            <h2 className="mb-4">Problemas ambientales que identificamos</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Evaluamos múltiples factores de riesgo para proporcionar un análisis completo de tu zona
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                <motion.div
                  key={problem.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
                    <CardContent>
                      <Icon className={`size-12 mx-auto mb-3 ${problem.color}`} />
                      <p className="font-medium">{problem.title}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-eco-green text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-4">¿Listo para evaluar tu zona?</h2>
          <p className="text-lg mb-8 opacity-95">
            Comienza ahora a identificar riesgos ambientales y contribuye a un futuro más sostenible
          </p>
          <Link to="/evaluar">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 shadow-lg">
              <MapPin className="size-5 text-black" />
              Comenzar evaluación
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
