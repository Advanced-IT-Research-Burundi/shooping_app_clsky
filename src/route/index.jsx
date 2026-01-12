import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import { Home } from "../components/Home";
import { Login } from "../components/Login";
import { AddPurchase } from "../components/AddPurchase";
import { ProductList } from "../components/ProductList";
import { ProductDetail } from "../components/ProductDetail";
import { Profile } from "../components/Profile";
import { SupplierList } from "../components/SupplierList";
import { SupplierFormScreen } from "../components/SupplierFormScreen";
import { ChangePasswordScreen } from "../components/ChangePasswordScreen";
import { ReportsScreen } from "../components/ReportsScreen";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "add",
        element: <AddPurchase />,
      },
      {
        path: "products",
        element: <ProductList />,
      },
      {
        path: "suppliers",
        element: <SupplierList />,
      },
      {
        path: "suppliers/add",
        element: <SupplierFormScreen />,
      },
      {
        path: "suppliers/edit/:id",
        element: <SupplierFormScreen />,
      },
      {
        path: "product/:id",
        element: <ProductDetail />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "change-password",
        element: <ChangePasswordScreen />,
      },
      {
        path: "reports",
        element: <ReportsScreen />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
