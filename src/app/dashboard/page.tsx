"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import AddCompanyForm from "@/components/dashboard/AddCompanyForm";

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

  // Layout mejorado: el formulario queda en la parte superior y centrado horizontalmente
  return (
    <div className="flex justify-center w-full min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        <AddCompanyForm />
      </div>
    </div>
  );
}
