import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { useGetProductsQuery } from "./features/auth/apiSlicer";
import { selectToken, logout } from "./features/auth/authSlice";
import { BottomNav } from "./components/BottomNav";

export default function App() {
  const token = useSelector(selectToken);
  const isAuthenticated = !!token;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // We can also get the user from Redux if needed
  // const user = useSelector(selectCurrentUser);
  // For now, let's keep the user object if components need it, or rely on them fetching it.
  // Profile expects 'user' object.
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  /* 
    The user wants to replace the hardcoded products with the data coming from the database.
    We are initializing this as empty, and we will use apiData from useGetProductsQuery as the source of truth for display.
  */
  const [products, setProducts] = useState([]);

  // State for infinite scroll pagination
  const [page, setPage] = useState(1);
  const { data: apiData, isFetching } = useGetProductsQuery({ page });

  const allProducts = apiData?.data || products; 

  // Handler for loading more
  const handleLoadMore = () => {
    if (apiData?.meta && apiData.meta.current_page < apiData.meta.last_page) {
       setPage(prev => prev + 1);
    }
  };

  const handleAddProduct = (product) => {
    /* 
       When a product is added, the API cache is invalidated via tags.
       However, to ensure the UI shows the new product immediately at the top (Page 1),
       we reset the page state to 1.
       This triggers useGetProductsQuery(1), which matches the 'merge' logic for page 1 (replace cache),
       ensuring a clean, fresh list.
    */
    setPage(1);
    navigate("/products");
  };

  const handleViewDetail = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleDeleteProduct = (productId) => {
    // This should also be an API call, but for now we just handle nav
    navigate("/products");
  };

  const handleUpdateProduct = (updatedProduct) => {
    // API call needed
  };

  const getCurrentScreen = () => {
    const path = location.pathname;
    if (path === "/") return "home";
    if (path === "/add") return "add";
    if (path.startsWith("/products")) return "products";
    if (path === "/profile") return "profile";
    if (path.startsWith("/product/")) return "detail";
    return "home";
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const currentScreen = getCurrentScreen();

  // Context to render children with necessary props
  const context = {
    products: allProducts,
    user,
    onAddClick: () => navigate("/add"),
    onProductClick: handleViewDetail,
    onLoadMore: handleLoadMore,
    hasMore: apiData?.meta?.current_page < apiData?.meta?.last_page,
    isFetching,
    onSubmit: handleAddProduct, // For AddPurchase
    onCancel: () => navigate("/"), // For AddPurchase
    onLogout: handleLogout, // For Profile
    onBack: () => navigate("/products"), // For ProductDetail
    onDelete: handleDeleteProduct, // For ProductDetail
    onEdit: handleUpdateProduct, // For ProductDetail
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto relative">
      <Outlet context={context} />
      <BottomNav
        currentScreen={currentScreen === "detail" ? "products" : currentScreen}
        onNavigate={(screen) => {
          if (screen === "home") navigate("/");
          else if (screen === "add") navigate("/add");
          else if (screen === "products") navigate("/products");
          else if (screen === "profile") navigate("/profile");
        }}
      />
    </div>
  );
}
