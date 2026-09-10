import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import HomeRoute from "./HomeRoute";
import Scanner from "../pages/Scanner/Index";
import Catalogo from "../pages/Catalogo/Index";
import Auditoria from "../pages/Auditoria/Index";
import Login from "../pages/Login/Index";
import { PrivateRoute } from "./PrivateRoute";
import { PublicRoute } from "./PublicRoute";

export const routes = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
            </Route>

            <Route element={<PrivateRoute />}>
                <Route element={<AppLayout />}>
                    <Route index path="/" element={<HomeRoute />} />
                    <Route path="/ler" element={<Scanner />} />
                    <Route path="/catalogo" element={<Catalogo />} />
                    <Route path="/auditoria" element={<Auditoria />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Route>
        </>
    )
)
