import { useState } from "react";
import { authApi } from "../lib/api"; // Caminho para seu arquivo api.ts
import { useNavigate } from "react-router-dom";

export default function ClientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Chama sua nova API
      const data = await authApi.login(email, password);

      alert(`Bem-vindo, ${data.user.name}!`);

      // Redireciona baseado no cargo, se necessário
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      alert("Erro ao fazer login: Verifique suas credenciais.");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
      />
      <button type="submit">Entrar</button>
    </form>
  );
}
