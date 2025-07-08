// src/components/dashboard/VisitHistory.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabaseClient";
import { format } from "date-fns/format";
import { es } from "date-fns/locale/es";
import { useVisitEvents } from "@/utils/visitEvents";

// Tipos de datos
type Task = { id: number; title: string; is_completed: boolean };
type HistoricVisit = {
  id: number;
  status: "terminada" | "cancelada";
  completed_at: string | null;
  cancelled_at: string | null;
  report_summary: string | null;
  tasks: Task[];
};

// Componente para una única tarjeta de historial, ahora con estado propio
const HistoryCard = ({
  visit,
  onUpdate,
}: {
  visit: HistoricVisit;
  onUpdate: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(visit.report_summary || "");

  const handleSaveNote = async () => {
    const { error } = await supabase
      .from("visits")
      .update({ report_summary: notes })
      .eq("id", visit.id);

    if (error) {
      alert("Error al guardar la nota: " + error.message);
    } else {
      setIsEditing(false); // Salimos del modo edición
      onUpdate(); // Pedimos al componente padre que refresque los datos
    }
  };

  return (
    <div className="p-4 bg-white border rounded-md shadow-sm">
      <div className="flex justify-between items-center">
        <p
          className={`font-bold text-lg ${
            visit.status === "terminada" ? "text-green-700" : "text-red-700"
          }`}
        >
          Visita {visit.status}
        </p>
        <p className="text-sm text-gray-500">
          {visit.status === "terminada" && visit.completed_at
            ? format(new Date(visit.completed_at), "PPP 'a las' p", {
                locale: es,
              })
            : visit.status === "cancelada" && visit.cancelled_at
            ? format(new Date(visit.cancelled_at), "PPP 'a las' p", {
                locale: es,
              })
            : "N/A"}
        </p>
      </div>
      <hr className="my-3" />

      {/* Sección de Notas / Reporte */}
      <div>
        <h4 className="font-semibold mb-2">Notas / Reporte:</h4>
        {isEditing ? (
          <div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-sm bg-gray-200 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNote}
                className="px-3 py-1 text-sm text-white bg-blue-500 rounded-md"
              >
                Guardar Nota
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {visit.report_summary || (
                <span className="text-gray-400">
                  No hay notas para esta visita.
                </span>
              )}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-blue-600 hover:underline mt-2"
            >
              {visit.report_summary ? "Editar Nota" : "Añadir Nota"}
            </button>
          </div>
        )}
      </div>

      {/* Checklist de Tareas (sin cambios) */}
      <h4 className="font-semibold mt-4 mb-2">Checklist de Tareas:</h4>
      {visit.tasks.length > 0 ? (
        <ul className="space-y-1 list-disc list-inside">
          {visit.tasks.map((task) => (
            <li
              key={task.id}
              className={task.is_completed ? "text-gray-800" : "text-gray-400"}
            >
              {task.is_completed ? "✅" : "❌"} {task.title}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">
          No se registraron tareas para esta visita.
        </p>
      )}
    </div>
  );
};

// Componente principal del Historial
export default function VisitHistory({ companyId }: { companyId: number }) {
  const [history, setHistory] = useState<HistoricVisit[]>([]);
  const [loading, setLoading] = useState(true);

  const { onVisitEvent } = useVisitEvents();

  const fetchHistory = useCallback(async () => {
    // Incluimos cancelled_at en la consulta
    const { data, error } = await supabase
      .from("visits")
      .select(
        `id, status, completed_at, cancelled_at, report_summary, tasks ( id, title, is_completed )`
      )
      .eq("company_id", companyId)
      .in("status", ["terminada", "cancelada"]);

    if (error) {
      console.error("Error al obtener el historial:", error);
    } else {
      // Ordenamos manualmente por la fecha correspondiente según el status
      const sortedData = (data as HistoricVisit[]).sort((a, b) => {
        const dateA =
          a.status === "terminada" ? a.completed_at : a.cancelled_at;
        const dateB =
          b.status === "terminada" ? b.completed_at : b.cancelled_at;

        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      setHistory(sortedData);
    }
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    fetchHistory();

    // Escuchar cambios de estado de visitas para actualizar el historial
    const unsubscribeStatusChanged = onVisitEvent(
      "visit_status_changed",
      () => {
        fetchHistory();
      }
    );

    return () => {
      unsubscribeStatusChanged();
    };
  }, [fetchHistory, onVisitEvent]);

  return (
    <div className="p-6 mt-8 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">
        Historial de Visitas
      </h2>
      {loading ? (
        <p>Cargando historial...</p>
      ) : history.length > 0 ? (
        <div className="space-y-6">
          {history.map((visit) => (
            <HistoryCard key={visit.id} visit={visit} onUpdate={fetchHistory} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No hay historial de visitas para esta empresa.
        </p>
      )}
    </div>
  );
}
