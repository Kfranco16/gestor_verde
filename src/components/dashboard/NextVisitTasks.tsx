// src/components/dashboard/NextVisitTasks.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { format } from "date-fns/format";
import { es } from "date-fns/locale/es";
import VisitTasks from "./VisitTasks"; // Reutilizaremos el componente que ya creamos

const NextVisitTasks = () => {
  const [nextVisitId, setNextVisitId] = useState<number | null>(null);
  const [nextVisitInfo, setNextVisitInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNextVisit = async () => {
      // 1. Primero obtenemos el usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("Usuario no autenticado");
        setLoading(false);
        return;
      }

      const today = new Date().toISOString();

      // 2. Encontramos la próxima visita del usuario actual
      const { data: nextVisit, error: visitError } = await supabase
        .from("visits")
        .select("id, start_time, companies ( name )")
        .eq("status", "creada")
        .eq("user_id", user.id) // Filtrar por usuario actual
        .gte("start_time", today)
        .order("start_time", { ascending: true })
        .limit(1)
        .single(); // .single() para obtener solo un objeto, no un array

      if (visitError || !nextVisit) {
        console.log("No se encontró una próxima visita.");
        setNextVisitId(null);
        setNextVisitInfo(null);
        setLoading(false);
        return;
      }

      // 3. Si la encontramos, guardamos su ID y su información formateada
      setNextVisitId(nextVisit.id);
      const companyName =
        (nextVisit.companies as any)?.name || "Empresa no encontrada";
      setNextVisitInfo(
        `${companyName} - ${format(
          new Date(nextVisit.start_time),
          "eeee dd 'de' MMMM, p",
          { locale: es }
        )}`
      );
      setLoading(false);
    };

    fetchNextVisit();

    // Escuchar eventos de cambio de estado de visitas
    const handleVisitStatusChange = () => {
      fetchNextVisit();
    };

    window.addEventListener("visitStatusChanged", handleVisitStatusChange);

    return () => {
      window.removeEventListener("visitStatusChanged", handleVisitStatusChange);
    };
  }, []);

  return (
    <div className="p-4 md:p-6 mt-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-4">
        Tareas de la Próxima Visita
      </h3>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Buscando próxima visita...</div>
        </div>
      ) : nextVisitId ? (
        <>
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="font-semibold text-green-700">{nextVisitInfo}</p>
          </div>
          {/* Usamos el componente VisitTasks que ya teníamos, pasándole el ID que encontramos */}
          <VisitTasks visitId={nextVisitId} />
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-3">
            No hay tareas porque no hay una próxima visita programada.
          </p>
          <p className="text-sm text-gray-400">
            Las tareas aparecerán aquí cuando tengas una visita próxima.
          </p>
        </div>
      )}
    </div>
  );
};

export default NextVisitTasks;
