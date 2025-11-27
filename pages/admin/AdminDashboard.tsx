import React, { useEffect, useState } from "react";
import { StatCard } from "../../components/StatCard";
import {
  DollarSign,
  Building2,
  Server,
  AlertCircle,
  TrendingUp,
  Users,
  MessageSquare,
  Clock,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { db, appId } from "../../lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

// Dados mockados para gráficos (histórico complexo geralmente requer agregação no backend)
const revenueData = [
  { name: "Mai", value: 45000 },
  { name: "Jun", value: 52000 },
  { name: "Jul", value: 48000 },
  { name: "Ago", value: 61000 },
  { name: "Set", value: 58000 },
  { name: "Out", value: 72000 },
];

const newClientsData = [
  { name: "Mai", value: 12 },
  { name: "Jun", value: 15 },
  { name: "Jul", value: 10 },
  { name: "Ago", value: 22 },
  { name: "Set", value: 18 },
  { name: "Out", value: 25 },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    mrr: 0,
    activeClients: 0,
    trialClients: 0,
    overdueClients: 0,
    totalMessages: 1200000, // Mockado por enquanto (caro para contar em tempo real)
    instances: 798, // Mockado
  });
  const [planDistribution, setPlanDistribution] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Buscar empresas para calcular métricas
    const q = query(collection(db, "artifacts", appId, "companies"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let mrr = 0;
      let active = 0;
      let trial = 0;
      let overdue = 0;
      const plans: Record<string, number> = {
        Starter: 0,
        Pro: 0,
        Enterprise: 0,
      };

      snapshot.forEach((doc) => {
        const data = doc.data();

        // Contagem por Status
        if (data.status === "active") active++;
        if (data.status === "trial") trial++;
        if (data.status === "overdue") overdue++;

        // Cálculo de MRR (Receita Mensal Recorrente)
        // Removemos símbolos de moeda se existirem e convertemos para número
        const price =
          typeof data.mrr === "string"
            ? parseFloat(
                data.mrr
                  .replace("R$", "")
                  .replace(".", "")
                  .replace(",", ".")
                  .trim()
              )
            : data.mrr || 0;

        if (data.status === "active") {
          mrr += price;
        }

        // Distribuição de Planos
        const planName = data.plan || "Starter";
        if (plans[planName] !== undefined) {
          plans[planName]++;
        } else {
          plans[planName] = 1;
        }
      });

      // Formatar dados para o gráfico de pizza
      const chartData = [
        { name: "Starter", value: plans.Starter, color: "#94a3b8" },
        { name: "Pro", value: plans.Pro, color: "#6366f1" },
        { name: "Enterprise", value: plans.Enterprise, color: "#10b981" },
      ].filter((item) => item.value > 0);

      setStats((prev) => ({
        ...prev,
        mrr,
        activeClients: active,
        trialClients: trial,
        overdueClients: overdue,
      }));
      setPlanDistribution(chartData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Master</h1>
        <p className="text-gray-500 mt-1">
          Visão geral de toda a operação do SaaS.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="MRR (Receita)"
          value={stats.mrr.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          change="+12.5%"
          icon={DollarSign}
          trend="up"
        />
        <StatCard
          title="Clientes Ativos"
          value={stats.activeClients}
          change="+25"
          icon={Building2}
          trend="up"
        />
        <StatCard
          title="Em Teste (Trial)"
          value={stats.trialClients}
          change="+12"
          icon={Clock}
          trend="neutral"
        />
        <StatCard
          title="Inadimplentes"
          value={stats.overdueClients}
          change="-2"
          icon={AlertCircle}
          trend="down"
        />
        <StatCard
          title="Instâncias WA"
          value={stats.instances}
          change="94.7%"
          icon={Server}
          trend="neutral"
        />
        <StatCard
          title="Mensagens Hoje"
          value="1.2M"
          change="+5.2%"
          icon={MessageSquare}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Crescimento de Receita (Simulado)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b" }}
                  tickFormatter={(value) => `R$${value / 1000}k`}
                />
                <Tooltip formatter={(value) => [`R$ ${value}`, "Receita"]} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6C63FF"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#6C63FF" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Distribuição de Planos
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={
                    planDistribution.length > 0
                      ? planDistribution
                      : [{ name: "Sem dados", value: 1, color: "#e2e8f0" }]
                  }
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(planDistribution.length > 0
                    ? planDistribution
                    : [{ name: "Sem dados", value: 1, color: "#e2e8f0" }]
                  ).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Clients Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Novos Clientes (Simulado)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={newClientsData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b" }}
                />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar
                  dataKey="value"
                  fill="#6C63FF"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Logs */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Atividade Recente
          </h3>
          <div className="space-y-4">
            {/* Logs estáticos por enquanto, idealmente viriam de uma coleção 'logs' */}
            <div className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="p-2 rounded-full mt-1 bg-indigo-100 text-indigo-600">
                <AlertCircle size={14} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Login de Admin
                </p>
                <p className="text-xs text-gray-500">Sistema • Master</p>
                <span className="text-[10px] text-gray-400">Agora mesmo</span>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
            Ver todos os logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
