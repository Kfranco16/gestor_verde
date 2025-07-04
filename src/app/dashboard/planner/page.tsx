// src/app/dashboard/planner/page.tsx
"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
// ¡NUEVO! Importamos 'Views' para poder referenciar las vistas por su nombre
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { es } from "date-fns/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { supabase } from "@/utils/supabaseClient";
import { Company } from "../empresas/page";

// --- Configuración del calendario en español (sin cambios) ---
const locales = { es: es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// --- Tipos (sin cambios) ---
type CalendarEvent = { title: string; start: Date; end: Date; resource?: any };

const PlannerPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>("");

  // --- OBTENER DATOS ---
  const fetchVisits = useCallback(async () => {
    const { data: visits, error } = await supabase
      .from("visits")
      .select(`id, start_time, end_time, companies ( name )`);
    if (error) {
      console.error("Error al obtener las visitas:", error);
      return;
    }
    const calendarEvents = visits.map((visit: any) => ({
      title: visit.companies?.name || "Visita",
      start: new Date(visit.start_time),
      end: new Date(visit.end_time),
      resource: { id: visit.id },
    }));
    setEvents(calendarEvents);
  }, []);

  useEffect(() => {
    fetchVisits();
    const fetchCompanies = async () => {
      const { data, error } = await supabase
        .from("companies")
        .select(
          "id, name, created_at, contact_person, phone, location_url, notes"
        );
      if (data) setCompanies(data as Company[]);
    };
    fetchCompanies();
  }, [fetchVisits]);

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      setSelectedSlot({ start, end });
      setIsModalOpen(true);
    },
    []
  );

  const handleSaveVisit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !selectedCompany) {
      alert("Por favor, selecciona una empresa.");
      return;
    }
    const { error } = await supabase.from("visits").insert({
      company_id: selectedCompany,
      start_time: selectedSlot.start.toISOString(),
      end_time: selectedSlot.end.toISOString(),
      status: "Planeada",
    });
    if (error) {
      alert("Error al crear la visita: " + error.message);
    } else {
      alert("¡Visita programada con éxito!");
      setIsModalOpen(false);
      setSelectedCompany("");
      fetchVisits();
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Planificador de Visitas
      </h1>
      <div style={{ height: "75vh" }}>
        {/* ------ AQUÍ ESTÁN LAS MODIFICACIONES IMPORTANTES ------ */}
        <Calendar
          localizer={localizer}
          events={events}
          culture="es"
          selectable={true}
          onSelectSlot={handleSelectSlot}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          // --- NUEVAS PROPS DE CONFIGURACIÓN VISUAL ---

          // 1. Define las vistas disponibles: solo semana laboral y día.
          views={["work_week", "day"]}
          // 2. Establece la vista por defecto en 'semana laboral' (Lunes a Viernes).
          defaultView={Views.WORK_WEEK}
          // 3. Define la hora mínima que se mostrará en la vista diaria/semanal.
          min={new Date(0, 0, 0, 7, 0, 0)} // 7:00 AM
          // 4. Define la hora máxima que se mostrará.
          max={new Date(0, 0, 0, 17, 0, 0)} // 17:00 (5:00 PM)
          // 5. Define el tamaño de cada "paso" en el calendario en minutos.
          step={30}
          // 6. Define cuántos "slots" o franjas se muestran por cada "paso".
          // Con step=30 y timeslots=1, tendremos franjas de 30 minutos.
          timeslots={1}
          messages={{
            next: "Siguiente",
            previous: "Anterior",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            work_week: "Semana Laboral", // <-- Nuevo texto para la vista
            agenda: "Agenda",
          }}
        />
        {/* ----------------------------------------------------------- */}
      </div>

      {/* --- El modal (sin cambios por ahora) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-8 bg-white rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Programar Nueva Visita</h2>
            <p className="mb-6">
              Fecha seleccionada:{" "}
              <span className="font-semibold">
                {selectedSlot?.start.toLocaleDateString("es-ES")}
              </span>
            </p>
            <form onSubmit={handleSaveVisit}>
              <div className="mb-6">
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Selecciona una Empresa
                </label>
                <select
                  id="company"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="" disabled>
                    -- Elige una empresa --
                  </option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-green-600 rounded-md"
                >
                  Guardar Visita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerPage;
