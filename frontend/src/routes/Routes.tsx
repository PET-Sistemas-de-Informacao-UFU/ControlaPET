import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import HomeRoute from "./HomeRoute";
import Scanner from "../pages/Scanner/Index";
import Catalogo from "../pages/Catalogo/Index";
import Auditoria from "../pages/Auditoria/Index";

export const routes = createBrowserRouter(
    createRoutesFromElements(
        <Route element={<AppLayout />}>
            <Route index path="/" element={<HomeRoute />} />
            <Route path="/ler" element={<Scanner />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/auditoria" element={<Auditoria />} />
        </Route>
    )
)
