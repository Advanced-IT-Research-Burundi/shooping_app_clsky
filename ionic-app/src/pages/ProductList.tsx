import { Search, Filter, Package, Box } from 'lucide-react';
import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonSearchbar, IonGrid, IonRow, IonCol, IonChip, IonLabel, useIonRouter } from '@ionic/react';
import { Product } from '../types';

const typeIcons = {
  food: '🍎',
  electronics: '📱',
  clothing: '👕',
  other: '📦'
};

const typeLabels = {
  food: 'Alimentaire',
  electronics: 'Électronique',
  clothing: 'Vêtements',
  other: 'Autres'
};

export function ProductList() {
  const { products } = useProducts();
  const router = useIonRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<Product['type'] | 'all'>('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || product.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <IonPage>
      <IonHeader className="ion-no-border bg-white shadow-sm">
        <IonToolbar>
          <IonTitle>Produits</IonTitle>
          <div slot="end" className="pr-4">
             <div className="bg-blue-100 px-3 py-1 rounded-full text-sm text-blue-600 font-bold">
              {filteredProducts.length}
            </div>
          </div>
        </IonToolbar>
        <div className="px-4 pb-2">
          <IonSearchbar 
            value={searchQuery} 
            onIonInput={e => setSearchQuery(e.detail.value!)} 
            placeholder="Rechercher un produit..."
            className="ion-no-padding"
          />
        
          <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide py-2">
            <IonChip 
              onClick={() => setFilterType('all')} 
              color={filterType === 'all' ? 'primary' : 'medium'}
              outline={filterType !== 'all'}
            >
              <IonLabel>Tous</IonLabel>
            </IonChip>
            {Object.entries(typeLabels).map(([key, label]) => (
              <IonChip
                key={key}
                onClick={() => setFilterType(key as Product['type'])}
                color={filterType === key ? 'primary' : 'medium'}
                outline={filterType !== key}
              >
                <span className="mr-1">{typeIcons[key as Product['type']]}</span>
                <IonLabel>{label}</IonLabel>
              </IonChip>
            ))}
          </div>
        </div>
      </IonHeader>

      <IonContent className="bg-gray-50">
        <IonGrid className="ion-padding">
          <IonRow>
            {filteredProducts.map((product) => (
              <IonCol size="6" key={product.id}>
                <div
                  onClick={() => router.push(`/products/${product.id}`)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform h-full"
                >
                  <div className="relative aspect-square">
                    <img
                      src={product.photo}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs">
                      {typeIcons[product.type]}
                    </div>
                    {product.packaging === 'carton' && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white p-1.5 rounded-lg">
                        <Box className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm text-gray-900 truncate mb-1 font-medium">{product.name}</h3>
                    <div className="text-blue-600 mb-1 font-bold">
                      {product.price} {product.currency}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(product.convertedPrice / 1000).toFixed(0)}K BIF
                    </div>
                    {product.packaging === 'carton' && product.numberOfCartons && (
                      <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {product.numberOfCartons} cartons
                      </div>
                    )}
                  </div>
                </div>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 px-6">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500">Aucun produit trouvé</p>
            <p className="text-sm text-gray-400 mt-1">
              Essayez de modifier vos filtres
            </p>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}
