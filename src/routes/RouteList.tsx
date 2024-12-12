import { Navigate } from "react-router-dom";
import React from "react";
import TableTest from "../pages/TableTest"
// import DashboardCard from "../semis-ui/components/dashboardCard/dashboardCard";
// import TestRulesEngine from "../components/programRules/TestRulesEngine";
// import TemplateValidation from "../components/templateValidation/TemplateValidation";

export default function RouteList() {
    return [
        {
            path: "/",
            component: () => <Navigate to="/table" replace />
        },
/* 
        {
            path: "/cards",
            component: () => <DashboardCard />
        },

        {
            path: "/rulesEngine",
            component: () => <TestRulesEngine />
        },

        {
            path: "/templateValidation",
            component: () => <TemplateValidation/>
        }, */
        {
            path: "/table",
            component: () => <TableTest />
        }
    ]
}
