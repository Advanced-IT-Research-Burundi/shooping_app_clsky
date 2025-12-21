import { ArrowLeft, Edit, Trash2, Package, Box, Calendar, DollarSign } from 'lucide-react';
import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useParams } from 'react-router-dom';
import { IonPage, IonContent, IonButton, IonIcon, IonAlert, useIonRouter, IonInput, IonTextarea, IonItem, IonLabel } from '@ionic/react';
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

const packagingLabels = {
  unit: 'Unité',
  carton: 'Carton',
  other: 'Autre'
};

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { getProduct, deleteProduct, updateProduct } = useProducts();
  const router = useIonRouter();
  
  const product = getProduct(id);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // We need to initialize editedProduct safely. 
  // If product is undefined (e.g. on load before param match or invalid id), safely handle it.
  const [editedProduct, setEditedProduct] = useState<Product | undefined>(product);

  // If product not found, we should probably redirect or show error.
  if (!product) {
      // Simple fallback
      return (
          <IonPage>
              <IonContent>
                  <div className="flex items-center justify-center h-full">
                      <p>Produit non trouvé</p>
                      <IonButton onClick={() => router.goBack()}>Retour</IonButton>
                  </div>
              </IonContent>
          </IonPage>
      )
  }

  // Ensure editedProduct is set when entering edit mode or product changes
  if (isEditing && (!editedProduct || editedProduct.id !== product.id)) {
      setEditedProduct(product);
  }

  const handleDelete = () => {
    deleteProduct(product.id);
    router.goBack();
  };

  const handleSaveEdit = () => {
    if (editedProduct) {
        updateProduct(editedProduct);
        setIsEditing(false);
    }
  };

  if (isEditing && editedProduct) {
    return (
      <IonPage>
        <IonContent className="bg-gray-50">
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            <button onClick={() => setIsEditing(false)} className="p-2 -ml-2 active:bg-gray-100 rounded-xl transition">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl text-gray-900 font-bold">Modifier</h1>
            <button onClick={handleSaveEdit} className="text-blue-600 px-4 py-2 rounded-xl active:bg-blue-50 transition font-medium">
              Sauver
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <IonLabel className="text-sm text-gray-700 mb-2 block font-medium">Nom du produit</IonLabel>
              <IonItem lines="none" className="rounded-xl border border-gray-200 overflow-hidden" style={{ '--background': 'transparent', '--padding-start': '0' }}>
                 <IonInput
                    value={editedProduct.name}
                    onIonInput={(e) => setEditedProduct({ ...editedProduct, name: e.detail.value! })}
                    className="px-4"
                 />
              </IonItem>
            </div>

            <div>
              <IonLabel className="text-sm text-gray-700 mb-2 block font-medium">Description</IonLabel>
              <IonItem lines="none" className="rounded-xl border border-gray-200 overflow-hidden" style={{ '--background': 'transparent', '--padding-start': '0' }}>
                <IonTextarea
                  value={editedProduct.description}
                  onIonInput={(e) => setEditedProduct({ ...editedProduct, description: e.detail.value! })}
                  rows={3}
                  className="px-4"
                />
              </IonItem>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <IonLabel className="text-sm text-gray-700 mb-2 block font-medium">Prix</IonLabel>
                <IonItem lines="none" className="rounded-xl border border-gray-200 overflow-hidden" style={{ '--background': 'transparent', '--padding-start': '0' }}>
                    <IonInput
                        type="number"
                        value={editedProduct.price}
                        onIonInput={(e) => setEditedProduct({ ...editedProduct, price: parseFloat(e.detail.value!) || 0 })}
                        className="px-4"
                    />
                </IonItem>
              </div>

              <div>
                <IonLabel className="text-sm text-gray-700 mb-2 block font-medium">Taux de change</IonLabel>
                 <IonItem lines="none" className="rounded-xl border border-gray-200 overflow-hidden" style={{ '--background': 'transparent', '--padding-start': '0' }}>
                    <IonInput
                        type="number"
                        value={editedProduct.exchangeRate}
                        onIonInput={(e) => {
                        const rate = parseFloat(e.detail.value!) || 0;
                        setEditedProduct({ 
                            ...editedProduct, 
                            exchangeRate: rate,
                            convertedPrice: editedProduct.price * rate
                        });
                        }}
                        className="px-4"
                    />
                </IonItem>
              </div>
            </div>
          </div>
        </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header with Image */}
        <div className="relative">
            <img
            src={product.photo}
            alt={product.name}
            className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            
            {/* Back Button */}
            <button
            onClick={() => router.goBack()}
            className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg active:scale-95 transition z-10"
            >
            <ArrowLeft className="w-6 h-6 text-gray-800" />
            </button>

            {/* Type Badge */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-2">
            <span className="text-xl">{typeIcons[product.type]}</span>
            <span className="text-sm text-gray-800">{typeLabels[product.type]}</span>
            </div>
        </div>

        {/* Content */}
        <div className="px-6 -mt-6 relative">
            {/* Main Info Card */}
            <div className="bg-white rounded-3xl shadow-lg p-6 mb-4">
            <h1 className="text-2xl text-gray-900 mb-2 font-bold">{product.name}</h1>
            {product.description && (
                <p className="text-gray-600 mb-4">{product.description}</p>
            )}

            {/* Price Info */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Prix d&apos;achat</span>
                <div className="text-2xl text-blue-600 font-bold">
                    {product.price} {product.currency}
                </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Taux de change: {product.exchangeRate}</span>
                <span className="text-gray-800 font-semibold">
                    {product.convertedPrice.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} BIF
                </span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
                <IonButton
                onClick={() => { setEditedProduct(product); setIsEditing(true); }}
                className="font-medium"
                fill="solid"
                color="primary"
                style={{ '--border-radius': '0.75rem', height: '3rem' }}
                >
                <Edit className="w-5 h-5 mr-2" />
                Modifier
                </IonButton>
                <IonButton
                onClick={() => setShowDeleteConfirm(true)}
                className="font-medium"
                fill="solid"
                color="danger"
                style={{ '--border-radius': '0.75rem', '--background': '#fee2e2', '--color': '#dc2626', height: '3rem' }}
                >
                <Trash2 className="w-5 h-5 mr-2" />
                Supprimer
                </IonButton>
            </div>
            </div>

            {/* Details Card */}
            <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
            <h2 className="text-lg text-gray-900 mb-4 font-bold">Détails</h2>

            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="bg-blue-100 p-3 rounded-xl">
                <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                <div className="text-sm text-gray-500">Emballage</div>
                <div className="text-gray-900">{packagingLabels[product.packaging]}</div>
                </div>
            </div>

            {product.packaging === 'carton' && (
                <>
                {product.piecesPerCarton && (
                    <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="bg-green-100 p-3 rounded-xl">
                        <Box className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Pièces par carton</div>
                        <div className="text-gray-900">{product.piecesPerCarton}</div>
                    </div>
                    </div>
                )}
                {product.numberOfCartons && (
                    <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="bg-purple-100 p-3 rounded-xl">
                        <Box className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Nombre de cartons</div>
                        <div className="text-gray-900">{product.numberOfCartons}</div>
                    </div>
                    </div>
                )}
                </>
            )}

            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="bg-orange-100 p-3 rounded-xl">
                <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                <div className="text-sm text-gray-500">Devise</div>
                <div className="text-gray-900">{product.currency}</div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-3 rounded-xl">
                <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                <div className="text-sm text-gray-500">Date d&apos;enregistrement</div>
                <div className="text-gray-900">
                    {new Date(product.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                    })}
                </div>
                </div>
            </div>
            </div>
        </div>

        {/* Delete Confirmation Modal using IonAlert */}
        <IonAlert
            isOpen={showDeleteConfirm}
            onDidDismiss={() => setShowDeleteConfirm(false)}
            header="Supprimer le produit ?"
            message="Cette action est irréversible. Le produit sera définitivement supprimé."
            buttons={[
            {
                text: 'Annuler',
                role: 'cancel',
                cssClass: 'secondary',
            },
            {
                text: 'Supprimer',
                role: 'destructive',
                handler: handleDelete,
            },
            ]}
        />
        </div>
      </IonContent>
    </IonPage>
  );
}
