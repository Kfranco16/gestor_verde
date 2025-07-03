"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AddCompanyForm from "@/components/dashboard/AddCompanyForm";
import { supabase } from "@/utils/supabaseClient";

// Hacemos "export" para poder usar este tipo en otros archivos, como en la página de detalle.
export type Company = {
  id: number;
  name: string;
  created_at: string;
  contact_person?: string;
  phone?: string;
  location_url?: string;
  notes?: string;
};

const ManageCompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const fetchCompanies = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener las empresas:", error);
    } else {
      setCompanies(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <div className="flex flex-col items-center w-full space-y-8">
      {/* Botón para mostrar el formulario modal */}
      <div className="flex justify-start w-full max-w-4xl">
        <button
          onClick={() => setIsFormVisible(true)}
          className="px-6 py-3 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300"
        >
          + Agregar Nueva Empresa
        </button>
      </div>

      {/* El formulario modal que aparece y desaparece */}
      {isFormVisible && (
        <AddCompanyForm
          onClose={() => setIsFormVisible(false)}
          onCompanyAdded={() => {
            fetchCompanies(); // <-- ¡Refrescamos la lista cuando se añade una nueva empresa!
          }}
        />
      )}

      {/* La sección para mostrar la lista de empresas */}
      <div className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Empresas Registradas
        </h2>
        <div className="mt-6">
          {isLoading ? (
            <p className="text-center text-gray-500">Cargando empresas...</p>
          ) : (
            <ul className="space-y-4">
              {/* Aquí mapeamos las empresas y cada una es un Link */}
              {companies.map((company) => (
                <li key={company.id}>
                  <Link
                    href={`/dashboard/empresas/${company.id}`}
                    className="block p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {company.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        Creada:{" "}
                        {new Date(company.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {!isLoading && companies.length === 0 && (
            <p className="text-center text-gray-500">
              Aún no has añadido ninguna empresa.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCompaniesPage;
