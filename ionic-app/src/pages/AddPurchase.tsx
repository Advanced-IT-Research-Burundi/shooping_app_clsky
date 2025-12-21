import React, { useState, useRef } from 'react';
import { Camera, X, Upload, ChevronDown } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea, useIonRouter, IonGrid, IonRow, IonCol } from '@ionic/react';
import { Product } from '../types';

const currencies = ['USD', 'EUR', 'BIF', 'GBP', 'CAD', 'JPY'];
const productTypes = [
  { value: 'food', label: 'Alimentaire', icon: '🍎' },
  { value: 'electronics', label: 'Électronique', icon: '📱' },
  { value: 'clothing', label: 'Vêtements', icon: '👕' },
  { value: 'other', label: 'Autres', icon: '📦' }
] as const;

const packagingTypes = [
  { value: 'unit', label: 'Unité' },
  { value: 'carton', label: 'Carton' },
  { value: 'other', label: 'Autre' }
] as const;

export function AddPurchase() {
  const { addProduct } = useProducts();
  const router = useIonRouter();

  const [photo, setPhoto] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState('2850');
  const [type, setType] = useState<Product['type']>('other');
  const [packaging, setPackaging] = useState<Product['packaging']>('unit');
  const [piecesPerCarton, setPiecesPerCarton] = useState('');
  const [numberOfCartons, setNumberOfCartons] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertedPrice = price && exchangeRate ? parseFloat(price) * parseFloat(exchangeRate) : 0;

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!name || !price || !photo) {
      // Use IonAlert ideally, but standard alert is ok for now or custom toast
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const product: Omit<Product, 'id' | 'date'> = {
      name,
      description,
      price: parseFloat(price),
      currency,
      exchangeRate: parseFloat(exchangeRate),
      convertedPrice,
      type,
      packaging,
      photo
    };

    if (packaging === 'carton') {
      product.piecesPerCarton = piecesPerCarton ? parseInt(piecesPerCarton) : undefined;
      product.numberOfCartons = numberOfCartons ? parseInt(numberOfCartons) : undefined;
    }

    addProduct(product);
    router.push('/home'); // Or back
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border bg-white shadow-sm">
        <IonToolbar>
            <IonButton slot="start" fill="clear" onClick={() => router.goBack()}>
                <X className="w-6 h-6 text-gray-600" />
            </IonButton>
            <IonTitle>Ajouter un achat</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="bg-gray-50">
      <div className="p-6 space-y-6 pb-24">
        {/* Photo Section */}
        <div className="space-y-3">
          <IonLabel className="text-sm text-gray-700 ml-1">Photo du produit *</IonLabel>
          {!photo ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-8 flex flex-col items-center gap-3 active:scale-98 transition-transform shadow-lg"
            >
              <div className="bg-white/20 p-4 rounded-full">
                <Camera className="w-8 h-8" />
              </div>
              <span className="text-lg">Prendre une photo</span>
              <span className="text-sm text-blue-100">ou télécharger une image</span>
            </button>
          ) : (
            <div className="relative">
              <img src={photo} alt="Product" className="w-full h-64 object-cover rounded-2xl" />
              <button
                type="button"
                onClick={() => setPhoto('')}
                className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full shadow-lg active:scale-95 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-3 right-3 bg-white text-gray-700 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 active:scale-95 transition"
              >
                <Upload className="w-4 h-4" />
                Changer
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden"
          />
        </div>

        {/* Product Info */}
        <div className="bg-white rounded-2xl p-5 space-y-5 shadow-sm">
          <div>
            <IonLabel className="text-sm text-gray-700 mb-2 block ml-1 font-medium">Nom du produit *</IonLabel>
            <IonItem lines="none" className="rounded-xl border border-gray-200 overflow-hidden" style={{ '--background': 'transparent', '--padding-start': '0' }}>
                <IonInput
                    value={name}
                    onIonInput={(e) => setName(e.detail.value!)}
                    placeholder="Ex: Smartphone Samsung"
                    className="px-4"
                />
            </IonItem>
          </div>

          <div>
            <IonLabel className="text-sm text-gray-700 mb-2 block ml-1 font-medium">Description</IonLabel>
            <IonItem lines="none" className="rounded-xl border border-gray-200 overflow-hidden" style={{ '--background': 'transparent', '--padding-start': '0' }}>
                <IonTextarea
                    value={description}
                    onIonInput={e => setDescription(e.detail.value!)}
                    placeholder="Détails supplémentaires..."
                    rows={3}
                    className="px-4"
                />
            </IonItem>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl p-5 space-y-5 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <IonLabel className="text-sm text-gray-700 mb-2 block ml-1 font-medium">Prix d&apos;achat *</IonLabel>
              <IonItem lines="none" className="rounded-xl border border-gray-200 overflow-hidden" style={{ '--background': 'transparent', '--padding-start': '0' }}>
                <IonInput
                    type="number"
                    step="0.01"
                    value={price}
                    onIonInput={e => setPrice(e.detail.value!)}
                    placeholder="0.00"
                    className="px-4"
                />
              </IonItem>
            </div>

            <div>
              <IonLabel className="text-sm text-gray-700 mb-2 block ml-1 font-medium">Devise *</IonLabel>
              <IonItem lines="none" className="rounded-xl border border-gray-200 overflow-hidden" style={{ '--background': 'transparent', '--padding-start': '0' }}>
                <IonSelect 
                    value={currency} 
                    onIonChange={e => setCurrency(e.detail.value)}
                    interface="popover"
                    className="w-full px-4"
                >
                  {currencies.map(curr => (
                    <IonSelectOption key={curr} value={curr}>{curr}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </div>
          </div>

          <div>
            <IonLabel className="text-sm text-gray-700 mb-2 block ml-1 font-medium">Taux de change (vers BIF)</IonLabel>
            <IonItem lines="none" className="rounded-xl border border-gray-200 overflow-hidden" style={{ '--background': 'transparent', '--padding-start': '0' }}>
                <IonInput
                    type="number"
                    step="0.01"
                    value={exchangeRate}
                    onIonInput={e => setExchangeRate(e.detail.value!)}
                    placeholder="2850"
                    className="px-4"
                />
            </IonItem>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="text-sm text-gray-600 mb-1">Prix converti</div>
            <div className="text-2xl text-blue-600">
              {convertedPrice.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} BIF
            </div>
          </div>
        </div>

        {/* Product Type */}
        <div className="space-y-3">
          <IonLabel className="text-sm text-gray-700 ml-1">Type de produit</IonLabel>
          <div className="grid grid-cols-2 gap-3">
            {productTypes.map((pt) => {
                const isSelected = type === pt.value;
                return (
                <div
                    key={pt.value}
                    onClick={() => setType(pt.value)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                >
                    <div className="text-3xl mb-1">{pt.icon}</div>
                    <div className={`text-sm ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                    {pt.label}
                    </div>
                </div>
                );
            })}
          </div>
        </div>

        {/* Packaging */}
        <div className="bg-white rounded-2xl p-5 space-y-5 shadow-sm">
          <div>
            <IonLabel className="text-sm text-gray-700 mb-2 block ml-1 font-medium">Emballage</IonLabel>
            <div className="grid grid-cols-3 gap-2">
              {packagingTypes.map((pkg) => {
                  const isSelected = packaging === pkg.value;
                  return (
                    <div
                    key={pkg.value}
                    onClick={() => setPackaging(pkg.value)}
                    className={`py-3 px-2 rounded-xl border-2 text-sm transition-all text-center cursor-pointer ${
                        isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 bg-white text-gray-700'
                    }`}
                    >
                    {pkg.label}
                    </div>
                  );
              })}
            </div>
          </div>

          {packaging === 'carton' && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <IonLabel className="text-sm text-gray-700 mb-2 block ml-1 font-medium">Pièces/carton</IonLabel>
                <IonItem lines="none" className="rounded-xl border border-gray-200 overflow-hidden" style={{ '--background': 'transparent', '--padding-start': '0' }}>
                    <IonInput
                        type="number"
                        value={piecesPerCarton}
                        onIonInput={e => setPiecesPerCarton(e.detail.value!)}
                        placeholder="12"
                        className="px-4"
                    />
                </IonItem>
              </div>
              <div>
                <IonLabel className="text-sm text-gray-700 mb-2 block ml-1 font-medium">Nb cartons</IonLabel>
                <IonItem lines="none" className="rounded-xl border border-gray-200 overflow-hidden" style={{ '--background': 'transparent', '--padding-start': '0' }}>
                    <IonInput
                        type="number"
                        value={numberOfCartons}
                        onIonInput={e => setNumberOfCartons(e.detail.value!)}
                        placeholder="10"
                        className="px-4"
                    />
                </IonItem>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <IonButton
          expand="block"
          onClick={handleSubmit}
          className="rounded-2xl shadow-lg h-14 text-lg font-medium py-2"
          style={{ '--border-radius': '1rem' }}
        >
          Enregistrer l&apos;achat
        </IonButton>
      </div>
      </IonContent>
    </IonPage>
  );
}
