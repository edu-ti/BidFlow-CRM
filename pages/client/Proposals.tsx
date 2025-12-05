import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Printer,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  Plus as PlusIcon,
} from "lucide-react";

interface Proposal {
  id: string;
  number: string;
  date: string;
  client: string;
  contact: string;
  document: string;
  value: number;
  status: "Rascunho" | "Enviada" | "Aceita" | "Rejeitada";
  stage: string;
}

const mockProposals: Proposal[] = [
  {
    id: "1",
    number: "024/2025",
    date: "04/12/2025",
    client: "CASA DE SAUDE E MATERNIDADE DE CORURIPE",
    contact: "N/A",
    document: "35.642.172/0001-43",
    value: 2067000.0,
    status: "Rascunho",
    stage: "Proposta",
  },
  {
    id: "2",
    number: "023/2025",
    date: "04/12/2025",
    client: "CASA DE SAUDE E MATERNIDADE DE CORURIPE",
    contact: "N/A",
    document: "35.642.172/0001-43",
    value: 168000.0,
    status: "Rascunho",
    stage: "Proposta",
  },
];

const Proposals = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Estados do Formulário de Criação
  const [activeStep, setActiveStep] = useState(1); // 1 = Dados, 2 = Itens, 3 = Termos (tudo na mesma tela no print, mas separado logico)

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Rascunho":
        return "bg-gray-200 text-gray-700";
      case "Enviada":
        return "bg-blue-100 text-blue-700";
      case "Aceita":
        return "bg-green-100 text-green-700";
      case "Rejeitada":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (isCreating) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCreating(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Criar Nova Proposta
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-8">
          {/* Parte 1: Cabeçalho e Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data de Criação
              </label>
              <input
                type="date"
                className="w-full border p-2 rounded-lg bg-gray-50 dark:bg-gray-700"
                defaultValue="2025-12-05"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Validade da Proposta
              </label>
              <input
                type="date"
                className="w-full border p-2 rounded-lg dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select className="w-full border p-2 rounded-lg dark:bg-gray-700">
                <option>Rascunho</option>
                <option>Enviada</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Selecionar Cliente
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="clientType" defaultChecked /> Pessoa
                Jurídica
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="clientType" /> Pessoa Física
              </label>
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 border p-2 rounded-lg dark:bg-gray-700"
                placeholder="Pesquisar organização..."
              />
              <button className="px-4 border rounded-lg hover:bg-gray-50 flex items-center gap-1">
                + Novo
              </button>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Parte 2: Itens */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              Itens da Proposta
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-600 space-y-4">
              <div className="grid grid-cols-[1fr_auto] gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Descrição*
                      </label>
                      <input className="w-full border p-2 rounded-lg bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Fabricante
                      </label>
                      <input className="w-full border p-2 rounded-lg bg-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Modelo
                      </label>
                      <input className="w-full border p-2 rounded-lg bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Status
                      </label>
                      <select className="w-full border p-2 rounded-lg bg-white">
                        <option>Venda</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Imagem
                  </label>
                  <div className="h-24 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500 mb-2">
                    Imagem
                  </div>
                  <button className="w-full text-xs border bg-white py-1 rounded">
                    Escolher
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Descrição Detalhada
                </label>
                <textarea className="w-full border p-2 rounded-lg bg-white h-20 resize-none"></textarea>
              </div>

              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="text-xs font-bold mb-2">Parâmetros Adicionais</p>
                <div className="flex gap-2">
                  <input
                    className="flex-1 border p-1.5 rounded text-sm"
                    placeholder="Nome (Ex: Voltagem)"
                  />
                  <input
                    className="flex-1 border p-1.5 rounded text-sm"
                    placeholder="Valor (Ex: 220V)"
                  />
                  <button className="px-3 border rounded text-xs hover:bg-gray-50">
                    Adicionar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Quantidade*
                  </label>
                  <input
                    type="number"
                    className="w-full border p-2 rounded-lg bg-white"
                    defaultValue="1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Valor Unitário*
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg bg-white"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Unidade
                  </label>
                  <input
                    className="w-full border p-2 rounded-lg bg-white"
                    defaultValue="Unidade"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Subtotal
                  </label>
                  <div className="w-full bg-gray-100 p-2 rounded-lg font-bold text-gray-700">
                    R$ 0,00
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="px-4 py-2 border rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50">
                <BookOpen size={16} /> Do Catálogo
              </button>
              <button className="px-4 py-2 border rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50">
                <PlusIcon size={16} /> Manual
              </button>
              <div className="ml-auto text-xl font-bold">Total: R$ 0,00</div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Parte 3: Termos */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              Termos Comerciais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="text-xs font-medium text-gray-500">
                  Faturamento
                </label>
                <textarea
                  rows={2}
                  className="w-full border p-2 rounded-lg resize-none"
                  defaultValue="Realizado diretamente pela fábrica."
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-xs font-medium text-gray-500">
                  Treinamento
                </label>
                <textarea
                  rows={2}
                  className="w-full border p-2 rounded-lg resize-none"
                  defaultValue="Capacitação técnica por especialistas."
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-xs font-medium text-gray-500">
                  Condições de Pagamento
                </label>
                <textarea
                  rows={2}
                  className="w-full border p-2 rounded-lg resize-none"
                  defaultValue="A vista"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-xs font-medium text-gray-500">
                  Prazo de Entrega
                </label>
                <textarea
                  rows={2}
                  className="w-full border p-2 rounded-lg resize-none"
                  defaultValue="Até 30 dias após confirmação."
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500">
                  Observações
                </label>
                <textarea
                  rows={2}
                  className="w-full border p-2 rounded-lg resize-none"
                  defaultValue="Nenhuma"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button className="px-6 py-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800">
              Criar Proposta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Propostas
        </h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-indigo-900 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
          >
            <Plus size={18} /> Criar Nova
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Nº</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Contato do Cliente</th>
                <th className="px-6 py-3">CNPJ/CPF</th>
                <th className="px-6 py-3">Valor</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Etapa do Funil</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {mockProposals.map((proposal) => (
                <tr
                  key={proposal.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {proposal.number}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {proposal.date}
                  </td>
                  <td
                    className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]"
                    title={proposal.client}
                  >
                    {proposal.client}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {proposal.contact}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {proposal.document}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {proposal.value.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusStyle(
                        proposal.status
                      )}`}
                    >
                      {proposal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {proposal.stage}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                        title="Imprimir/PDF"
                      >
                        <Printer size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {mockProposals.length} de 24 propostas
          </p>
          <div className="flex gap-2">
            <button className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-50">
              <ChevronLeft size={18} />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Página 1 de 5
            </span>
            <button className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Proposals;
