import { useState } from "react";
import "./Login.css";

function Login() {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="logo">
          ⚖
        </div>

        <h1>Painel Jurídico Inteligente</h1>
        <p>Gestão de atendimentos jurídicos</p>

        <form>
          <label>E-mail</label>

          <div className="input-group">
            <span>✉</span>

            <input
              type="email"
              placeholder="seu@email.com"
            />
          </div>

          <label>Senha</label>

          <div className="input-group">
            <span>🔒</span>

            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="••••••••"
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

          <button className="login-button">
            Entrar
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;