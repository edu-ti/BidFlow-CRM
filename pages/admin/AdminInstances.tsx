import React, { useState, useEffect } from "react";
import { RefreshCw, Power, Smartphone, Loader2 } from "lucide-react";
import { db, appId } from "../../lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  collectionGroup,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import ConfirmModal, { ConfirmModalType } from "../../components/ConfirmModal";

interface WhatsAppInstance {
  id: string;
  companyId: string;
  companyName?: string; // Nome da empresa (join manual)
  name: string; // Nome da instância (ex: Vendas)
  status: "CONNECTED" | "DISCONNECTED" | "QRCODE" | "PAIRING";
  phoneNumber?: string;
  batteryLevel?: number;
  lastSync?: string;
  ref: any; // Referência do documento para update
}

const AdminInstances = () => {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companiesMap, setCompaniesMap] = useState<Record<string, string>>({});

  // Estado para o Modal de Confirmação
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    type: ConfirmModalType;
    onConfirm: () => void;
    confirmText: string;
    showCancel?: boolean;
  }>({
    title: "",
    message: "",
    type: "info",
    onConfirm: () => {},
    confirmText: "Confirmar",
  });

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: ConfirmModalType = "warning"
  ) => {
    setConfirmConfig({
      title,
      message,
      type,
      showCancel: true,
      confirmText: "Confirmar",
      onConfirm: () => {
        onConfirm();
        setIsConfirmOpen(false);
      },
    });
    setIsConfirmOpen(true);
  };

  // 1. Carregar nomes das empresas para exibir nos cards (Mapeamento ID -> Nome)
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // Busca única das empresas para criar o dicionário
        const q = query(collection(db, "artifacts", appId, "companies"));
        const snapshot = await getDocs(q);
        const map: Record<string, string> = {};
        snapshot.forEach((doc) => {
          map[doc.id] = doc.data().name;
        });
        setCompaniesMap(map);
      } catch (e) {
        console.error("Erro ao carregar empresas:", e);
      }
    };
    fetchCompanies();
  }, []);

  // 2. Carregar TODAS as instâncias (Collection Group Query)
  useEffect(() => {
    // 'instances' é o nome da sub-coleção dentro de cada empresa
    // collectionGroup busca em TODAS as sub-coleções com esse nome
    const q = query(collectionGroup(db, "instances"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedInstances = snapshot.docs.map((doc) => {
          // O pai do documento é a coleção 'instances', o pai da coleção é o documento da Empresa
          // Path: companies/{COMPANY_ID}/instances/{INSTANCE_ID}
          const parentCompanyId = doc.ref.parent.parent?.id || "";

          return {
            id: doc.id,
            companyId: parentCompanyId,
            ...doc.data(),
            ref: doc.ref,
          } as WhatsAppInstance;
        });
        setInstances(fetchedInstances);
        setIsLoading(false);
      },
      (error) => {
        console.error("Erro ao buscar instâncias:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 3. Ações
  const handleRestart = async (inst: WhatsAppInstance) => {
    showConfirm(
      "Reiniciar Instância",
      `Deseja reiniciar a conexão de ${inst.name}? Isso pode causar uma breve interrupção.`,
      async () => {
        try {
          // Simula reinício: Pairing -> Connected
          await updateDoc(inst.ref, { status: "PAIRING" });
          setTimeout(async () => {
            await updateDoc(inst.ref, {
              status: "CONNECTED",
              lastSync: new Date().toISOString(),
            });
          }, 2000);
        } catch (e) {
          console.error(e);
        }
      },
      "info"
    );
  };

  const handleDisconnect = async (inst: WhatsAppInstance) => {
    showConfirm(
      "Desconectar Instância",
      `Deseja realmente desconectar ${inst.name}? Isso irá parar o envio de mensagens imediatamente.`,
      async () => {
        try {
          await updateDoc(inst.ref, {
            status: "DISCONNECTED",
            phoneNumber: "",
            batteryLevel: 0,
          });
        } catch (e) {
          console.error(e);
        }
      },
      "error"
    );
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "-";
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Agora mesmo";
    if (minutes < 60) return `${minutes} min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} horas atrás`;
    return `${Math.floor(hours / 24)} dias atrás`;
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      </div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Gerenciador de Instâncias WA
      </h1>

      {instances.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
          <Smartphone size={48} className="mb-4 text-gray-300" />
          <p className="text-lg font-medium">Nenhuma instância encontrada</p>
          <p className="text-sm">
            Adicione instâncias através da aba "Instância WA" dentro dos
            detalhes de cada empresa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {instances.map((inst) => {
            const companyName =
              companiesMap[inst.companyId] || "Empresa Desconhecida";
            const isOnline = inst.status === "CONNECTED";

            return (
              <div
                key={inst.id}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden flex flex-col h-full"
              >
                {/* Borda Status Lateral */}
                <div
                  className={`absolute top-0 left-0 w-1.5 h-full ${
                    isOnline ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>

                {/* Header do Card */}
                <div className="flex justify-between items-start mb-6 pl-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-lg ${
                        isOnline
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      <Smartphone size={24} />
                    </div>
                    <div>
                      {/* Nome da Empresa em destaque */}
                      <h3 className="font-bold text-gray-900 text-base">
                        {companyName}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono">
                        ID: {inst.id.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isOnline
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {isOnline ? "ONLINE" : "OFFLINE"}
                  </span>
                </div>

                {/* Informações Técnicas */}
                <div className="space-y-3 mb-6 pl-2 flex-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Número</span>
                    <span className="font-medium text-gray-900">
                      {inst.phoneNumber || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Bateria</span>
                    <span className="font-medium text-gray-900 flex items-center gap-1">
                      {inst.batteryLevel ? `${inst.batteryLevel}%` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Sincronização</span>
                    <span className="font-medium text-gray-900">
                      {formatTimeAgo(inst.lastSync)}
                    </span>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-3 pl-2 mt-auto pt-4 border-t border-gray-50">
                  <button
                    onClick={() => handleRestart(inst)}
                    className="flex-1 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition"
                  >
                    <RefreshCw size={14} /> Reiniciar
                  </button>
                  <button
                    onClick={() => handleDisconnect(inst)}
                    className="flex-1 py-2 border border-red-100 bg-red-50 rounded-lg text-xs font-bold text-red-600 hover:bg-red-100 flex items-center justify-center gap-2 transition"
                  >
                    <Power size={14} /> Desconectar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmação */}
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

export default AdminInstances;
