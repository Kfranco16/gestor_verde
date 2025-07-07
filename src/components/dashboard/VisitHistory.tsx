// src/components/dashboard/VisitHistory.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabaseClient";
import { format } from "date-fns/format";
import { es } from "date-fns/locale/es";

// Definimos los tipos para que TypeScript nos ayude
type Task = {
  id: number;
  title: string;
  is_completed: boolean;
};

type HistoricVisit = {
  id: number;
  status: "terminada" | "cancelada";
  completed_at: string | null;
  start_time: string;
  tasks: Task[]; // ¡Cada visita tendrá un array de tareas!
};

export default function VisitHistory({ companyId }: { companyId: number }) {
  const [history, setHistory] = useState<HistoricVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("No se pudo identificar al usuario");
        setLoading(false);
        return;
      }

      // Esta es una consulta avanzada. Le pedimos a Supabase:
      // "Dame todas las visitas de esta empresa (companyId) del usuario actual cuyo estado sea 'terminada' o 'cancelada'.
      // Y por cada visita que me des, tráeme también todas sus tareas (title, is_completed)."
      const { data, error } = await supabase
        .from("visits")
        .select(
          `
          id,
          status,
          completed_at,
          start_time,
          tasks ( id, title, is_completed )
        `
        )
        .eq("company_id", companyId)
        .eq("user_id", user.id)
        .in("status", ["terminada", "cancelada"])
        .order("completed_at", { ascending: false });

      if (error) {
        console.error("Error al obtener el historial:", error);
        setError("Error al cargar el historial de visitas");
      } else {
        setHistory(data as HistoricVisit[]);
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      setError("Error inesperado al cargar el historial");
    }
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="p-4 md:p-6 mt-6 md:mt-8 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-xl md:text-2xl font-bold text-gray-700 mb-4">
        Historial de Visitas
      </h2>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Cargando historial...</div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchHistory}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-4 md:space-y-6">
          {history.map((visit) => (
            <div
              key={visit.id}
              className="p-4 bg-white border rounded-md shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3">
                <div className="flex items-center gap-2 mb-2 md:mb-0">
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    visit.status === "terminada" ? "bg-green-500" : "bg-red-500"
                  }`}></span>
                  <p className="font-bold text-lg">
                    Visita {visit.status === "terminada" ? "Terminada" : "Cancelada"}
                  </p>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    <span className="font-medium">Programada:</span>{" "}
                    {format(new Date(visit.start_time), "PPP 'a las' p", { locale: es })}
                  </p>
                  {visit.completed_at && (
                    <p>
                      <span className="font-medium">
                        {visit.status === "terminada" ? "Completada:" : "Cancelada:"}
                      </span>{" "}
                      {format(new Date(visit.completed_at), "PPP 'a las' p", { locale: es })}
                    </p>
                  )}
                </div>
              </div>
              
              <hr className="my-3" />
              
              <h4 className="font-semibold mb-2 text-gray-700">
                {visit.status === "terminada" ? "Tareas Realizadas:" : "Estado de Tareas:"}
              </h4>
              
              {visit.tasks.length > 0 ? (
                <ul className="space-y-2">
                  {visit.tasks.map((task) => (
                    <li
                      key={task.id}
                      className={`flex items-center gap-2 p-2 rounded ${
                        task.is_completed 
                          ? "bg-green-50 text-green-800" 
                          : "bg-gray-50 text-gray-600"
                      }`}
                    >
                      <span className="text-lg">
                        {task.is_completed ? "✅" : "❌"}
                      </span>
                      <span className={task.is_completed ? "font-medium" : ""}>
                        {task.title}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No se registraron tareas para esta visita.
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mb-4 text-gray-400">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500">
            No hay historial de visitas para esta empresa.
          </p>
        </div>
      )}
    </div>
  );
}
