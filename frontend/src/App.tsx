import {
  BrowserRouter, Routes, Route, Navigate
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";

import DashboardPage from "./pages/DashboardPage";

import ChampionshipPage from "./pages/ChampionshipPage";

import PhasePage from "./pages/PhasePage";

import CreateChampionshipPage from "./pages/CreateChampionshipPage";

import DisplayPhasePage from "./pages/DisplayPhasePage";

function PrivateRoute({
  children
}: {
  children: React.ReactNode
}) {
  const token = 
    localStorage.getItem("token");

    if (!token){
      return <Navigate to="/login" />;
    }

    return children;
}

export default function App(){

  return (

    <BrowserRouter>
      
      <Routes>

        <Route
          path="/login"

          element={<LoginPage />}
          />

        <Route
          path="/"

          element={
            <PrivateRoute>

              <DashboardPage />

            </PrivateRoute>
          }
          />

          <Route
            path="/championships/:id"
            element={
              <PrivateRoute>
                <ChampionshipPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/phases/:id"

            element={
              <PrivateRoute>
                <PhasePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/create-championship"

            element={
              <PrivateRoute>
                <CreateChampionshipPage />
              </PrivateRoute>
            }
          />

          <Route 
            path="/display"
            element={
              <DisplayPhasePage />
            }
          
          
          />
      </Routes>


    </BrowserRouter>
  )
}