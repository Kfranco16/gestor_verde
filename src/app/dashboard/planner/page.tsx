// src/app/dashboard/planner/page.tsx
"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { es } from "date-fns/locale/es";
import { useRouter } from "next/navigation";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { supabase } from "@/utils/supabaseClient";
import { type Company } from "../empresas/page";
import VisitTasks from "@/components/dashboard/VisitTasks";

// Estilos CSS específicos para móviles
const mobileCalendarStyles = `
  @media (max-width: 768px) {
    .rbc-calendar {
      font-size: 11px !important;
    }
    .rbc-header {
      padding: 3px !important;
      font-size: 9px !important;
      min-height: 25px !important;
    }
    .rbc-time-view .rbc-header {
      border-bottom: 1px solid #ddd !important;
    }
    .rbc-time-slot {
      font-size: 9px !important;
      min-height: 15px !important;
    }
    .rbc-event {
      font-size: 9px !important;
      padding: 1px 2px !important;
      border-radius: 2px !important;
    }
    .rbc-toolbar {
      flex-direction: column !important;
      gap: 10px !important;
      margin-bottom: 15px !important;
      padding: 10px !important;
    }
    .rbc-toolbar-label {
      font-size: 16px !important;
      font-weight: bold !important;
      order: 1 !important;
      text-align: center !important;
      margin-bottom: 8px !important;
    }
    .rbc-btn-group {
      display: flex !important;
      flex-wrap: wrap !important;
      justify-content: center !important;
      gap: 8px !important;
      order: 2 !important;
    }
    .rbc-btn-group button {
      font-size: 14px !important;
      padding: 8px 16px !important;
      margin: 0 !important;
      min-width: 70px !important;
      min-height: 44px !important;
      border: 1px solid #ccc !important;
      border-radius: 6px !important;
      background-color: #fff !important;
      color: #333 !important;
      cursor: pointer !important;
      position: relative !important;
      z-index: 1 !important;
    }
    .rbc-btn-group button:hover {
      background-color: #f5f5f5 !important;
    }
    .rbc-btn-group button.rbc-active {
      background-color: #3b82f6 !important;
      color: white !important;
      border-color: #2563eb !important;
    }
    .rbc-time-view {
      min-height: 400px !important;
    }
    .rbc-time-content {
      min-height: 400px !important;
    }
  }
`;

// Inyectar estilos
if (typeof document !== "undefined") {
  const existingStyle = document.head.querySelector(
    "style[data-mobile-calendar]"
  );
  if (existingStyle) {
    existingStyle.remove();
  }
  const styleElement = document.createElement("style");
  styleElement.textContent = mobileCalendarStyles;
  styleElement.setAttribute("data-mobile-calendar", "true");
  document.head.appendChild(styleElement);
}

const locales = { es: es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  resource: { id: number };
};

