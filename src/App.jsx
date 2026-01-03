import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from "react-router-dom";
import { Home } from "./components/Home";
import { AddPurchase } from "./components/AddPurchase";
import { ProductList } from "./components/ProductList";
import { ProductDetail } from "./components/ProductDetail";
import { Profile } from "./components/Profile";
import { BottomNav } from "./components/BottomNav";
import { Login } from "./components/Login";

function ProductDetailWrapper({ products, onBack, onDelete, onEdit }) {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  
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

  const [products, setProducts] = useState([
    {
      id: "1",
      name: "Smartphone Samsung Galaxy",
      description: "Dernier modèle avec écran AMOLED",
      price: 450,
      currency: "USD",
      exchangeRate: 2850,
      convertedPrice: 1282500,
      type: "electronics",
      packaging: "unit",
      photo: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800",
      date: "2025-12-15"
    },
    {
      id: "2",
      name: "T-Shirts Coton",
      description: "Lot de t-shirts haute qualité",
      price: 120,
      currency: "USD",
      exchangeRate: 2850,
      convertedPrice: 342000,
      type: "clothing",
      packaging: "carton",
      piecesPerCarton: 24,
      numberOfCartons: 5,
      photo: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
      date: "2025-12-18"
    },
    {
      id: "3",
      name: "Riz Parfumé",
      description: "Sacs de riz de qualité premium",
      price: 85,
      currency: "USD",
      exchangeRate: 2850,
      convertedPrice: 242250,
      type: "food",
      packaging: "carton",
      piecesPerCarton: 12,
      numberOfCartons: 10,
      photo: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800",
      date: "2025-12-19"
    }
  ]);

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
        <Route path="/" element={<Home products={products} onAddClick={() => navigate("/add")} onProductClick={handleViewDetail} />} />
        <Route path="/add" element={<AddPurchase onSubmit={handleAddProduct} onCancel={() => navigate("/")} />} />
        <Route path="/products" element={<ProductList products={products} onProductClick={handleViewDetail} />} />
        <Route path="/product/:id" element={<ProductDetailWrapper products={products} onBack={() => navigate("/products")} onDelete={handleDeleteProduct} onEdit={handleUpdateProduct} />} />
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
