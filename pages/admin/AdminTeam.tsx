import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Mail,
  Trash2,
  Plus,
  X,
  Check,
  Loader2,
  AlertCircle,
  Edit2,
  Link as LinkIcon,
  Copy,
  Ban,
  Power,
} from "lucide-react";
import { db, appId } from "../../lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
} from "firebase/firestore";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "superadmin" | "admin" | "support" | "finance";
  permissions: {
    finance: boolean;
    support: boolean;
    tech: boolean;
    sales: boolean;
  };
  status: "active" | "pending" | "inactive";
  createdAt: string;
}

const AdminTeam = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estado para o Link de Convite
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    permissions: {
      finance: false,
      support: true,
      tech: false,
      sales: false,
    },
  });

  // 1. Carregar Membros do Firestore
  useEffect(() => {
    const q = query(
      collection(db, "artifacts", appId, "team"),
      orderBy("name")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as TeamMember)
        );
        setMembers(fetched);
        setIsLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar equipe:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Handlers
  const handleOpenModal = (member?: TeamMember) => {
    setInviteLink(null);
    setIsCopied(false);

    if (member) {
      setEditingId(member.id);
      setNewMember({
        name: member.name,
        email: member.email,
        permissions: member.permissions,
      });
    } else {
      setEditingId(null);
      setNewMember({
        name: "",
        email: "",
        permissions: {
          finance: false,
          support: true,
          tech: false,
          sales: false,
        },
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!newMember.name || !newMember.email) {
      alert("Por favor, preencha o nome e o email.");
      return;
    }

    setIsSaving(true);
    try {
      const collectionRef = collection(db, "artifacts", appId, "team");
      const memberData = {
        name: newMember.name,
        email: newMember.email,
        role: "admin",
        permissions: newMember.permissions,
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        await updateDoc(doc(collectionRef, editingId), memberData);
        setIsModalOpen(false);
      } else {
        const docRef = await addDoc(collectionRef, {
          ...memberData,
          status: "pending",
          createdAt: new Date().toISOString(),
        });

        // CORREÇÃO AQUI: Alterado para apontar para /master em vez de /login
        // Adicionado '#' para suportar HashRouter corretamente
        const generatedLink = `${window.location.origin}/#/master?invite=${
          docRef.id
        }&email=${encodeURIComponent(newMember.email)}`;
        setInviteLink(generatedLink);
      }
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      alert(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este membro da equipe?")) {
      try {
        await deleteDoc(doc(db, "artifacts", appId, "team", id));
      } catch (error) {
        console.error("Erro ao excluir:", error);
      }
    }
  };

  const handleToggleStatus = async (member: TeamMember) => {
    const newStatus = member.status === "active" ? "inactive" : "active";
    const actionText =
      member.status === "active" ? "desativar (bloquear)" : "ativar";

    if (confirm(`Deseja realmente ${actionText} o acesso de ${member.name}?`)) {
      try {
        await updateDoc(doc(db, "artifacts", appId, "team", member.id), {
          status: newStatus,
        });
      } catch (error) {
        console.error("Erro ao alterar status:", error);
        alert("Erro ao alterar status.");
      }
    }
  };

  const togglePermission = (key: keyof typeof newMember.permissions) => {
    setNewMember((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "inactive":
        return "Inativo";
      default:
        return "Pendente";
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Equipe Interna</h1>
          <p className="text-gray-500">
            Gerencie quem tem acesso administrativo ao BidFlow Master.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#6C63FF] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm font-medium"
        >
          <Plus size={18} /> Convidar Membro
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-200">
            <tr>
              <th className="p-4">Membro</th>
              <th className="p-4">Permissões</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 transition group">
                <td className="p-4 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${
                      member.status === "inactive"
                        ? "bg-gray-100 text-gray-400 border-gray-200"
                        : "bg-indigo-100 text-indigo-600 border-indigo-200"
                    }`}
                  >
                    {member.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p
                      className={`font-bold ${
                        member.status === "inactive"
                          ? "text-gray-400"
                          : "text-gray-900"
                      }`}
                    >
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex gap-2 flex-wrap">
                    {member.permissions.finance && (
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs border border-green-100">
                        Financeiro
                      </span>
                    )}
                    {member.permissions.support && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100">
                        Suporte
                      </span>
                    )}
                    {member.permissions.tech && (
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs border border-purple-100">
                        Técnico
                      </span>
                    )}
                    {member.permissions.sales && (
                      <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs border border-orange-100">
                        Comercial
                      </span>
                    )}
                    {!Object.values(member.permissions).some(Boolean) && (
                      <span className="text-gray-400 text-xs italic">
                        Sem permissões
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(
                      member.status
                    )}`}
                  >
                    {getStatusLabel(member.status)}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleToggleStatus(member)}
                      className={`p-2 rounded-lg transition ${
                        member.status === "active"
                          ? "text-green-600 hover:bg-red-50 hover:text-red-600"
                          : "text-gray-400 hover:bg-green-50 hover:text-green-600"
                      }`}
                      title={
                        member.status === "active"
                          ? "Bloquear Acesso"
                          : "Ativar Acesso"
                      }
                    >
                      {member.status === "active" ? (
                        <Ban size={18} />
                      ) : (
                        <Power size={18} />
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenModal(member)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Editar Membro"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Remover Membro"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-8 text-center text-gray-500 bg-gray-50"
                >
                  <User className="mx-auto mb-2 text-gray-300" size={32} />
                  <p>Nenhum membro na equipe.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl p-0 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-lg">
                {inviteLink
                  ? "Convite Gerado!"
                  : editingId
                  ? "Editar Membro"
                  : "Convidar Membro"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!inviteLink ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome
                    </label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      placeholder="Ex: Edu"
                      value={newMember.name}
                      onChange={(e) =>
                        setNewMember({ ...newMember, name: e.target.value })
                      }
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      placeholder="email@exemplo.com"
                      value={newMember.email}
                      onChange={(e) =>
                        setNewMember({ ...newMember, email: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Permissões
                    </label>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div
                        className="flex items-center gap-3 cursor-pointer group select-none"
                        onClick={() => togglePermission("finance")}
                      >
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition ${
                            newMember.permissions.finance
                              ? "bg-[#6C63FF] border-[#6C63FF]"
                              : "bg-white border-gray-300 group-hover:border-[#6C63FF]"
                          }`}
                        >
                          {newMember.permissions.finance && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <span className="text-sm text-gray-700">
                          Financeiro
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-3 cursor-pointer group select-none"
                        onClick={() => togglePermission("support")}
                      >
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition ${
                            newMember.permissions.support
                              ? "bg-[#6C63FF] border-[#6C63FF]"
                              : "bg-white border-gray-300 group-hover:border-[#6C63FF]"
                          }`}
                        >
                          {newMember.permissions.support && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <span className="text-sm text-gray-700">Suporte</span>
                      </div>
                      <div
                        className="flex items-center gap-3 cursor-pointer group select-none"
                        onClick={() => togglePermission("tech")}
                      >
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition ${
                            newMember.permissions.tech
                              ? "bg-[#6C63FF] border-[#6C63FF]"
                              : "bg-white border-gray-300 group-hover:border-[#6C63FF]"
                          }`}
                        >
                          {newMember.permissions.tech && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <span className="text-sm text-gray-700">Técnico</span>
                      </div>
                      <div
                        className="flex items-center gap-3 cursor-pointer group select-none"
                        onClick={() => togglePermission("sales")}
                      >
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition ${
                            newMember.permissions.sales
                              ? "bg-[#6C63FF] border-[#6C63FF]"
                              : "bg-white border-gray-300 group-hover:border-[#6C63FF]"
                          }`}
                        >
                          {newMember.permissions.sales && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <span className="text-sm text-gray-700">Comercial</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <LinkIcon size={32} className="text-green-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    Membro Adicionado!
                  </h4>
                  <p className="text-sm text-gray-500 mb-6">
                    Copie o link abaixo e envie para{" "}
                    <strong>{newMember.name}</strong> para que ele possa acessar
                    a plataforma.
                  </p>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <input
                      readOnly
                      value={inviteLink}
                      className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
                    />
                    <button
                      onClick={copyToClipboard}
                      className={`p-2 rounded-md transition ${
                        isCopied
                          ? "bg-green-100 text-green-700"
                          : "hover:bg-gray-200 text-gray-500"
                      }`}
                      title="Copiar Link"
                    >
                      {isCopied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                  {isCopied && (
                    <p className="text-xs text-green-600 mt-2 font-medium">
                      Link copiado!
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              {!inviteLink ? (
                <>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-6 py-2 bg-[#6C63FF] text-white rounded-lg font-bold hover:bg-indigo-700 transition shadow-sm flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : null}
                    {isSaving
                      ? "Salvando..."
                      : editingId
                      ? "Salvar Alterações"
                      : "Criar e Gerar Link"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
                >
                  Concluído
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeam;
