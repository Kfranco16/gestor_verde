"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AddCompanyForm from "@/components/dashboard/AddCompanyForm";
import { supabase } from "@/utils/supabaseClient";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";

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

  // Estados para edición de empresa
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editName, setEditName] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [companyFeedback, setCompanyFeedback] = useState<string | null>(null);

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

  // Eliminar empresa
  const handleDeleteCompany = async (companyId: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta empresa?")) return;
    const { error } = await supabase
      .from("companies")
      .delete()
      .eq("id", companyId);
    if (error) {
      setCompanyFeedback("Error al eliminar la empresa: " + error.message);
    } else {
      setCompanyFeedback("Empresa eliminada correctamente.");
      fetchCompanies();
    }
  };

  // Iniciar edición
  const startEditCompany = (company: Company) => {
    setEditingCompany(company);
    setEditName(company.name);
    setEditContact(company.contact_person || "");
    setEditPhone(company.phone || "");
    setEditLocation(company.location_url || "");
    setEditNotes(company.notes || "");
  };

  // Guardar edición
  const handleEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;
    const { error } = await supabase
      .from("companies")
      .update({
        name: editName,
        contact_person: editContact,
        phone: editPhone,
        location_url: editLocation,
        notes: editNotes,
      })
      .eq("id", editingCompany.id);
    if (error) {
      setCompanyFeedback("Error al editar la empresa: " + error.message);
    } else {
      setCompanyFeedback("¡Empresa actualizada!");
      setEditingCompany(null);
      fetchCompanies();
    }
  };

  return (
    <div className="flex flex-col items-center w-full space-y-8">
      {/* Botón para volver al dashboard principal */}
      <div className="flex justify-start w-full max-w-4xl">
        <Link
          href="/dashboard"
          className="inline-block mb-4 px-4 py-2 bg-green-100 text-green-700 font-semibold rounded hover:bg-green-200 transition-colors duration-200"
        >
          ← Volver al Dashboard
        </Link>
      </div>
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
                <li key={company.id} className="relative">
                  <Link
                    href={`/dashboard/empresas/${company.id}`}
                    className="block p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {company.name}
                      </span>
                    </div>
                  </Link>
                  {/* Menú de configuración */}
                  <Menu
                    as="div"
                    className="absolute top-2 right-2 text-right z-10"
                  >
                    <Menu.Button className="p-1 rounded-full hover:bg-gray-200 focus:outline-none">
                      <Cog6ToothIcon className="w-5 h-5 text-gray-500" />
                    </Menu.Button>
                    <Transition
                      as={undefined}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }: { active: boolean }) => (
                              <button
                                onClick={() => startEditCompany(company)}
                                className={`w-full text-left px-4 py-2 text-sm ${
                                  active
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700"
                                }`}
                              >
                                Editar
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }: { active: boolean }) => (
                              <button
                                onClick={() => handleDeleteCompany(company.id)}
                                className={`w-full text-left px-4 py-2 text-sm ${
                                  active
                                    ? "bg-red-50 text-red-700"
                                    : "text-red-600"
                                }`}
                              >
                                Eliminar
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
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

      {/* Formulario para editar empresa (modal simple) */}
      {editingCompany && (
        <form
          onSubmit={handleEditCompany}
          className="fixed inset-0 z-50 flex items-center justify-center bg-transparent"
        >
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="mb-4 text-lg font-semibold text-center">
              Editar Empresa
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="edit-company-name"
                  className="block text-sm font-medium"
                >
                  Nombre de la Empresa
                </label>
                <input
                  id="edit-company-name"
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-company-contact"
                  className="block text-sm font-medium"
                >
                  Persona de Contacto
                </label>
                <input
                  id="edit-company-contact"
                  type="text"
                  value={editContact}
                  onChange={(e) => setEditContact(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-company-phone"
                  className="block text-sm font-medium"
                >
                  Teléfono
                </label>
                <input
                  id="edit-company-phone"
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-company-location"
                  className="block text-sm font-medium"
                >
                  URL de Ubicación
                </label>
                <input
                  id="edit-company-location"
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-company-notes"
                  className="block text-sm font-medium"
                >
                  Notas
                </label>
                <textarea
                  id="edit-company-notes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border rounded-md"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  className="w-full px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
      {/* Feedback visual para empresas */}
      {companyFeedback && (
        <div
          className={`mt-4 text-center text-sm ${
            companyFeedback.startsWith("¡") ? "text-green-600" : "text-red-600"
          }`}
        >
          {companyFeedback}
        </div>
      )}
    </div>
  );
};

export default ManageCompaniesPage;
