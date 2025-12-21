import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { home, add, bag, person } from 'ionicons/icons';
import { ProductProvider } from './context/ProductContext';
import { Home } from './pages/Home';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { AddPurchase } from './pages/AddPurchase';
import { Profile } from './pages/Profile';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './index.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <ProductProvider>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/home">
              <Home />
            </Route>
            <Route exact path="/products">
              <ProductList />
            </Route>
            <Route path="/products/:id">
              <ProductDetail />
            </Route>
            <Route exact path="/add">
              <AddPurchase />
            </Route>
            <Route exact path="/profile">
              <Profile />
            </Route>
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
          </IonRouterOutlet>

          <IonTabBar slot="bottom" className="h-20 border-t border-gray-200">
            <IonTabButton tab="home" href="/home">
              <IonIcon icon={home} />
              <IonLabel>Accueil</IonLabel>
            </IonTabButton>
            
            <IonTabButton tab="add" href="/add" className="overflow-visible">
               {/* Custom Add Button Styling Attempt to mimic original */}
              <div className="bg-blue-600 w-14 h-14 rounded-full flex items-center justify-center shadow-lg -mt-8 border-4 border-white">
                <IonIcon icon={add} className="text-white text-2xl" />
              </div>
              <IonLabel className="mt-1">Ajouter</IonLabel>
            </IonTabButton>

            <IonTabButton tab="products" href="/products">
              <IonIcon icon={bag} />
              <IonLabel>Produits</IonLabel>
            </IonTabButton>

            <IonTabButton tab="profile" href="/profile">
              <IonIcon icon={person} />
              <IonLabel>Profil</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </ProductProvider>
  </IonApp>
);

export default App;
