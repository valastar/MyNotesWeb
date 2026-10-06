"use client";
import { useUser } from "./lib/useUser";
import NameGate from "./components/NameGate";
import HomeGrid from "./components/HomeGrid";

export default function Home() {
  const { name, ready, login, logout } = useUser();

  if (!ready) return null;
  if (!name) return <NameGate onSubmit={login} />;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Hola, {name} 👋</h1>
          <p className="mt-2 text-[var(--muted)]">¿Qué quieres hacer hoy?</p>
        </div>
        <button onClick={logout} className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
          Salir
        </button>
      </header>

      <section className="mt-10">
        <HomeGrid />
      </section>
    </main>
  );
}