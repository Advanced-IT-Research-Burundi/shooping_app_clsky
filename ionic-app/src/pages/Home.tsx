import React from 'react';
import { IonPage, IonContent, IonGrid, IonRow, IonCol, IonButton, useIonRouter } from '@ionic/react';
import { Plus, ShoppingBag, DollarSign, Package } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

export function Home() {
  const { products } = useProducts();
  const router = useIonRouter();
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.convertedPrice, 0);

  return (
    <IonPage>
      <IonContent fullscreen className="bg-gradient-to-b from-blue-50 to-gray-50">
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 pb-20">
          {/* Header */}
          <div className="bg-blue-600 text-white px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
            <h1 className="text-3xl mb-2 font-bold">Mes Achats</h1>
            <p className="text-blue-100">Gérez vos produits facilement</p>
          </div>

          <IonGrid className="px-6 -mt-6 mb-6">
            <IonRow>
              <IonCol size="6">
                <div className="bg-white rounded-2xl p-5 shadow-md h-full">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-100 p-2 rounded-xl">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-2xl text-gray-900 font-bold">{totalProducts}</div>
                  <div className="text-sm text-gray-500">Produits</div>
                </div>
              </IonCol>
              <IonCol size="6">
                <div className="bg-white rounded-2xl p-5 shadow-md h-full">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-100 p-2 rounded-xl">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="text-2xl text-gray-900 font-bold">{(totalValue / 1000000).toFixed(1)}M</div>
                  <div className="text-sm text-gray-500">BIF Total</div>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Add Button */}
          <div className="px-6 mb-6">
            <IonButton
              expand="block"
              onClick={() => router.push('/add')}
              className="rounded-2xl shadow-lg h-14 text-lg font-medium"
              style={{ '--border-radius': '1rem' }}
            >
              <Plus className="w-6 h-6 mr-3" />
              Ajouter un achat
            </IonButton>
          </div>

          {/* Recent Purchases */}
          <div className="px-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-gray-900 font-semibold">Achats récents</h2>
              <ShoppingBag className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-3">
              {products.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  onClick={() => router.push(`/products/${product.id}`)}
                  className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 active:scale-98 transition-transform cursor-pointer"
                >
                  <img
                    src={product.photo}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 truncate font-medium">{product.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{product.type}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-600 font-bold">{product.price} {product.currency}</div>
                    <div className="text-xs text-gray-500">{product.date}</div>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500">Aucun achat enregistré</p>
                <p className="text-sm text-gray-400 mt-1">Commencez par ajouter votre premier produit</p>
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
