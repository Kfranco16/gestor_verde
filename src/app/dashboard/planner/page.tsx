// src/app/dashboard/planner/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { es } from "date-fns/locale/es"; // <-- Importamos la localización en español
import "react-big-calendar/lib/css/react-big-calendar.css"; // <-- Importamos los estilos del calendario
import { supabase } from "@/utils/supabaseClient";

// Configuración para que el calendario entienda el formato de fechas y esté en español
const locales = {
  es: es,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Definimos la forma que tendrá un evento en nuestro calendario
type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  resource?: any; // Podemos añadir más datos aquí en el futuro
};

const PlannerPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Usamos useEffect para cargar las visitas desde Supabase
  useEffect(() => {
    const fetchVisits = async () => {
      const { data: visits, error } = await supabase.from("visits").select(`
        id,
        visit_date,
        companies ( name )
      `);

      if (error || !visits) {
        console.error("Error al obtener las visitas:", error);
        setEvents([]);
        return;
      }

      // Transformamos los datos de las visitas al formato que el calendario necesita
      const calendarEvents = visits.map((visit: any) => ({
        title: visit.companies?.name || "Visita",
        start: new Date(visit.visit_date),
        end: new Date(visit.visit_date),
      }));

      setEvents(calendarEvents);
    };

    fetchVisits();
  }, [supabase]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Planificador de Visitas
      </h1>
      <div
        style={{ height: "70vh" }}
        className="bg-gray-100 rounded-md p-2 border border-gray-200"
      >
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          culture="es"
          messages={{
            next: "Siguiente",
            previous: "Anterior",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
            date: "Fecha",
            time: "Hora",
            event: "Evento",
            noEventsInRange: "No hay visitas en este rango.",
          }}
        />
      </div>
    </div>
  );
};

export default PlannerPage;
