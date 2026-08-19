import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";

export const routes = createBrowserRouter(
    createRoutesFromElements(
        <>
        <Route path="/login" />

        <Route element={<PrivateRoute />}>
            <Route index path="/" />
        </Route>
        </>
    )
)
