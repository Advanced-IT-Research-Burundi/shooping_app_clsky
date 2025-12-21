import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../types';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'date'>) => void;
  deleteProduct: (productId: string) => void;
  updateProduct: (updatedProduct: Product) => void;
  getProduct: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Smartphone Samsung Galaxy',
      description: 'Dernier modèle avec écran AMOLED',
      price: 450,
      currency: 'USD',
      exchangeRate: 2850,
      convertedPrice: 1282500,
      type: 'electronics',
      packaging: 'unit',
      photo: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
      date: '2025-12-15'
    },
    {
      id: '2',
      name: 'T-Shirts Coton',
      description: 'Lot de t-shirts haute qualité',
      price: 120,
      currency: 'USD',
      exchangeRate: 2850,
      convertedPrice: 342000,
      type: 'clothing',
      packaging: 'carton',
      piecesPerCarton: 24,
      numberOfCartons: 5,
      photo: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      date: '2025-12-18'
    },
    {
      id: '3',
      name: 'Riz Parfumé',
      description: 'Sacs de riz de qualité premium',
      price: 85,
      currency: 'USD',
      exchangeRate: 2850,
      convertedPrice: 242250,
      type: 'food',
      packaging: 'carton',
      piecesPerCarton: 12,
      numberOfCartons: 10,
      photo: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
      date: '2025-12-19'
    }
  ]);

  const addProduct = (product: Omit<Product, 'id' | 'date'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0]
    };
    setProducts([newProduct, ...products]);
  };

  const deleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const getProduct = (id: string) => products.find(p => p.id === id);

  return (
    <ProductContext.Provider value={{ products, addProduct, deleteProduct, updateProduct, getProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
