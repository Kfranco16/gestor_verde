"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { type Company } from "@/app/dashboard/empresas/page";
import Link from "next/link";

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
          <span className="font-semibold">ID de Cliente:</span> {company.id}
        </p>
        <p>
          <span className="font-semibold">Fecha de Creación:</span>{" "}
          {new Date(company.created_at).toLocaleString()}
        </p>
        {/* Aquí puedes añadir el resto de los campos de la misma manera */}
      </div>
    </div>
  );
}
