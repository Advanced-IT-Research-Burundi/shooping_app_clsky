import { useState, useEffect } from "react";
import { Home } from "./components/Home";
import { AddPurchase } from "./components/AddPurchase";
import { ProductList } from "./components/ProductList";
import { ProductDetail } from "./components/ProductDetail";
import { Profile } from "./components/Profile";
import { BottomNav } from "./components/BottomNav";
import { Login } from "./components/Login";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("home");
  const [selectedProductId, setSelectedProductId] = useState(null);
  
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
    setCurrentScreen("home");
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
    setCurrentScreen("products");
  };

  const handleViewDetail = (productId) => {
    setSelectedProductId(productId);
    setCurrentScreen("detail");
  };

  const handleDeleteProduct = (productId) => {
    setProducts(products.filter((p) => p.id !== productId));
    setCurrentScreen("products");
  };

  const handleUpdateProduct = (updatedProduct) => {
    setProducts(products.map((p) => p.id === updatedProduct.id ? updatedProduct : p));
    setCurrentScreen("detail");
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto relative">
      {currentScreen === "home" && (
        <Home
          products={products}
          onAddClick={() => setCurrentScreen("add")}
          onProductClick={handleViewDetail}
        />
      )}
      {currentScreen === "add" && (
        <AddPurchase
          onSubmit={handleAddProduct}
          onCancel={() => setCurrentScreen("home")}
        />
      )}
      {currentScreen === "products" && (
        <ProductList
          products={products}
          onProductClick={handleViewDetail}
        />
      )}
      {currentScreen === "detail" && selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onBack={() => setCurrentScreen("products")}
          onDelete={handleDeleteProduct}
          onEdit={handleUpdateProduct}
        />
      )}
      {currentScreen === "profile" && <Profile user={user} onLogout={handleLogout} />}
      
      <BottomNav
        currentScreen={currentScreen === "detail" ? "products" : currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
      />
    </div>
  );
}
