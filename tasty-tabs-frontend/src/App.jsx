/* eslint-disable no-unused-vars */
import React, { useContext, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthContext from "./dataStorage/Auth-context";
import "./App.css";
import LoadingSpinner from "./components/UI/LoadingSpinner";

function App() {
  const authCtx = useContext(AuthContext);
  const AuthForm = React.lazy(() => import("./components/Auth/AuthForm"));
  const Dashboard = React.lazy(() => import("./pages/Dashboard"));

  return (
    <>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="w-full h-screen pt-[20%]">
              <LoadingSpinner />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route
              path="/login"
              element={
                authCtx.isLoggedIn ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <AuthForm></AuthForm>
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                authCtx.isLoggedIn ? (
                  <Dashboard></Dashboard>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/dashboard/menuItems"
              element={
                authCtx.isLoggedIn ? (
                  <Dashboard>{/* <MenuItemsDash /> */}</Dashboard>
                ) : (
                  <Navigate to="/dashboard" />
                )
              }
            />
            <Route
              path="*"
              element={
                authCtx.isLoggedIn ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
