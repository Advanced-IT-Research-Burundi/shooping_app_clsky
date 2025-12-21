import React from 'react';
import { User, Settings, Bell, HelpCircle, LogOut, ChevronRight, Shield } from 'lucide-react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonItem, IonList, IonLabel, IonIcon, IonAvatar, IonText } from '@ionic/react';

export function Profile() {
  return (
    <IonPage>
      <IonContent fullscreen className="bg-gray-50">
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white px-6 pt-12 pb-16">
          <h1 className="text-2xl mb-8 font-bold">Profil</h1>
          
          {/* User Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 flex items-center gap-4">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl mb-1 font-semibold">Commerçant</h2>
              <p className="text-blue-100 text-sm">commercial@exemple.com</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-6 -mt-8 space-y-4">
          {/* Settings Group */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
             <IonList lines="full" className="rounded-2xl py-0">
                <MenuItem
                    icon={<Settings className="w-5 h-5" />}
                    label="Paramètres"
                    iconBg="bg-blue-100"
                    iconColor="text-blue-600"
                />
                <MenuItem
                    icon={<Bell className="w-5 h-5" />}
                    label="Notifications"
                    iconBg="bg-purple-100"
                    iconColor="text-purple-600"
                />
                <MenuItem
                    icon={<Shield className="w-5 h-5" />}
                    label="Sécurité & Confidentialité"
                    iconBg="bg-green-100"
                    iconColor="text-green-600"
                    last
                />
             </IonList>
          </div>

          {/* Help Group */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <IonList lines="none" className="rounded-2xl py-0">
                <MenuItem
                    icon={<HelpCircle className="w-5 h-5" />}
                    label="Centre d'aide"
                    iconBg="bg-orange-100"
                    iconColor="text-orange-600"
                    last
                />
            </IonList>
          </div>

          {/* Logout */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
             <IonList lines="none" className="rounded-2xl py-0">
                <MenuItem
                    icon={<LogOut className="w-5 h-5" />}
                    label="Déconnexion"
                    iconBg="bg-red-100"
                    iconColor="text-red-600"
                    showChevron={false}
                    last
                />
             </IonList>
          </div>

          {/* App Info */}
          <div className="text-center py-6 text-sm text-gray-500">
            Version 1.0.0
          </div>
        </div>
      </div>
      </IonContent>
    </IonPage>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  iconBg: string;
  iconColor: string;
  showChevron?: boolean;
  last?: boolean;
}

function MenuItem({ icon, label, iconBg, iconColor, showChevron = true, last }: MenuItemProps) {
  return (
    <IonItem button detail={false} lines={last ? 'none' : 'full'} className="ion-no-padding"> 
        <div className="w-full flex items-center gap-4 p-4">
            <div className={`${iconBg} ${iconColor} p-2 rounded-xl`}>
                {icon}
            </div>
            <span className="flex-1 text-left text-gray-900">{label}</span>
            {showChevron && <ChevronRight className="w-5 h-5 text-gray-400" />}
        </div>
    </IonItem>
  );
}
