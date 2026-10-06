"use client";
import { useEffect, useState } from "react";

const KEY = "mynote:name";

export function useUser() {
  const [name, setName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setName(localStorage.getItem(KEY));
    setReady(true);
  }, []);

  const login = (n: string) => {
    localStorage.setItem(KEY, n.trim());
    setName(n.trim());
  };
  const logout = () => {
    localStorage.removeItem(KEY);
    setName(null);
  };

  return { name, ready, login, logout };
}