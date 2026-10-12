"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useUser() {
  const [name, setName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setName(data.session?.user.user_metadata?.name ?? null);
      setReady(true);
    });
  }, []);

  const login = async (n: string) => {
    const { error } = await supabase.auth.signInAnonymously({
      options: { data: { name: n.trim() } },
    });
    if (error) return alert(error.message);
    setName(n.trim());
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setName(null);
  };

  return { name, ready, login, logout };
}