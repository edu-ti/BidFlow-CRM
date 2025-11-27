import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Loader2, KeyRound } from "lucide-react";

interface AdminLoginProps {
  onLogin: (email: string) => void; // Agora aceita o email
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulação de API (Aqui você pode adicionar login real do Firebase se quiser)
    setTimeout(() => {
      setLoading(false);
      onLogin(email); // Passa o email digitado para o App
      navigate("/admin/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111827] p-4">
      <div className="bg-[#1f2937] w-full max-w-md rounded-2xl shadow-2xl p-8 border border-gray-700">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={16} className="mr-1" /> Voltar para o site
        </Link>

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#6C63FF] rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg shadow-purple-900/20">
            M
          </div>
          <h1 className="text-2xl font-bold text-white">Acesso Master</h1>
          <p className="text-gray-400 mt-1">
            Área restrita para equipe BidFlow
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email ou ID
            </label>
            <div className="relative">
              <Shield
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#374151] border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent outline-none transition placeholder-gray-500"
                placeholder="admin@bidflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Chave de Acesso
            </label>
            <div className="relative">
              <KeyRound
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#374151] border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent outline-none transition placeholder-gray-500"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6C63FF] text-white py-3 rounded-xl font-bold text-lg hover:bg-[#5a52d6] transition shadow-lg shadow-purple-900/30 flex items-center justify-center"
          >
            {loading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              "Autenticar Sistema"
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-700 pt-6">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
            <Lock size={12} /> Conexão Segura 256-bit SSL
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
