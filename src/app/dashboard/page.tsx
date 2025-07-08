"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import AddCompanyForm from "@/components/dashboard/AddCompanyForm";
import Link from "next/link";
import Planner from "@/components/dashboard/Planner";
import NextVisitTasks from "@/components/dashboard/NextVisitTasks";
import NextVisitDetail from "@/components/dashboard/NextVisitDetail";

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
      <div className="p-10 text-center bg-white bg-[url('/plant-pattern-diverse.svg')] bg-[length:140px_140px] bg-repeat rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-gray-800">Panel de Control</h1>
        <p className="mt-4 text-lg text-gray-600">
          Bienvenida a Gestor Verde, Nana.
        </p>
      </div>

      {/* Grid responsivo principal - Layout 2x2 en desktop */}
      <div className="grid gap-8 mt-8 lg:grid-cols-2">
        {/* Fila 1, Columna 1: NextVisitDetail */}
        <div>
          <NextVisitDetail />
        </div>

        {/* Fila 1, Columna 2: Sección de Empresas */}
        <div className="p-6 bg-white rounded-lg shadow-md">
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

        {/* Fila 2, Columna 1: Planificador de Visitas */}
        <div>
          <Planner />
        </div>

        {/* Fila 2, Columna 2: Tareas de la Próxima Visita */}
        <div>
          <NextVisitTasks />
        </div>
      </div>

      {/* Renderizado Condicional: El formulario solo se muestra si isFormVisible es true */}
      {isFormVisible && (
        <AddCompanyForm
          onClose={() => setIsFormVisible(false)}
          onCompanyAdded={() => {
            // Aquí podrías refrescar la lista de empresas en el futuro
          }}
        />
      )}
    </div>
  );
}
