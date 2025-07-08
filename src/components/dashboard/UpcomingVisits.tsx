// src/components/dashboard/UpcomingVisits.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { format } from "date-fns/format";
import { es } from "date-fns/locale/es";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

type UpcomingVisit = {
  id: number;
  start_time: string;
  companies: { name: string } | null;
};

const UpcomingVisits = () => {
  const [visits, setVisits] = useState<UpcomingVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUpcomingVisits = async () => {
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

      // 2. Filtramos las visitas por usuario actual
      const { data, error } = await supabase
        .from("visits")
        .select("id, start_time, companies ( name )")
        .eq("status", "creada")
        .eq("user_id", user.id) // Filtrar por usuario actual
        .gte("start_time", today) // gte = greater than or equal to (mayor o igual que hoy)
        .order("start_time", { ascending: true }) // Ordenamos para tener las más próximas primero
        .limit(3); // Limitamos el resultado a 3

      if (error) {
        console.error("Error fetching upcoming visits:", error);
      } else {
        // Transformamos los datos para que coincidan con nuestro tipo
        const transformedData: UpcomingVisit[] = (data || []).map(
          (visit: { id: number; start_time: string; companies: unknown }) => ({
            id: visit.id,
            start_time: visit.start_time,
            companies: visit.companies as { name: string } | null,
          })
        );
        setVisits(transformedData);
      }
      setLoading(false);
    };

    fetchUpcomingVisits();
  }, []);

  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };

    if (openMenuId !== null) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openMenuId]);

  // Función para actualizar el estado de una visita
  const handleUpdateVisitStatus = async (
    visitId: number,
    newStatus: "terminada" | "cancelada"
  ) => {
    const updateData: {
      status: string;
      completed_at?: string;
      cancelled_at?: string;
    } = {
      status: newStatus,
    };
    if (newStatus === "terminada") {
      updateData.completed_at = new Date().toISOString();
    } else if (newStatus === "cancelada") {
      updateData.cancelled_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("visits")
      .update(updateData)
      .eq("id", visitId);

    if (error) {
      alert(`Error al actualizar la visita: ${error.message}`);
    } else {
      alert(`¡Visita marcada como ${newStatus} con éxito!`);
      setOpenMenuId(null); // Cerrar el menú

      // Emitir evento para notificar a NextVisitTasks
      const event = new CustomEvent("visitStatusChanged", {
        detail: { visitId, newStatus },
      });
      window.dispatchEvent(event);

      // Refrescar la lista de visitas
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const today = new Date().toISOString();
        const { data, error } = await supabase
          .from("visits")
          .select("id, start_time, companies ( name )")
          .eq("status", "creada")
          .eq("user_id", user.id)
          .gte("start_time", today)
          .order("start_time", { ascending: true })
          .limit(3);

        if (!error) {
          const transformedData: UpcomingVisit[] = (data || []).map(
            (visit: {
              id: number;
              start_time: string;
              companies: unknown;
            }) => ({
              id: visit.id,
              start_time: visit.start_time,
              companies: visit.companies as { name: string } | null,
            })
          );
          setVisits(transformedData);
        }
      }
    }
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <h3 className="text-lg md:text-xl font-bold text-gray-700">
          Próximas Visitas
        </h3>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Cargando visitas...</div>
        </div>
      ) : visits.length > 0 ? (
        <ul className="space-y-3">
          {visits.map((visit) => (
            <li
              key={visit.id}
              className="p-3 bg-gray-50 rounded-md border border-gray-100 hover:bg-gray-100 transition-colors duration-200 relative"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 mb-1">
                    {(() => {
                      if (!visit.companies) return "Empresa no encontrada";
                      if (Array.isArray(visit.companies)) {
                        return (
                          visit.companies[0]?.name || "Empresa no encontrada"
                        );
                      }
                      return (
                        (visit.companies as { name: string }).name ||
                        "Empresa no encontrada"
                      );
                    })()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(
                      new Date(visit.start_time),
                      "eeee dd 'de' MMMM, p",
                      {
                        locale: es,
                      }
                    )}
                  </p>
                </div>

                {/* Menú de 3 puntos */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === visit.id ? null : visit.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200"
                  >
                    <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
                  </button>

                  {/* Dropdown menu */}
                  {openMenuId === visit.id && (
                    <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <button
                          onClick={() =>
                            handleUpdateVisitStatus(visit.id, "terminada")
                          }
                          className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 transition-colors duration-200"
                        >
                          ✓ Marcar como Terminada
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateVisitStatus(visit.id, "cancelada")
                          }
                          className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 transition-colors duration-200"
                        >
                          ✕ Marcar como Cancelada
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-3">No hay visitas programadas.</p>
        </div>
      )}
    </div>
  );
};

export default UpcomingVisits;
