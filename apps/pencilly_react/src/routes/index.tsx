import React from "react";
import {Route, Routes} from "react-router-dom";
import Home from "@/routes/home";

const Settings = React.lazy(() => import('@/routes/Settings'));
const Pricing = React.lazy(() => import('@/routes/Pricing'));

const AppRoutes = () => {
    return (
        <Routes>
            <Route index element={<Home />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="settings" element={<Settings />} />
        </Routes>
    );
};

export default AppRoutes;