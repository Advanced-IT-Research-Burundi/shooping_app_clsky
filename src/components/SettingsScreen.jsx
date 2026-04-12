import React, { useState } from "react";
import { 
  ArrowLeft, User, Mail, Save, CheckCircle2, UserPlus, 
  Lock, Loader2, AlertCircle, Users, ShieldCheck, MailPlus,
  Pencil, X, Check, Power, PowerOff
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useDispatch } from "react-redux";
import { 
  useUpdateProfileMutation, 
  useAddUserMutation,
  useGetUsersQuery,
  useUpdateUserDataMutation
} from "../features/auth/apiSlicer";
import { updateUser } from "../features/auth/authSlice";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function SettingsScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const context = useOutletContext() || {};
  const currentUser = context.user || { name: "Utilisateur", email: "user@example.com" };

  // Profile State
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

  // Add User State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [addUser, { isLoading: isAddingUser }] = useAddUserMutation();

  // User Management State
  const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery();
  const [updateUserData, { isLoading: isUpdatingUser }] = useUpdateUserDataMutation();
  const [editingUserId, setEditingUserId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const [activeTab, setActiveTab] = useState("profile"); // 'profile' or 'users'
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: "", message: "" }), 4000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await updateProfile({ name, email }).unwrap();
      dispatch(updateUser(response.user));
      showFeedback("success", "Profil mis à jour !");
    } catch (err) {
      showFeedback("error", err.data?.message || "Erreur de mise à jour.");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await addUser({ 
        name: newName, 
        email: newEmail, 
        password: newPassword
      }).unwrap();
      
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      showFeedback("success", "Utilisateur ajouté !");
    } catch (err) {
      showFeedback("error", err.data?.message || "Erreur lors de l'ajout.");
    }
  };

  const startEditing = (user) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
  };

  const cancelEditing = () => {
    setEditingUserId(null);
  };

  const handleSaveUser = async (user) => {
    try {
      await updateUserData({ 
        id: user.id, 
        name: editName, 
        email: editEmail 
      }).unwrap();
      setEditingUserId(null);
      showFeedback("success", "Informations mises à jour !");
    } catch (err) {
      showFeedback("error", err.data?.message || "Erreur lors de la mise à jour.");
    }
  };

  const toggleStatus = async (user) => {
    try {
      await updateUserData({ 
        id: user.id, 
        is_active: !user.is_active,
        // We must provide name/email or the backend validation will fail
        name: user.name,
        email: user.email
      }).unwrap();
      showFeedback("success", user.is_active ? "Compte désactivé" : "Compte activé");
    } catch (err) {
      showFeedback("error", "Impossible de changer le statut.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 active:bg-gray-100 rounded-xl transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Paramètres</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 py-4 flex gap-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 px-6 py-3 rounded-2xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${
            activeTab === "profile" 
            ? "bg-gray-900 text-white shadow-lg shadow-gray-200" 
            : "bg-white text-gray-500 border border-gray-100"
          }`}
        >
          <User className="w-4 h-4" />
          Mon Profil
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 px-6 py-3 rounded-2xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${
            activeTab === "users" 
            ? "bg-gray-900 text-white shadow-lg shadow-gray-200" 
            : "bg-white text-gray-500 border border-gray-100"
          }`}
        >
          <Users className="w-4 h-4" />
          Utilisateurs
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1">
        {/* Feedback Alert */}
        {feedback.message && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
            feedback.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
          }`}>
            {feedback.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <p className="text-sm font-medium">{feedback.message}</p>
          </div>
        )}

        {activeTab === "profile" ? (
          <section className="animate-in slide-in-from-right-4 duration-300 space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-gray-900">Mes Informations</h2>
                <p className="text-gray-400 text-sm">Gérez vos accès personnels</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    icon={<User className="text-gray-400" />}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail className="text-gray-400" />}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full bg-gray-900 text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition disabled:opacity-50"
                >
                  {isUpdatingProfile ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Enregistrer</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>
        ) : (
          <section className="animate-in slide-in-from-left-4 duration-300 space-y-6">
            {/* Add User Section */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Ajouter un membre</h2>
                  <p className="text-gray-400 text-sm">Créez un nouvel accès</p>
                </div>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4">
                <Input
                  placeholder="Nom complet"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  icon={<User size={18} />}
                />
                <Input
                  type="email"
                  placeholder="Adresse email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  icon={<Mail size={18} />}
                />
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  icon={<Lock size={18} />}
                />
                <button
                  type="submit"
                  disabled={isAddingUser}
                  className="w-full bg-orange-500 text-white h-12 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 transition disabled:opacity-50"
                >
                  {isAddingUser ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Ajouter</span>}
                </button>
              </form>
            </div>

            {/* Users List Section */}
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                <h3 className="font-bold text-gray-900">Membres de l'équipe</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {isLoadingUsers ? (
                  <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                ) : (
                  users?.map((u) => (
                    <div key={u.id} className={`p-4 transition ${u.is_active === false ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                      {editingUserId === u.id ? (
                        <div className="space-y-3 p-2 bg-gray-50 rounded-2xl animate-in zoom-in-95 duration-200">
                          <Input 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Nom"
                            className="bg-white h-10 text-sm"
                          />
                          <Input 
                            value={editEmail} 
                            onChange={(e) => setEditEmail(e.target.value)}
                            placeholder="Email"
                            className="bg-white h-10 text-sm"
                          />
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleSaveUser(u)}
                              disabled={isUpdatingUser}
                              className="flex-1 bg-green-500 text-white h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                            >
                              {isUpdatingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Enregistrer</>}
                            </button>
                            <button 
                              onClick={cancelEditing}
                              className="px-4 bg-gray-200 text-gray-600 h-10 rounded-xl font-bold text-xs flex items-center justify-center"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center relative ${u.is_active === false ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600'}`}>
                            <User className="w-5 h-5" />
                            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${u.is_active === false ? 'bg-gray-300' : 'bg-green-500'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-gray-900 truncate text-sm">{u.name}</p>
                                {u.email === currentUser.email && <span className="bg-blue-50 text-blue-600 text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter">Vous</span>}
                            </div>
                            <p className="text-gray-400 text-xs truncate">{u.email}</p>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => startEditing(u)}
                              className="p-2 text-gray-400 hover:text-blue-600 active:bg-blue-50 rounded-lg transition"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {u.email !== currentUser.email && (
                              <button 
                                onClick={() => toggleStatus(u)}
                                className={`p-2 rounded-lg transition ${u.is_active === false ? 'text-green-500 hover:bg-green-50' : 'text-red-400 hover:bg-red-50'}`}
                              >
                                {u.is_active === false ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {/* Info Card */}
        <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-100 flex items-start gap-4 mx-2">
          <div className="p-2 bg-white/10 rounded-xl"><ShieldCheck className="w-5 h-5 text-indigo-100" /></div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white">Transparence totale</h4>
            <p className="text-indigo-100 text-xs leading-relaxed opacity-90">
              Chaque membre peut gérer les accès de l'équipe pour une collaboration fluide et agile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
