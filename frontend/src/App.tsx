import {
  BrowserRouter, Routes, Route
} from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";

import ChampionshipPage from "./pages/ChampionshipPage";

import PhasePage from "./pages/PhasePage";

import CreateChampionshipPage from "./pages/CreateChampionshipPage";

import DisplayPhasePage from "./pages/DisplayPhasePage";

import MusicPoolPage from "./pages/MusicPoolPage";
import AmbientArrows from "./components/AmbientArrows";

export default function App(){

  return (

    <BrowserRouter>
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


    </BrowserRouter>
  )
}
