"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { type Company } from "@/app/dashboard/empresas/page";
import Link from "next/link";
import PlantInventory from "@/components/dashboard/PlantInventory";
import VisitHistory from "@/components/dashboard/VisitHistory";

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params); // Desempaquetar el parámetro id correctamente
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error al obtener detalles de la empresa:", error);
      } else {
        setCompany(data);
      }
      setLoading(false);
    };

    fetchCompanyDetails();
  }, [id]);

  if (loading) {
    return <div className="text-center">Cargando datos de la empresa...</div>;
  }

  if (!company) {
    return <div className="text-center">No se encontró la empresa.</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <Link
        href="/dashboard/empresas"
        className="inline-block mb-6 px-4 py-2 bg-green-100 text-green-700 font-semibold rounded hover:bg-green-200 transition-colors duration-200"
      >
        ← Volver a la lista de empresas
      </Link>
      <h1 className="text-4xl font-bold text-green-700">{company.name}</h1>
      <p className="mt-2 text-gray-500">Expediente del Cliente</p>
      <hr className="my-6" />
      <div className="space-y-4">
        <p>
          <span className="font-semibold">Persona de Contacto:</span>{" "}
          {company.contact_person || "No especificado"}
        </p>
        <p>
          <span className="font-semibold">Teléfono:</span>{" "}
          {company.phone || "No especificado"}
        </p>
        <p>
          <span className="font-semibold">Ubicación:</span>{" "}
          {company.location_url ? (
            <a
              href={company.location_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 underline hover:text-green-900"
            >
              Ver ubicación
            </a>
          ) : (
            "No especificada"
          )}
        </p>
        <p>
          <span className="font-semibold">Notas:</span>{" "}
          {company.notes || "Sin notas"}
        </p>
      </div>
      {/* Inventario de plantas para esta empresa */}
      <PlantInventory companyId={company.id} />
      
      {/* Historial de visitas para esta empresa */}
      <VisitHistory companyId={company.id} />
    </div>
  );
}
