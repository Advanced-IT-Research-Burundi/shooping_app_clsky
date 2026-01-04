import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import { Home } from "../components/Home";
import { Login } from "../components/Login";
import { AddPurchase } from "../components/AddPurchase";
import { ProductList } from "../components/ProductList";
import { ProductDetail } from "../components/ProductDetail";
import { Profile } from "../components/Profile";

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '',
                element: <Home />,
            },
            {
                path: 'add',
                element: <AddPurchase />,
            },
            {
                path: 'products',
                element: <ProductList />,
            },
            {
                path: 'product/:id',
                element: <ProductDetail />,
            },
            {
                path: 'profile',
                element: <Profile />,
            },
        ],
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    }
]);

export default router;
