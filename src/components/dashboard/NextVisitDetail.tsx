"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useVisitEvents } from "@/utils/visitEvents";

interface Company {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  location_url: string;
}

interface Visit {
  id: number;
  company_id: number;
  start_time: string;
  end_time: string;
  status: string;
  companies: Company;
}

const NextVisitDetail = () => {
  const [nextVisit, setNextVisit] = useState<Visit | null>(null);
  const [completedVisits, setCompletedVisits] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { onVisitEvent } = useVisitEvents();

  const fetchNextVisit = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Usuario no autenticado");
        setLoading(false);
        return;
      }

      // Obtener visitas del usuario con status "creada"
      const { data: allVisits, error: allVisitsError } = await supabase
        .from("visits")
        .select("id, company_id, start_time, end_time, status")
        .eq("user_id", user.id)
        .eq("status", "creada")
        .order("start_time", { ascending: true });

      if (allVisitsError) {
        setError(`Error al consultar visitas: ${allVisitsError.message}`);
        setLoading(false);
        return;
      }

      if (!allVisits || allVisits.length === 0) {
        setNextVisit(null);
        setCompletedVisits(0);
        setTotalVisits(0);
        setError(null);
        setLoading(false);
        return;
      }

      // Obtener la primera visita (la más próxima)
      const nextVisitBasic = allVisits[0];

      // Validar que el company_id existe
      if (!nextVisitBasic.company_id) {
        setError("La visita no tiene una empresa asignada");
        setLoading(false);
        return;
      }

      // Obtener los datos de la empresa
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("id, name, contact_person, phone, location_url")
        .eq("id", nextVisitBasic.company_id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (companyError) {
        setError(`Error al consultar empresa: ${companyError.message}`);
        setLoading(false);
        return;
      }

      if (!companyData) {
        const basicCompanyData = {
          id: nextVisitBasic.company_id,
          name: `Empresa ${nextVisitBasic.company_id}`,
          contact_person: "No disponible",
          phone: "No disponible",
          location_url: "#",
        };

        const visitWithBasicCompany = {
          ...nextVisitBasic,
          companies: basicCompanyData,
        } as Visit;

        setNextVisit(visitWithBasicCompany);
        setCompletedVisits(0);
        setTotalVisits(0);
        setError("Información de empresa limitada - datos no completos");
        setLoading(false);
        return;
      }

      // Combinar los datos
      const visitWithCompany = {
        ...nextVisitBasic,
        companies: companyData,
      } as Visit;

      setNextVisit(visitWithCompany);

      // Calcular visitas del mes actual para esta empresa
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { data: monthlyVisitsData, error: monthlyVisitsError } =
        await supabase
          .from("visits")
          .select("id, status")
          .eq("user_id", user.id)
          .eq("company_id", nextVisitBasic.company_id)
          .gte("start_time", startOfMonth.toISOString())
          .lte("start_time", endOfMonth.toISOString());

      if (monthlyVisitsError) {
        setCompletedVisits(0);
        setTotalVisits(0);
      } else {
        const completed =
          monthlyVisitsData?.filter((v) => v.status === "terminada").length ||
          0;
        const total = monthlyVisitsData?.length || 0;
        setCompletedVisits(completed);
        setTotalVisits(total);
      }

      setLoading(false);
    } catch (err) {
      setError(
        `Ocurrió un error inesperado: ${
          err instanceof Error ? err.message : "Error desconocido"
        }`
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextVisit();

    // Configurar suscripciones en tiempo real para múltiples tablas
    const visitsChannel = supabase
      .channel("visits_changes_nextvisit")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "visits",
        },
        () => {
          setTimeout(() => fetchNextVisit(), 100);
        }
      )
      .subscribe();

    const companiesChannel = supabase
      .channel("companies_changes_nextvisit")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "companies",
        },
        () => {
          setTimeout(() => fetchNextVisit(), 100);
        }
      )
      .subscribe();

    // Escuchar eventos personalizados de otros componentes
    const unsubscribeVisitCreated = onVisitEvent("visit_created", () => {
      setTimeout(() => fetchNextVisit(), 100);
    });

    const unsubscribeVisitUpdated = onVisitEvent("visit_updated", () => {
      setTimeout(() => fetchNextVisit(), 100);
    });

    const unsubscribeVisitDeleted = onVisitEvent("visit_deleted", () => {
      setTimeout(() => fetchNextVisit(), 100);
    });

    const unsubscribeVisitStatusChanged = onVisitEvent(
      "visit_status_changed",
      () => {
        setTimeout(() => fetchNextVisit(), 100);
      }
    );

    return () => {
      supabase.removeChannel(visitsChannel);
      supabase.removeChannel(companiesChannel);
      unsubscribeVisitCreated();
      unsubscribeVisitUpdated();
      unsubscribeVisitDeleted();
      unsubscribeVisitStatusChanged();
    };
  }, []); // Array de dependencias vacío para que solo se ejecute una vez

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Próxima Visita
        </h2>
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Cargando próxima visita...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Próxima Visita
        </h2>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => {
              fetchNextVisit();
            }}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!nextVisit) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Próxima Visita
        </h2>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-gray-600">No hay visitas planeadas.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCurrentMonthName = () => {
    return new Date().toLocaleDateString("es-ES", { month: "long" });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-700">Próxima Visita</h2>
        <div className="mt-2 md:mt-0 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {completedVisits} de {totalVisits} visitas completadas en{" "}
          {getCurrentMonthName()}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información de la empresa */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {nextVisit.companies.name}
            </h3>
            <p className="text-gray-600 mb-1">
              <strong>Fecha:</strong> {formatDate(nextVisit.start_time)}
            </p>
            <p className="text-gray-600">
              <strong>Hora:</strong> {formatTime(nextVisit.start_time)} -{" "}
              {formatTime(nextVisit.end_time)}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-gray-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-gray-700">
                {nextVisit.companies.contact_person}
              </span>
            </div>

            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-gray-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <a
                href={`tel:${nextVisit.companies.phone}`}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                {nextVisit.companies.phone}
              </a>
            </div>

            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-gray-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <a
                href={nextVisit.companies.location_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Ver ubicación en el mapa
              </a>
            </div>
          </div>
        </div>

        {/* Contador visual */}
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {completedVisits}/{totalVisits}
          </div>
          <div className="text-sm text-gray-600 text-center mb-4">
            Visitas completadas este mes
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{
                width:
                  totalVisits > 0
                    ? `${(completedVisits / totalVisits) * 100}%`
                    : "0%",
              }}
            ></div>
          </div>

          <div className="text-xs text-gray-500">
            {totalVisits > 0
              ? `${Math.round((completedVisits / totalVisits) * 100)}%`
              : "0%"}{" "}
            completado
          </div>
        </div>
      </div>
    </div>
  );
};

export default NextVisitDetail;
