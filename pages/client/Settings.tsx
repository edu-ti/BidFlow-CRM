import React, { useState, useRef } from "react";
import {
  User,
  Bell,
  Shield,
  Smartphone,
  QrCode,
  LogOut,
  Save,
  Lock,
  Monitor,
  ChevronRight,
  Check,
} from "lucide-react";
import ConfirmModal, { ConfirmModalType } from "../../components/ConfirmModal";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile State
  const [profile, setProfile] = useState({
    name: "Alex Vendor",
    role: "Gerente de Vendas",
    email: "alex@company.com",
    avatar: "https://picsum.photos/200",
  });

  // Security State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [showDevices, setShowDevices] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  // Confirm Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    type: ConfirmModalType;
    onConfirm?: () => void;
    confirmText?: string;
    showCancel?: boolean;
  }>({
    title: "",
    message: "",
    type: "info",
  });

  const showAlert = (
    title: string,
    message: string,
    type: ConfirmModalType = "info"
  ) => {
    setConfirmConfig({
      title,
      message,
      type,
      showCancel: false,
      confirmText: "OK",
      onConfirm: () => setIsConfirmOpen(false),
    });
    setIsConfirmOpen(true);
  };

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, avatar: url }));
    }
  };

  const handleSaveProfile = () => {
    // In a real app, this would send data to backend
    const btn = document.getElementById("save-profile-btn");
    if (btn) {
      const originalContent = btn.innerHTML;
      btn.innerHTML = "Salvo!";
      btn.classList.remove("bg-indigo-600", "hover:bg-indigo-700");
      btn.classList.add("bg-green-600", "hover:bg-green-700");

      setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.classList.add("bg-indigo-600", "hover:bg-indigo-700");
        btn.classList.remove("bg-green-600", "hover:bg-green-700");
      }, 2000);
    }
  };

  const handlePasswordReset = () => {
    setPasswordResetSent(true);
    setTimeout(() => setPasswordResetSent(false), 3000);
  };

  const handleDeviceToggle = () => {
    setShowDevices(!showDevices);
  };

  const handle2FAToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
  };

  const handleDisconnect = () => {
    setConfirmConfig({
      title: "Desconectar Sessão",
      message: "Deseja realmente desconectar a sessão do WhatsApp?",
      type: "warning",
      showCancel: true,
      confirmText: "Desconectar",
      onConfirm: () => {
        // Aqui iria a lógica de desconexão
        setIsConfirmOpen(false);
        setTimeout(() => {
          showAlert("Sucesso", "Sessão do WhatsApp desconectada.", "success");
        }, 300);
      },
    });
    setIsConfirmOpen(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition ${
              activeTab === "profile"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <User size={18} /> Perfil
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition ${
              activeTab === "notifications"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Bell size={18} /> Notificações
          </button>
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition ${
              activeTab === "whatsapp"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Smartphone size={18} /> Conexão WhatsApp
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition ${
              activeTab === "security"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Shield size={18} /> Segurança
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8">
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Perfil do Usuário
                </h2>
                <p className="text-gray-500 text-sm">
                  Gerencie suas informações pessoais.
                </p>
              </div>

              <div className="flex items-center gap-6">
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <button
                  onClick={handlePhotoUpload}
                  className="h-10 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
                >
                  Alterar Foto
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#333333] border border-transparent text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={profile.role}
                    onChange={(e) =>
                      setProfile({ ...profile, role: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#333333] border border-transparent text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  id="save-profile-btn"
                  onClick={handleSaveProfile}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition font-medium shadow-sm"
                >
                  <Save size={18} /> Salvar Alterações
                </button>
              </div>
            </div>
          )}

          {activeTab === "whatsapp" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Conexão WhatsApp
                </h2>
                <p className="text-gray-500 text-sm">
                  Gerencie a conexão da sua instância.
                </p>
              </div>

              <div className="bg-[#f0fdf4] border border-green-100 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <QrCode size={120} className="text-gray-800" />
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-lg font-bold text-green-800 mb-2">
                    Conectado com Sucesso
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-green-700">
                      Instância:{" "}
                      <span className="font-semibold text-green-900">
                        Vendas Principal
                      </span>
                    </p>
                    <p className="text-green-700">
                      Número:{" "}
                      <span className="font-semibold text-green-900">
                        +55 11 99999-9999
                      </span>
                    </p>
                    <p className="text-green-700 flex items-center justify-center md:justify-start gap-1">
                      Status:{" "}
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>{" "}
                      <span className="font-semibold text-green-900">
                        Online
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={handleDisconnect}
                    className="mt-4 text-red-600 text-sm font-medium hover:text-red-700 flex items-center justify-center md:justify-start gap-1 transition-colors"
                  >
                    <LogOut size={14} /> Desconectar Sessão
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Configurações da Instância
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer bg-white">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        defaultChecked
                      />
                    </div>
                    <span className="text-sm text-gray-700">
                      Ignorar chamadas de voz
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer bg-white">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        defaultChecked
                      />
                    </div>
                    <span className="text-sm text-gray-700">
                      Ler mensagens automaticamente
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Preferências de Notificação
                </h2>
                <p className="text-gray-500 text-sm">
                  Escolha como e quando você quer ser notificado.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                  <div>
                    <h4 className="font-medium text-gray-900">Novos Leads</h4>
                    <p className="text-sm text-gray-500">
                      Receber alerta quando um novo lead entrar no funil.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Mensagens Recebidas
                    </h4>
                    <p className="text-sm text-gray-500">
                      Notificar a cada nova mensagem no chat.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Relatórios Semanais
                    </h4>
                    <p className="text-sm text-gray-500">
                      Receber resumo de performance por email.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Segurança</h2>
                <p className="text-gray-500 text-sm">
                  Proteja sua conta e dados.
                </p>
              </div>

              <div
                className={`p-4 border rounded-lg flex items-center justify-between ${
                  twoFactorEnabled
                    ? "bg-indigo-50 border-indigo-100 text-indigo-800"
                    : "bg-gray-50 border-gray-200 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield
                    size={18}
                    className={
                      twoFactorEnabled ? "text-indigo-600" : "text-gray-500"
                    }
                  />
                  <span>
                    Autenticação de Dois Fatores (2FA) está{" "}
                    <strong>
                      {twoFactorEnabled ? "ativada" : "desativada"}
                    </strong>
                    .
                  </span>
                </div>
                <button
                  onClick={handle2FAToggle}
                  className={`font-medium text-xs border px-3 py-1.5 rounded shadow-sm transition ${
                    twoFactorEnabled
                      ? "text-red-600 border-red-200 bg-white hover:bg-red-50"
                      : "text-green-600 border-green-200 bg-white hover:bg-green-50"
                  }`}
                >
                  {twoFactorEnabled ? "Desativar" : "Ativar"}
                </button>
              </div>

              <div className="space-y-4 pt-2">
                <button
                  onClick={handlePasswordReset}
                  className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        passwordResetSent
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-600 group-hover:text-indigo-600 group-hover:bg-indigo-50"
                      }`}
                    >
                      {passwordResetSent ? (
                        <Check size={20} />
                      ) : (
                        <Lock size={20} />
                      )}
                    </div>
                    <div className="text-left">
                      <h4
                        className={`font-medium ${
                          passwordResetSent
                            ? "text-green-600"
                            : "text-indigo-600"
                        }`}
                      >
                        {passwordResetSent
                          ? "Email de recuperação enviado!"
                          : "Alterar Senha"}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {passwordResetSent
                          ? "Verifique sua caixa de entrada"
                          : "Atualize sua senha periodicamente"}
                      </p>
                    </div>
                  </div>
                  {!passwordResetSent && (
                    <ChevronRight
                      size={18}
                      className="text-gray-400 group-hover:text-indigo-600"
                    />
                  )}
                </button>

                <div>
                  <button
                    onClick={handleDeviceToggle}
                    className={`flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition group ${
                      showDevices ? "rounded-b-none border-b-0" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-600 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                        <Monitor size={20} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-indigo-600">
                          Ver Dispositivos Conectados
                        </h4>
                        <p className="text-xs text-gray-500">
                          Gerencie onde sua conta está logada
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      className={`text-gray-400 group-hover:text-indigo-600 transition-transform ${
                        showDevices ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {showDevices && (
                    <div className="border border-t-0 border-gray-200 rounded-b-lg bg-gray-50 p-4 space-y-3 animate-in slide-in-from-top-2">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <Monitor size={16} className="text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">
                              Windows PC - Chrome
                            </p>
                            <p className="text-xs text-gray-500">
                              São Paulo, BR • Atual (Este dispositivo)
                            </p>
                          </div>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Online
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <Smartphone size={16} className="text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">
                              iPhone 13 - App
                            </p>
                            <p className="text-xs text-gray-500">
                              Rio de Janeiro, BR • Há 2 horas
                            </p>
                          </div>
                        </div>
                        <button className="text-xs text-red-600 hover:underline">
                          Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        onConfirm={confirmConfig.onConfirm}
        confirmText={confirmConfig.confirmText}
        showCancel={confirmConfig.showCancel}
      />
    </div>
  );
};

export default Settings;
