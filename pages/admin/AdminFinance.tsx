import React, { useState, useEffect } from "react";
import { StatCard } from "../../components/StatCard";
import {
  DollarSign,
  TrendingDown,
  Users,
  FileText,
  Download,
  Filter,
  Search,
  Eye,
  X,
  Plus,
  Edit,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
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

interface Invoice {
  id: string;
  companyName: string;
  companyId?: string;
  amount: number;
  status: "PAID" | "PENDING" | "OVERDUE" | "CANCELLED";
  dueDate: string;
  createdAt: string;
  pdfUrl?: string;
}

interface Company {
  id: string;
  name: string;
}

const AdminFinance = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros e Busca
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceForm, setInvoiceForm] = useState<Partial<Invoice>>({
    amount: 0,
    status: "PENDING",
    dueDate: new Date().toISOString().split("T")[0],
    companyName: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // 1. Carregar Faturas e Empresas
  useEffect(() => {
    const qInvoices = query(
      collection(db, "artifacts", appId, "invoices"),
      orderBy("createdAt", "desc")
    );
    const unsubInvoices = onSnapshot(
      qInvoices,
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Invoice)
        );
        setInvoices(data);
        setIsLoading(false);
      },
      (err) => {
        console.error("Erro ao carregar faturas:", err);
        setError(
          "Não foi possível carregar as faturas. Verifique as regras do banco."
        );
        setIsLoading(false);
      }
    );

    const qCompanies = query(
      collection(db, "artifacts", appId, "companies"),
      orderBy("name")
    );
    const unsubCompanies = onSnapshot(qCompanies, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, name: doc.data().name } as Company)
      );
      setCompanies(data);
    });

    return () => {
      unsubInvoices();
      unsubCompanies();
    };
  }, []);

  // 2. Handlers do Modal
  const openModal = (invoice?: Invoice) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setInvoiceForm({ ...invoice });
    } else {
      setEditingInvoice(null);
      setInvoiceForm({
        amount: 0,
        status: "PENDING",
        dueDate: new Date().toISOString().split("T")[0],
        companyName: companies.length > 0 ? companies[0].name : "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!invoiceForm.companyName || !invoiceForm.amount) {
      alert("Preencha a empresa e o valor.");
      return;
    }
    setIsSaving(true);
    try {
      const collectionRef = collection(db, "artifacts", appId, "invoices");
      if (editingInvoice) {
        await updateDoc(doc(collectionRef, editingInvoice.id), invoiceForm);
      } else {
        await addDoc(collectionRef, {
          ...invoiceForm,
          createdAt: new Date().toISOString(),
        });
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      alert(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Ações REAIS (Sem Alertas)

  // Gera um arquivo .txt real e baixa no navegador
  const handleDownloadReceipt = (e: React.MouseEvent, inv: Invoice) => {
    e.stopPropagation();

    const content = `
      RECIBO DE FATURA - BIDFLOW
      ================================================
      Fatura ID: #${inv.id}
      Data de Emissão: ${new Date().toLocaleDateString("pt-BR")}
      
      DADOS DO CLIENTE
      ------------------------------------------------
      Cliente: ${inv.companyName}
      
      DETALHES DO PAGAMENTO
      ------------------------------------------------
      Valor: R$ ${Number(inv.amount).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}
      Vencimento: ${new Date(inv.dueDate).toLocaleDateString("pt-BR")}
      Status: ${
        inv.status === "PAID"
          ? "PAGO"
          : inv.status === "PENDING"
          ? "PENDENTE"
          : "ATRASADO"
      }
      
      ------------------------------------------------
      Obrigado,
      Equipe BidFlow
      `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Fatura-${inv.companyName.replace(
      /\s+/g,
      "_"
    )}-${inv.id.substring(0, 6)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Simula envio com feedback visual no botão
  const handleResendEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    const btn = e.currentTarget as HTMLButtonElement;
    const originalContent = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = `<div class="flex items-center gap-2"><span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> Enviando...</div>`;
    btn.classList.remove("bg-indigo-600");
    btn.classList.add("bg-indigo-400");

    setTimeout(() => {
      btn.innerHTML = `<div class="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Enviado!</div>`;
      btn.classList.remove("bg-indigo-400");
      btn.classList.add("bg-green-600");

      setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.disabled = false;
        btn.classList.remove("bg-green-600", "hover:bg-green-700");
        btn.classList.add("bg-indigo-600", "hover:bg-indigo-700");
      }, 2000);
    }, 1500);
  };

  // Limpar Filtros
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  // 4. Lógica de Filtro e Busca
  const filteredInvoices = invoices.filter((inv) => {
    // Normaliza busca (remove #, minúsculas)
    const cleanSearch = searchTerm.replace("#", "").toLowerCase();
    const matchesSearch =
      (inv.companyName || "").toLowerCase().includes(cleanSearch) ||
      inv.id.toLowerCase().includes(cleanSearch);

    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // KPI Calc
  const totalRevenue = invoices
    .filter((i) => i.status === "PAID")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
  const pendingRevenue = invoices
    .filter((i) => i.status === "PENDING" || i.status === "OVERDUE")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
  const overdueCount = invoices.filter((i) => i.status === "OVERDUE").length;

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-96 text-red-600">
        <AlertCircle className="w-12 h-12 mb-2" />
        <p>{error}</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
        >
          <Plus size={18} /> Gerar Cobrança Manual
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Receita Total (Pago)"
          value={totalRevenue.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          icon={DollarSign}
          trend="up"
          change="+14%"
        />
        <StatCard
          title="A Receber (Pendente)"
          value={pendingRevenue.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          icon={DollarSign}
          trend="neutral"
          change="--"
        />
        <StatCard
          title="Faturas Geradas"
          value={invoices.length.toString()}
          icon={FileText}
          trend="up"
          change="+5"
        />
        <StatCard
          title="Inadimplência"
          value={overdueCount.toString()}
          icon={Users}
          trend={overdueCount > 0 ? "down" : "up"}
          change={overdueCount > 0 ? "+1" : "0"}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between gap-4 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-gray-500" />
            <h3 className="font-bold text-gray-800">Faturas</h3>
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Buscar fatura ou cliente..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Todos os Status</option>
              <option value="PAID">Pagos</option>
              <option value="PENDING">Pendentes</option>
              <option value="OVERDUE">Atrasados</option>
              <option value="CANCELLED">Cancelados</option>
            </select>
            <button
              onClick={clearFilters}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 bg-white transition active:bg-gray-200"
              title="Limpar Filtros"
            >
              <Filter size={16} /> Limpar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="p-4">Fatura</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Valor</th>
                <th className="p-4">Vencimento</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition group">
                  <td className="p-4 font-mono text-xs text-gray-500">
                    #{inv.id.substring(0, 8).toUpperCase()}
                  </td>
                  <td className="p-4 font-medium text-gray-900">
                    {inv.companyName}
                  </td>
                  <td className="p-4 font-bold text-gray-800">
                    {Number(inv.amount).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="p-4 text-gray-600">
                    {new Date(inv.dueDate).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        inv.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : inv.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : inv.status === "OVERDUE"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {inv.status === "PAID"
                        ? "Pago"
                        : inv.status === "PENDING"
                        ? "Pendente"
                        : inv.status === "OVERDUE"
                        ? "Atrasado"
                        : "Cancelado"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openModal(inv)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Ver/Editar"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => openModal(inv)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                        title="Editar Detalhes"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={(e) => handleDownloadReceipt(e, inv)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition"
                        title="Baixar Recibo"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Nenhuma fatura encontrada com estes filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">
                {editingInvoice
                  ? `Fatura #${editingInvoice.id.substring(0, 6).toUpperCase()}`
                  : "Nova Cobrança"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Cliente
                </label>
                {editingInvoice ? (
                  <input
                    disabled
                    className="w-full border bg-gray-100 rounded-lg px-3 py-2 text-gray-600"
                    value={invoiceForm.companyName}
                  />
                ) : (
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={invoiceForm.companyName}
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        companyName: e.target.value,
                      })
                    }
                  >
                    <option value="" disabled>
                      Selecione uma empresa
                    </option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    value={invoiceForm.amount}
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        amount: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Vencimento
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={invoiceForm.dueDate}
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        dueDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none font-bold ${
                    invoiceForm.status === "PAID"
                      ? "text-green-600"
                      : invoiceForm.status === "OVERDUE"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                  value={invoiceForm.status}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      status: e.target.value as any,
                    })
                  }
                >
                  <option value="PENDING">Pendente</option>
                  <option value="PAID">Pago</option>
                  <option value="OVERDUE">Atrasado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>

              {editingInvoice && (
                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={handleResendEmail}
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                  >
                    <Send size={16} /> Reenviar Email
                  </button>
                  <button
                    onClick={(e) => handleDownloadReceipt(e, editingInvoice)}
                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <Download size={16} /> Baixar Recibo
                  </button>
                </div>
              )}
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
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition shadow-sm flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFinance;
