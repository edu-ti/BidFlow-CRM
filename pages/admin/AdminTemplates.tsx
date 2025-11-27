import React, { useState, useEffect } from "react";
import {
  LayoutTemplate,
  MessageSquare,
  Filter,
  Play,
  Edit3,
  Trash2,
  Plus,
  X,
  Bot,
  Megaphone,
  Loader2,
  Search,
  Save,
  AlertCircle,
  GitFork,
  Tag,
  Clock,
  FileText,
  CheckSquare,
} from "lucide-react";
import { db, appId } from "../../lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

// Definição estrita dos tipos permitidos
type TemplateType =
  | "Chatbot"
  | "Funil"
  | "Campanha"
  | "Respostas Prontas"
  | "Fluxo de Atendimento"
  | "Tags / Etiquetas"
  | "Sequências de Follow-up"
  | "Scripts de Vendas"
  | "Onboarding / Setup Inicial";

interface Template {
  id: string;
  name: string;
  category: string;
  type: TemplateType;
  description: string;
  createdAt: string;
}

const AdminTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Template>>({
    name: "",
    category: "",
    type: "Chatbot",
    description: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // 1. Carregar Templates do Firestore
  useEffect(() => {
    const q = query(
      collection(db, "artifacts", appId, "templates"),
      orderBy("name")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Template)
        );
        setTemplates(fetched);
        setIsLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar templates:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Handlers (Salvar, Editar, Deletar)
  const openModal = (tpl?: Template) => {
    if (tpl) {
      setEditingId(tpl.id);
      setFormData({ ...tpl });
    } else {
      setEditingId(null);
      setFormData({ name: "", category: "", type: "Chatbot", description: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category) {
      alert("Por favor, preencha o Nome e a Categoria.");
      return;
    }

    setIsSaving(true);
    try {
      const ref = collection(db, "artifacts", appId, "templates");
      const dataToSave = {
        name: formData.name,
        category: formData.category,
        type: formData.type || "Chatbot",
        description: formData.description || "",
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        await updateDoc(doc(ref, editingId), dataToSave);
      } else {
        await addDoc(ref, {
          ...dataToSave,
          createdAt: new Date().toISOString(),
        });
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      alert(`Erro ao salvar: ${error.message}. Verifique as permissões.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este template?")) {
      try {
        await deleteDoc(doc(db, "artifacts", appId, "templates", id));
      } catch (error) {
        console.error("Erro ao excluir:", error);
      }
    }
  };

  // 3. Helpers Visuais - Ícones e Cores para cada tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Chatbot":
        return <Bot size={24} className="text-indigo-600" />;
      case "Funil":
        return <Filter size={24} className="text-orange-600" />;
      case "Campanha":
        return <Megaphone size={24} className="text-green-600" />;
      case "Respostas Prontas":
        return <MessageSquare size={24} className="text-blue-500" />;
      case "Fluxo de Atendimento":
        return <GitFork size={24} className="text-purple-500" />;
      case "Tags / Etiquetas":
        return <Tag size={24} className="text-yellow-600" />;
      case "Sequências de Follow-up":
        return <Clock size={24} className="text-teal-600" />;
      case "Scripts de Vendas":
        return <FileText size={24} className="text-red-500" />;
      case "Onboarding / Setup Inicial":
        return <CheckSquare size={24} className="text-cyan-600" />;
      default:
        return <LayoutTemplate size={24} className="text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Chatbot":
        return "bg-indigo-50 border-indigo-100 text-indigo-700";
      case "Funil":
        return "bg-orange-50 border-orange-100 text-orange-700";
      case "Campanha":
        return "bg-green-50 border-green-100 text-green-700";
      case "Respostas Prontas":
        return "bg-blue-50 border-blue-100 text-blue-700";
      case "Fluxo de Atendimento":
        return "bg-purple-50 border-purple-100 text-purple-700";
      case "Tags / Etiquetas":
        return "bg-yellow-50 border-yellow-100 text-yellow-700";
      case "Sequências de Follow-up":
        return "bg-teal-50 border-teal-100 text-teal-700";
      case "Scripts de Vendas":
        return "bg-red-50 border-red-100 text-red-700";
      case "Onboarding / Setup Inicial":
        return "bg-cyan-50 border-cyan-100 text-cyan-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Templates Globais
          </h1>
          <p className="text-gray-500">
            Crie modelos prontos para agilizar o setup dos seus clientes.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-[#6C63FF] text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm font-medium"
        >
          <Plus size={18} /> Criar Template
        </button>
      </div>

      {/* Barra de Pesquisa */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por nome ou categoria..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Todos os Tipos</option>
          <option value="Chatbot">Chatbot</option>
          <option value="Funil">Funil</option>
          <option value="Campanha">Campanha</option>
          <option value="Respostas Prontas">Respostas Prontas</option>
          <option value="Fluxo de Atendimento">Fluxo de Atendimento</option>
          <option value="Tags / Etiquetas">Tags / Etiquetas</option>
          <option value="Sequências de Follow-up">
            Sequências de Follow-up
          </option>
          <option value="Scripts de Vendas">Scripts de Vendas</option>
          <option value="Onboarding / Setup Inicial">
            Onboarding / Setup Inicial
          </option>
        </select>
      </div>

      {/* Grid de Templates */}
      {filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
          <LayoutTemplate size={48} className="mb-4 text-gray-300" />
          <p className="text-lg font-medium">Nenhum template encontrado</p>
          <p className="text-sm">
            Crie o primeiro modelo para disponibilizar aos clientes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition group flex flex-col"
            >
              {/* Cabeçalho do Card */}
              <div className="flex justify-between items-start mb-2">
                <h3
                  className="font-bold text-gray-900 text-base truncate w-full"
                  title={tpl.name}
                >
                  {tpl.name}
                </h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 bg-white shadow-sm rounded-lg border border-gray-100">
                  <button
                    onClick={() => handleDelete(tpl.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Subtítulo (Tipo • Categoria) */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase truncate max-w-[60%] ${getTypeColor(
                    tpl.type
                  )}`}
                >
                  {tpl.type}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  • {tpl.category}
                </span>
              </div>

              {/* Ícone Central */}
              <div className="flex justify-center my-4">
                <div className={`p-4 rounded-2xl bg-gray-50`}>
                  {getTypeIcon(tpl.type)}
                </div>
              </div>

              <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1 text-center h-10">
                {tpl.description || "Sem descrição definida."}
              </p>

              {/* Botão Editar */}
              <button
                onClick={() => openModal(tpl)}
                className="w-full py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-100 transition mt-auto"
              >
                Editar Detalhes
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl p-0 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-lg">
                {editingId ? "Editar Template" : "Novo Template"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Modelo
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  placeholder="Ex: Fluxo Agendamento Clínica"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    placeholder="Ex: Saúde, Vendas"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as TemplateType,
                      })
                    }
                  >
                    <option value="Chatbot">Chatbot</option>
                    <option value="Funil">Funil</option>
                    <option value="Campanha">Campanha</option>
                    <option value="Respostas Prontas">Respostas Prontas</option>
                    <option value="Fluxo de Atendimento">
                      Fluxo de Atendimento
                    </option>
                    <option value="Tags / Etiquetas">Tags / Etiquetas</option>
                    <option value="Sequências de Follow-up">
                      Sequências de Follow-up
                    </option>
                    <option value="Scripts de Vendas">Scripts de Vendas</option>
                    <option value="Onboarding / Setup Inicial">
                      Onboarding / Setup Inicial
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none h-24"
                  placeholder="Descreva o objetivo deste template..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-[#6C63FF] text-white rounded-lg font-bold hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {isSaving ? "Salvando..." : "Salvar Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTemplates;
