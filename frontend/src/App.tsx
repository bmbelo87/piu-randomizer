import {
  BrowserRouter, HashRouter, Routes, Route
} from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";

import ChampionshipPage from "./pages/ChampionshipPage";

import PhasePage from "./pages/PhasePage";

import CreateChampionshipPage from "./pages/CreateChampionshipPage";

import DisplayPhasePage from "./pages/DisplayPhasePage";

import MusicPoolPage from "./pages/MusicPoolPage";
import AmbientArrows from "./components/AmbientArrows";

import { STATIC_MODE } from "./services/config";

// No GitHub Pages nao ha fallback de SPA, entao as rotas usam o hash (#/rota).
const Router = STATIC_MODE ? HashRouter : BrowserRouter;
export default function App(){

  return (

    <Router>
      <div className="relative min-h-screen">
        <AmbientArrows />
        <div className="relative z-10">
      <Routes>

        <Route
          path="/"

          element={<DashboardPage />}
          />

          <Route
            path="/championships/:id"
            element={<ChampionshipPage />}
          />

          <Route
            path="/phases/:id"

            element={<PhasePage />}
          />

          <Route
            path="/create-championship"

            element={<CreateChampionshipPage />}
          />

          <Route 
            path="/display"
            element={<DisplayPhasePage />}
          
          
          />

          <Route
            path="/music-pool"
            element={<MusicPoolPage />}
          />
      </Routes>
        </div>
      </div>


    </Router>
  )
}
