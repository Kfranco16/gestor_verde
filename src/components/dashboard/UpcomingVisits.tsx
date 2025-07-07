// src/components/dashboard/UpcomingVisits.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import { format } from "date-fns/format";
import { es } from "date-fns/locale/es";

type UpcomingVisit = {
  id: number;
  start_time: string;
  companies: { name: string } | null;
};

const UpcomingVisits = () => {
  const [visits, setVisits] = useState<UpcomingVisit[]>([]);
  const [loading, setLoading] = useState(true);

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
          (visit: any) => ({
            id: visit.id,
            start_time: visit.start_time,
            companies: visit.companies,
          })
        );
        setVisits(transformedData);
      }
      setLoading(false);
    };

    fetchUpcomingVisits();
  }, []);

  return (
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg md:text-xl font-bold text-gray-700">
          Próximas Visitas
        </h3>
        <Link
          href="/dashboard/planner"
          className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
        >
          Ver calendario
        </Link>
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
              className="p-3 bg-gray-50 rounded-md border border-gray-100 hover:bg-gray-100 transition-colors duration-200"
            >
              <p className="font-semibold text-gray-800 mb-1">
                {visit.companies?.name || "Empresa no encontrada"}
              </p>
              <p className="text-sm text-gray-600">
                {format(new Date(visit.start_time), "eeee dd 'de' MMMM, p", {
                  locale: es,
                })}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-3">No hay visitas programadas.</p>
          <Link
            href="/dashboard/planner"
            className="inline-block px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors duration-200"
          >
            Programar primera visita
          </Link>
        </div>
      )}
    </div>
  );
};

export default UpcomingVisits;
