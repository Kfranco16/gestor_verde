"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import AddCompanyForm from "@/components/dashboard/AddCompanyForm";
import Link from "next/link";
import Planner from "@/components/dashboard/Planner";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);

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
    <div>
      <div className="p-10 text-center bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-gray-800">Panel de Control</h1>
        <p className="mt-4 text-lg text-gray-600">
          Bienvenida a Gestor Verde, Nana.
        </p>
      </div>

      {/* Sección de Empresas con los dos botones */}
      <div className="p-6 mt-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-700">Empresas</h2>
        <p className="mt-2 text-gray-500">
          Añade nuevas empresas o gestiona tu lista de clientes.
        </p>
        <div className="flex flex-col gap-4 mt-6 md:flex-row">
          {/* Botón 1: Abre el modal */}
          <button
            onClick={() => setIsFormVisible(true)}
            className="px-6 py-3 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300"
          >
            + Agregar Nueva Empresa
          </button>
          {/* Botón 2: Navega a la otra página */}
          <Link
            href="/dashboard/empresas"
            className="px-6 py-3 font-semibold text-center text-gray-700 bg-gray-200 rounded-lg shadow-md hover:bg-gray-300 transition-colors duration-300"
          >
            Gestionar Empresas
          </Link>
        </div>
      </div>

      {/* NUEVO: Tarjeta del planificador */}
      <div className="mt-8">
        <Planner />
      </div>

      {/* Renderizado Condicional: El formulario solo se muestra si isFormVisible es true */}
      {isFormVisible && (
        <AddCompanyForm
          onClose={() => setIsFormVisible(false)}
          onCompanyAdded={() => {
            // Aquí podrías refrescar la lista de empresas en el futuro
            console.log(
              "Una empresa fue añadida, se podría actualizar una lista aquí."
            );
          }}
        />
      )}
    </div>
  );
}
