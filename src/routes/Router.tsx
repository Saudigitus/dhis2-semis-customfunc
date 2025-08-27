import { RouteList } from '.';
import { HashRouter, Route, Routes } from 'react-router-dom';

export default function Router() {
    return (
        <HashRouter>
            <Routes>
                {
                    RouteList().map((route, index) => (
                        <Route
                            key={index}
                            path={route.path}
                            element={
                                    route.component()
                            }
                        />
                    ))
                }
            </Routes>
        </HashRouter>
    )
}
