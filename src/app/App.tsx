import { BrowserRouter, Routes, Route } from "react-router";
import { Navigation } from "./components/Navigation";
import { Home } from "./pages/Home";
import { Evaluar } from "./pages/Evaluar";
import { Resultado } from "./pages/Resultado";
import { Dashboard } from "./pages/Dashboard";
import { ODS } from "./pages/ODS";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/evaluar" element={<Evaluar />} />
          <Route path="/resultado" element={<Resultado />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ods" element={<ODS />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}