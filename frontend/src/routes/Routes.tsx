import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import HomeRoute from "./HomeRoute";
import Catalogo from "../pages/Catalogo/Index";
import Auditoria from "../pages/Auditoria/Index";
import Emprestimo from "../pages/Emprestimo/Index";
import Login from "../pages/Login/Index";

export const routes = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/login" element={<Login />} />

            <Route element={<AppLayout />}>
                <Route index path="/" element={<HomeRoute />} />
                <Route path="/catalogo" element={<Catalogo />} />
                <Route path="/emprestimos" element={<Emprestimo />} />
                <Route path="/auditoria" element={<Auditoria />} />
            </Route>
        </>
    )
)
