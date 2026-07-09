// src/pages/Login/Login.jsx
import { useState } from "react";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); // Impede a página de dar refresh
    setErro("");
    setCarregando(true);

    try {
      // Preparado para conectar com seu AuthController na porta 8080
      const resposta = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: email, // O seu backend espera o campo "login"
          senha: senha,
        }),
      });

      const dados = await reply.json();

      if (!resposta.ok) {
        throw new Error(dados.error || "Erro ao realizar autenticação.");
      }

      // Salva o Token Bearer com segurança no navegador para as próximas telas usarem
      localStorage.setItem("token", dados.token);
      
      // Aqui faremos o redirecionamento para o Dashboard
      alert("Login realizado com sucesso! Token salvo.");
      window.location.reload(); // Provisório para atualizar o estado do App

    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo">⚖</div>

        <h1>Painel Jurídico Inteligente</h1>
        <p>Gestão de atendimentos jurídicos</p>

        {erro && <div style={{ color: "red", textAlign: "center", marginBottom: "15px" }}>{erro}</div>}

        <form onSubmit={handleLogin}>
          <label>E-mail</label>
          <div className="input-group">
            <span>✉</span>
            <input
              type="text"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Senha</label>
          <div className="input-group">
            <span>🔒</span>
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <button
              type="button"
              className="show-password"
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              👁
            </button>
          </div>

          <div className="options">
            <label className="remember">
              <input type="checkbox" />
              Lembrar-me
            </label>
            <a href="#">Esqueci minha senha</a>
          </div>

          <button type="submit" className="login-button" disabled={carregando}>
            {carregando ? "Autenticando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;