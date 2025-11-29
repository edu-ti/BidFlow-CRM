import React from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  BarChart3,
  Zap,
  Shield,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* NOVA LOGO NAVBAR */}
          <img
            src="/assets/logo-1200.png"
            alt="BidFlow"
            className="h-16 object-contain"
          />
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/master"
            className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition"
          >
            Acesso Master
          </Link>
          <Link
            to="/login"
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
          >
            Acessar Painel
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center lg:text-left lg:flex lg:items-center lg:gap-16">
        <div className="lg:w-1/2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wide mb-6 border border-indigo-100">
            <Zap size={14} fill="currentColor" /> Novo: Chatbot com IA
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            O CRM que vende pelo{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              WhatsApp
            </span>
            .
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
            Automatize seu atendimento, organize seu funil de vendas e gerencie
            sua equipe em um único lugar. O BidFlow transforma conversas em
            receita.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
            >
              Entrar na Plataforma <ArrowRight size={20} />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition">
              Ver Demonstração
            </button>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-gray-500 justify-center lg:justify-start">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" /> Sem cartão
              necessário
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" /> Setup em 2
              minutos
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 mt-12 lg:mt-0 relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-70"></div>
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
            alt="Dashboard Preview"
            className="relative rounded-2xl shadow-2xl border border-gray-200 rotate-1 hover:rotate-0 transition duration-500"
          />

          {/* Floating Card */}
          <div
            className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-4 animate-bounce"
            style={{ animationDuration: "3s" }}
          >
            <div className="bg-green-100 p-3 rounded-full text-green-600">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">
                Novas Mensagens
              </p>
              <p className="text-xl font-bold text-gray-900">+128</p>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tudo o que sua empresa precisa
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Deixe de lado as planilhas e ferramentas desconectadas. O BidFlow
              centraliza sua operação.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Chat Centralizado
              </h3>
              <p className="text-gray-600">
                Vários atendentes em um único número de WhatsApp. Organize
                conversas por tags e departamentos.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Chatbot Visual
              </h3>
              <p className="text-gray-600">
                Crie fluxos de automação complexos arrastando e soltando blocos.
                Qualifique leads automaticamente.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mb-6">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Relatórios em Tempo Real
              </h3>
              <p className="text-gray-600">
                Acompanhe métricas de atendimento, tempo de resposta e conversão
                de vendas em dashboards intuitivos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            {/* NOVA LOGO FOOTER */}
            <img
              src="/assets/logo-1200.png"
              alt="BidFlow"
              className="h-10 object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition"
            />
          </div>
          <p className="text-gray-500 text-sm">
            © 2025 BidFlow Tecnologia. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-indigo-600">
              Privacidade
            </a>
            <a href="#" className="hover:text-indigo-600">
              Termos
            </a>
            <a href="#" className="hover:text-indigo-600">
              Suporte
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
