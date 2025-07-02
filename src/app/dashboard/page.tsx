"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica si hay usuario autenticado
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/"); // Redirige al login si no hay usuario
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-xl text-gray-500">Cargando...</h1>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-green-700">Bienvenido a tu app</h1>
    </main>
  );
}