const PlannerPage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentView, setCurrentView] = useState(Views.WORK_WEEK);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal para crear visita
  const [isNewVisitModalOpen, setIsNewVisitModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>("");

  // NUEVO: Modal para ver detalles de una visita existente
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  const fetchVisits = useCallback(async () => {
    // MODIFICADO: Ahora solo pedimos las visitas con estado 'creada' para el calendario
    const { data: visits, error } = await supabase
      .from("visits")
      .select(`id, start_time, end_time, companies ( name )`)
      .eq("status", "creada"); // Solo mostramos las visitas planeadas
    if (error) {
      console.error("Error al obtener las visitas:", error);
      return;
    }
    const calendarEvents =
      visits?.map((visit: any) => ({
        title: visit.companies?.name || "Visita",
        start: new Date(visit.start_time),
        end: new Date(visit.end_time),
        resource: { id: visit.id },
      })) || [];
    setEvents(calendarEvents);
  }, []);
  useEffect(() => {
    setMounted(true);

    // Detectar si es móvil
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    fetchVisits();
    const fetchCompanies = async () => {
      // Trae todos los campos requeridos por Company
      const { data, error } = await supabase.from("companies").select();
      if (data) setCompanies(data as Company[]);
    };
    fetchCompanies();

    return () => window.removeEventListener("resize", checkIsMobile);
  }, [fetchVisits]);
  const handleSaveVisit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !selectedCompany) return;

    // 1. Obtenemos el usuario actual ANTES de insertar
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Error: No se pudo identificar al usuario.");
      return;
    }

    // 2. Insertamos la visita, AÑADIENDO el user_id
    const { error } = await supabase.from("visits").insert({
      company_id: selectedCompany,
      start_time: selectedSlot.start.toISOString(),
      end_time: selectedSlot.end.toISOString(),
      status: "creada",
      user_id: user.id, // <-- ¡LA LÍNEA QUE FALTABA!
    });

    if (error) {
      alert("Error al crear la visita: " + error.message);
    } else {
      alert("¡Visita programada con éxito!");
      setIsNewVisitModalOpen(false);
      setSelectedCompany("");
      fetchVisits();
    }
  };
  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      setSelectedSlot({ start, end });
      setIsNewVisitModalOpen(true);
    },
    []
  );

  // --- NUEVA FUNCIÓN: Se ejecuta al hacer clic en un evento existente ---
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  }, []);

  // --- NUEVA FUNCIÓN: Para eliminar una visita ---
  const handleDeleteVisit = async () => {
    if (!selectedEvent || !selectedEvent.resource?.id) {
      alert("No se pudo identificar la visita a eliminar.");
      return;
    }
    const isConfirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la visita a "${selectedEvent.title}"?`
    );
    if (isConfirmed) {
      const { error } = await supabase
        .from("visits")
        .delete()
        .eq("id", selectedEvent.resource.id);
      if (error) {
        alert("Error al eliminar la visita: " + error.message);
      } else {
        alert("¡Visita eliminada con éxito!");
        setIsDetailModalOpen(false);
        setSelectedEvent(null);
        fetchVisits(); // Refrescamos el calendario
      }
    }
  };

  // --- NUEVA FUNCIÓN: Para cambiar el estado de las visitas ---
  const handleUpdateVisitStatus = async (
    visitId: number,
    newStatus: "terminada" | "cancelada"
  ) => {
    const updateData: { status: string; completed_at?: string } = {
      status: newStatus,
    };
    if (newStatus === "terminada") {
      updateData.completed_at = new Date().toISOString(); // Guardamos la fecha y hora actual
    }

    const { error } = await supabase
      .from("visits")
      .update(updateData)
      .eq("id", visitId);

    if (error) {
      alert(`Error al actualizar la visita: ${error.message}`);
    } else {
      alert(`¡Visita marcada como ${newStatus} con éxito!`);
      setIsDetailModalOpen(false);
      fetchVisits(); // Refrescamos el calendario para que la visita desaparezca
    }
  };

  // Handlers para navegación del calendario
  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  const handleViewChange = useCallback((view: any) => {
    setCurrentView(view);
  }, []);

  return (
    <div className="p-2 md:p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-4">
        <h1 className="text-xl md:text-3xl font-bold text-gray-800">
          Planificador de Visitas
        </h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 md:px-6 md:py-3 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300 w-full md:w-auto"
        >
          ← Volver al Dashboard
        </button>
      </div>
      {!mounted ? (
        <div
          className="flex items-center justify-center"
          style={{ height: isMobile ? "60vh" : "75vh" }}
        >
          <div className="text-lg text-gray-500">Cargando calendario...</div>
        </div>
      ) : (
        <div
          style={{
            height: isMobile ? "60vh" : "75vh",
            width: "100%",
            overflow: "auto",
          }}
        >
          <Calendar
            // ... (props del calendario sin cambios) ...
            onSelectEvent={handleSelectEvent} // <-- NUEVO: Prop para manejar clics en eventos
            localizer={localizer}
            events={events}
            culture="es"
            selectable={true}
            onSelectSlot={handleSelectSlot}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            views={["work_week", "day"]}
            defaultView={Views.WORK_WEEK}
            view={currentView}
            date={currentDate}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            min={new Date(0, 0, 0, 7, 0, 0)}
            max={new Date(0, 0, 0, 17, 0, 0)}
            step={15}
            timeslots={1}
            popup={true}
            popupOffset={30}
            toolbar={true}
            messages={{
              next: "Siguiente",
              previous: "Anterior",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
              work_week: "Semana Laboral",
              agenda: "Agenda",
              date: "Fecha",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "No hay eventos en este rango.",
              showMore: (total) => `+ Ver más (${total})`,
            }}
          />
        </div>
      )}

      {/* Modal para CREAR visita */}
      {isNewVisitModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4">
          <div className="p-6 md:p-8 bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-4">
              Programar Nueva Visita
            </h2>
            <p className="mb-2">
              <b>Fecha:</b> {format(selectedSlot.start, "PPP", { locale: es })}
            </p>
            <p className="mb-6">
              <b>Desde:</b> {format(selectedSlot.start, "p", { locale: es })}
              <b> Hasta:</b> {format(selectedSlot.end, "p", { locale: es })}
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
              <div className="flex flex-col md:flex-row justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsNewVisitModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md w-full md:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-green-600 rounded-md w-full md:w-auto"
                >
                  Guardar Visita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Modal para VER DETALLES de la visita --- */}
      {isDetailModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4">
          <div className="p-6 md:p-8 bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-4">
              Detalles de la Visita
            </h2>

            {/* Información básica de la visita */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="mb-2">
                <b>Empresa:</b> {selectedEvent.title}
              </p>
              <p className="mb-2">
                <b>Fecha:</b>{" "}
                {format(selectedEvent.start, "PPP", { locale: es })}
              </p>
              <p className="mb-0">
                <b>Desde:</b> {format(selectedEvent.start, "p", { locale: es })}
                <span className="mx-2">•</span>
                <b>Hasta:</b> {format(selectedEvent.end, "p", { locale: es })}
              </p>
            </div>

            {/* Componente de tareas integrado */}
            <VisitTasks visitId={selectedEvent.resource.id} />

            {/* Botones de acción */}
            <div className="flex flex-col md:flex-row justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md w-full md:w-auto transition-colors duration-200"
              >
                Cerrar
              </button>
              <button
                onClick={() =>
                  handleUpdateVisitStatus(
                    selectedEvent.resource.id,
                    "cancelada"
                  )
                }
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md w-full md:w-auto transition-colors duration-200"
              >
                Cancelar Visita
              </button>
              <button
                onClick={() =>
                  handleUpdateVisitStatus(
                    selectedEvent.resource.id,
                    "terminada"
                  )
                }
                className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-md w-full md:w-auto transition-colors duration-200"
              >
                Marcar como Terminada
              </button>
              <button
                onClick={handleDeleteVisit}
                className="px-4 py-2 text-white bg-orange-600 hover:bg-orange-700 rounded-md w-full md:w-auto transition-colors duration-200"
              >
                Eliminar Visita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerPage;
