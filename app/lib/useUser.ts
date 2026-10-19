"use client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const nombreDe = (u?: User | null) =>
  u ? (u.user_metadata?.full_name ?? u.user_metadata?.name ?? u.email ?? null) : null;

export function useUser() {
  const [name, setName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setName(nombreDe(data.session?.user));
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, session) => {
      setName(nombreDe(session?.user));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const login = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) alert(error.message);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setName(null);
  };

  return { name, ready, login, logout };
}