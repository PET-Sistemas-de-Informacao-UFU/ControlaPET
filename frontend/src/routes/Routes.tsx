import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import HomeRoute from "./HomeRoute";
import Catalogo from "../pages/Catalogo/Index";
import Movimentacoes from "../pages/Movimentacoes/Index";
import Auditoria from "../pages/Auditoria/Index";
import Usuarios from "../pages/Usuario/Index";
import Login from "../pages/Login/Index";
import EsqueciSenha from "../pages/EsqueciSenha/Index";
import RedefinirSenha from "../pages/RedefinirSenha/Index";
import { PrivateRoute } from "./PrivateRoute";
import { PublicRoute } from "./PublicRoute";
import { AdminRoute } from "./AdminRoute";

export const routes = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/esqueci-senha" element={<EsqueciSenha />} />
                <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            </Route>

            <Route element={<PrivateRoute />}>
                <Route element={<AppLayout />}>
                    <Route index path="/" element={<HomeRoute />} />
                    <Route path="/catalogo" element={<Catalogo />} />
                    <Route path="/movimentacoes" element={<Movimentacoes />} />
                    <Route element={<AdminRoute />}>
                        <Route path="/auditoria" element={<Auditoria />} />
                        <Route path="/usuarios" element={<Usuarios />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Route>
        </>
    )
);
