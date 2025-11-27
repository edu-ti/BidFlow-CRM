import React, { useState, useEffect } from "react";
import {
  Plug,
  Activity,
  Globe,
  Key,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  X,
  ScrollText,
  Play,
  Terminal,
} from "lucide-react";
import { db, appId } from "../../lib/firebase";
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  addDoc,
} from "firebase/firestore";

interface ApiConfig {
  whatsappStatus: "operational" | "degraded" | "down";
  uptime: number;
  latency: number;
  webhookQueue: number;
  adminKey: string;
  publicKey: string;
}

interface WebhookLog {
  id: string;
  event: string;
  payload: string; // JSON string
  status: "success" | "failed" | "pending";
  timestamp: string;
  source: string;
}

const AdminIntegrations = () => {
  const [config, setConfig] = useState<ApiConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<
    "admin" | "public" | null
  >(null);
  const [copiedKey, setCopiedKey] = useState<"admin" | "public" | null>(null);

  // Estados para o Modal de Logs
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // 1. Carregar Configurações do Firestore
  useEffect(() => {
    const docRef = doc(db, "artifacts", appId, "settings", "api_config");

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setConfig(snapshot.data() as ApiConfig);
        } else {
          const initialConfig: ApiConfig = {
            whatsappStatus: "operational",
            uptime: 99.98,
            latency: 45,
            webhookQueue: 0,
            adminKey: `sk_live_${Math.random().toString(36).substring(2, 15)}`,
            publicKey: `pk_live_${Math.random().toString(36).substring(2, 15)}`,
          };
          setDoc(docRef, initialConfig).catch((e) =>
            console.error("Erro ao criar config:", e)
          );
          setConfig(initialConfig);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error("Erro de permissão:", err);
        setError("Erro ao carregar configurações. Verifique as permissões.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Carregar Logs de Webhook (apenas quando o modal abre)
  useEffect(() => {
    if (isLogModalOpen) {
      setLogsLoading(true);
      const logsRef = collection(db, "artifacts", appId, "webhook_logs");
      const q = query(logsRef, orderBy("timestamp", "desc"), limit(50));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const logs = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as WebhookLog)
        );
        setWebhookLogs(logs);
        setLogsLoading(false);
      });
      return () => unsubscribe();
    }
  }, [isLogModalOpen]);

  const handleRegenerateKey = async (type: "admin" | "public") => {
    if (!confirm(`Regenerar chave ${type === "admin" ? "Mestra" : "Pública"}?`))
      return;
    setIsRegenerating(type);
    try {
      const newKey = `${type === "admin" ? "sk" : "pk"}_live_${Math.random()
        .toString(36)
        .substring(2, 15)}`;
      await updateDoc(doc(db, "artifacts", appId, "settings", "api_config"), {
        [type === "admin" ? "adminKey" : "publicKey"]: newKey,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsRegenerating(null);
    }
  };

  const handleCopy = (key: string, type: "admin" | "public") => {
    navigator.clipboard.writeText(key);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Cria um log real no Firestore para testar
  const handleTriggerTestEvent = async () => {
    try {
      await addDoc(collection(db, "artifacts", appId, "webhook_logs"), {
        event: "message.received",
        source: "WhatsApp Gateway",
        status: Math.random() > 0.1 ? "success" : "failed",
        timestamp: new Date().toISOString(),
        payload: JSON.stringify(
          {
            from: "5511999998888",
            type: "text",
            body: "Teste de recebimento via Webhook",
          },
          null,
          2
        ),
      });
    } catch (e) {
      console.error("Erro ao criar log:", e);
      alert("Erro ao criar log. Verifique as regras do Firebase.");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-96 text-red-600">
        {error}
      </div>
    );
  if (!config) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integrações & API</h1>
        <p className="text-gray-500 mt-1">
          Gerencie as chaves de acesso e monitore o status dos gateways.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WhatsApp API Status */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl border border-green-100">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">API WhatsApp</h3>
              <p className="text-xs text-gray-500">Gateway principal</p>
            </div>
          </div>
          <div
            className={`flex items-center gap-2 text-sm p-3 rounded-lg border mb-6 ${
              config.whatsappStatus === "operational"
                ? "bg-green-50 border-green-100 text-green-700"
                : "bg-red-50 border-red-100 text-red-700"
            }`}
          >
            {config.whatsappStatus === "operational" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertTriangle size={18} />
            )}
            <span className="font-medium">
              {config.whatsappStatus === "operational"
                ? "Todos os sistemas operacionais"
                : "Falha na conexão"}
            </span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-gray-500">Uptime</span>
              <span className="font-mono font-medium">{config.uptime}%</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-500">Latência</span>
              <span className="font-mono font-medium">{config.latency}ms</span>
            </div>
          </div>
        </div>

        {/* Webhooks Status */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Webhooks Globais</h3>
              <p className="text-xs text-gray-500">
                Eventos de entrada e saída
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg border border-yellow-100 mb-6">
            <AlertTriangle size={18} />{" "}
            <span className="font-medium">
              Fila: {config.webhookQueue} eventos
            </span>
          </div>
          <div className="mt-auto">
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="w-full py-2.5 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 text-sm font-medium transition flex items-center justify-center gap-2"
            >
              <ScrollText size={16} /> Ver Logs de Webhook
            </button>
          </div>
        </div>
      </div>

      {/* Chaves de API */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Key size={20} className="text-gray-400" /> Chaves de API Globais
        </h3>
        <div className="space-y-6">
          {/* Chave Admin */}
          <div className="flex flex-col md:flex-row justify-between p-4 border border-gray-200 rounded-xl bg-gray-50/50 gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-gray-900 mb-1">
                Chave Mestra (Admin)
              </p>
              <div className="flex items-center gap-2">
                <code className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded border truncate w-full md:w-auto">
                  {config.adminKey}
                </code>
                <button
                  onClick={() => handleCopy(config.adminKey, "admin")}
                  className="p-1 text-gray-400 hover:text-indigo-600"
                >
                  {copiedKey === "admin" ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={() => handleRegenerateKey("admin")}
              disabled={isRegenerating === "admin"}
              className="text-gray-400 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50"
            >
              <RefreshCw
                size={20}
                className={isRegenerating === "admin" ? "animate-spin" : ""}
              />
            </button>
          </div>
          {/* Chave Pública */}
          <div className="flex flex-col md:flex-row justify-between p-4 border border-gray-200 rounded-xl bg-gray-50/50 gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-gray-900 mb-1">
                Chave Pública (Frontend)
              </p>
              <div className="flex items-center gap-2">
                <code className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded border truncate w-full md:w-auto">
                  {config.publicKey}
                </code>
                <button
                  onClick={() => handleCopy(config.publicKey, "public")}
                  className="p-1 text-gray-400 hover:text-indigo-600"
                >
                  {copiedKey === "public" ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={() => handleRegenerateKey("public")}
              disabled={isRegenerating === "public"}
              className="text-gray-400 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50"
            >
              <RefreshCw
                size={20}
                className={isRegenerating === "public" ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Logs Real */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <Terminal size={20} className="text-gray-500" />
                <h3 className="font-bold text-gray-800">
                  Logs de Webhook em Tempo Real
                </h3>
              </div>
              <button onClick={() => setIsLogModalOpen(false)}>
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-0 bg-gray-900 font-mono text-xs">
              {logsLoading ? (
                <div className="flex justify-center items-center h-full text-gray-400">
                  <Loader2 className="animate-spin mr-2" /> Carregando logs...
                </div>
              ) : webhookLogs.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-gray-500">
                  <AlertCircle size={32} className="mb-2 opacity-50" />
                  <p>Nenhum evento registado.</p>
                  <p className="opacity-50">Aguardando novos eventos...</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-800 text-gray-400 sticky top-0">
                    <tr>
                      <th className="p-3 w-32">Status</th>
                      <th className="p-3 w-48">Timestamp</th>
                      <th className="p-3 w-48">Evento</th>
                      <th className="p-3">Payload</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-gray-300">
                    {webhookLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-800/50 transition"
                      >
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              log.status === "success"
                                ? "bg-green-900 text-green-400"
                                : log.status === "pending"
                                ? "bg-yellow-900 text-yellow-400"
                                : "bg-red-900 text-red-400"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 text-blue-400">{log.event}</td>
                        <td
                          className="p-3 font-mono text-[10px] text-gray-500 truncate max-w-xs"
                          title={log.payload}
                        >
                          {log.payload}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center">
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Conectado ao stream de eventos
              </p>
              <button
                onClick={handleTriggerTestEvent}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center gap-2"
              >
                <Play size={14} /> Disparar Evento Teste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminIntegrations;
