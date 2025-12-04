import React, { useState } from 'react';
import { Plus, Megaphone, CheckCircle2, Clock, Search, Filter, MoreHorizontal, Send, MessageCircle, Mail } from 'lucide-react';

interface Campaign {
  id: number;
  name: string;
  channel: 'whatsapp' | 'email' | 'sms';
  status: 'active' | 'completed' | 'draft' | 'scheduled' | 'paused';
  sent: number;
  openRate: string;
  date: string;
}

const initialCampaigns: Campaign[] = [
  { id: 1, name: 'Oferta de Verão', channel: 'whatsapp', status: 'completed', sent: 1250, openRate: '94%', date: '15 Out' },
  { id: 2, name: 'Newsletter Semanal', channel: 'email', status: 'active', sent: 3400, openRate: '28%', date: '22 Out' },
  { id: 3, name: 'Recuperação de Carrinho', channel: 'sms', status: 'paused', sent: 120, openRate: '15%', date: 'Recorrente' },
  { id: 4, name: 'Black Friday Teaser', channel: 'whatsapp', status: 'scheduled', sent: 0, openRate: '-', date: '01 Nov' },
  { id: 5, name: 'Bem-vindo ao Clube', channel: 'email', status: 'draft', sent: 0, openRate: '-', date: '-' },
];

const Campaigns = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "completed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "scheduled":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
      case "paused":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "draft":
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return (
          <MessageCircle
            size={18}
            className="text-green-600 dark:text-green-400"
          />
        );
      case "email":
        return <Mail size={18} className="text-blue-600 dark:text-blue-400" />;
      case "sms":
        return (
          <Send size={18} className="text-purple-600 dark:text-purple-400" />
        );
      default:
        return <Megaphone size={18} />;
    }
  };

  const filteredCampaigns = initialCampaigns.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStatus === "all" || c.status === filterStatus)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Campanhas
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie seus disparos em massa e automações.
          </p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 font-medium transition shadow-sm">
          <Plus size={18} /> Nova Campanha
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
            <Send size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Total Enviado (Mês)
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              12.450
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Taxa de Entrega
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              98.2%
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Agendadas
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              3
            </p>
          </div>
        </div>
      </div>

      {/* Filters & List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar campanhas..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-600 dark:text-gray-200 bg-white dark:bg-gray-700"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativas</option>
              <option value="completed">Concluídas</option>
              <option value="scheduled">Agendadas</option>
              <option value="draft">Rascunhos</option>
            </select>
            <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                <th className="px-6 py-4">Nome da Campanha</th>
                <th className="px-6 py-4">Canal</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Enviados</th>
                <th className="px-6 py-4">Abertura</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredCampaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {campaign.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 capitalize">
                      {getChannelIcon(campaign.channel)}
                      {campaign.channel}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(
                        campaign.status
                      )}`}
                    >
                      {campaign.status === "paused"
                        ? "Pausada"
                        : campaign.status === "scheduled"
                        ? "Agendada"
                        : campaign.status === "draft"
                        ? "Rascunho"
                        : campaign.status === "completed"
                        ? "Concluída"
                        : "Ativa"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                    {campaign.sent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                    {campaign.openRate}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                    {campaign.date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCampaigns.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-10 text-gray-500 dark:text-gray-400"
                  >
                    Nenhuma campanha encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
          Mostrando {filteredCampaigns.length} de {initialCampaigns.length}{" "}
          campanhas
        </div>
      </div>
    </div>
  );
};

export default Campaigns;