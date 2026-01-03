import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from "react-router-dom";
import { useGetProductsQuery } from "./features/auth/apiSlicer";
import { Home } from "./components/Home";
import { AddPurchase } from "./components/AddPurchase";
import { ProductList } from "./components/ProductList";
import { ProductDetail } from "./components/ProductDetail";
import { Profile } from "./components/Profile";
import { BottomNav } from "./components/BottomNav";
import { Login } from "./components/Login";

function ProductDetailWrapper({ products, onBack, onDelete, onEdit }) {
  const { id } = useParams();
  const product = products.find(p => p.id == id);
  
  if (!product) return <Navigate to="/products" replace />;
  
  return (
    <ProductDetail 
      product={product} 
      onBack={onBack}
      onDelete={onDelete}
      onEdit={onEdit}
    />
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for saved auth state on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    navigate("/");
  };

  /* 
    The user wants to replace the hardcoded products with the data coming from the database.
    We are initializing this as empty, and we will use apiData from useGetProductsQuery as the source of truth for display.
    Create/Update/Delete operations would ideally update the server data via API mutations.
  */
  const [products, setProducts] = useState([]);

  // State for infinite scroll pagination
  const [page, setPage] = useState(1);
  const { data: apiData, isFetching } = useGetProductsQuery(page);

  // Effect to load more when scrolling to bottom (simple implementation)
  // or just a button for now.
  // Actually, let's sync local products with apiData if needed, or just pass apiData.data as products
  // The user has existing dummy data, we might want to replace it.
  
  const allProducts = apiData?.data || products; // Fallback to initial dummy if no API data yet, or just apiData.data

  // Handler for loading more
  const handleLoadMore = () => {
    if (apiData?.meta && apiData.meta.current_page < apiData.meta.last_page) {
       setPage(prev => prev + 1);
    }
  };


  const handleAddProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      date: (new Date()).toISOString().split("T")[0]
    };
    setProducts([newProduct, ...products]);
    navigate("/products");
  };

  const handleViewDetail = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleDeleteProduct = (productId) => {
    setProducts(products.filter((p) => p.id !== productId));
    navigate("/products");
  };

  const handleUpdateProduct = (updatedProduct) => {
    setProducts(products.map((p) => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const getCurrentScreen = () => {
    const path = location.pathname;
    if (path === "/") return "home";
    if (path === "/add") return "add";
    if (path === "/products") return "products";
    if (path === "/profile") return "profile";
    if (path.startsWith("/product/")) return "detail";
    return "home";
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const currentScreen = getCurrentScreen();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto relative">
      <Routes>
        <Route path="/" element={<Home products={allProducts} onAddClick={() => navigate("/add")} onProductClick={handleViewDetail} />} />
        <Route path="/add" element={<AddPurchase onSubmit={handleAddProduct} onCancel={() => navigate("/")} />} />
        <Route path="/products" element={<ProductList products={allProducts} onProductClick={handleViewDetail} onLoadMore={handleLoadMore} hasMore={apiData?.meta?.current_page < apiData?.meta?.last_page} isFetching={isFetching} />} />
        <Route path="/product/:id" element={<ProductDetailWrapper products={allProducts} onBack={() => navigate("/products")} onDelete={handleDeleteProduct} onEdit={handleUpdateProduct} />} />
        <Route path="/profile" element={<Profile user={user} onLogout={handleLogout} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
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
