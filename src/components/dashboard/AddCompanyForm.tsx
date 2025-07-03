"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { XMarkIcon } from "@heroicons/react/24/solid";

// Props para controlar cierre y notificación al padre
interface AddCompanyFormProps {
  onClose: () => void;
  onCompanyAdded: () => void;
}

const AddCompanyForm = ({ onClose, onCompanyAdded }: AddCompanyFormProps) => {
  // Estados para cada campo del formulario
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [locationUrl, setLocationUrl] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función que se ejecuta al enviar el formulario
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // 1. Obtener el usuario actual para conseguir su ID
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("No estás autenticado. Por favor, inicia sesión de nuevo.");
      setIsSubmitting(false);
      return;
    }

    // 2. Intentar insertar los datos en la tabla 'companies'
    const { error: insertError } = await supabase.from("companies").insert([
      {
        name,
        contact_person: contactPerson,
        phone,
        location_url: locationUrl,
        notes,
        user_id: user.id, // <-- Enlazamos la empresa con el usuario actual
      },
    ]);

    if (insertError) {
      setError(insertError.message);
    } else {
      // Limpiamos el formulario
      setName("");
      setContactPerson("");
      setPhone("");
      setLocationUrl("");
      setNotes("");
      onCompanyAdded(); // Avisamos al padre
      onClose(); // Cerramos el modal automáticamente
    }

    setIsSubmitting(false);
  };

  return (
    // Fondo completamente transparente del modal
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
      {/* Contenedor del formulario modal */}
      <div className="relative w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md">
        {/* Botón para cerrar el modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Cerrar"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Añadir Nueva Empresa
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Nombre de la Empresa */}
          <div>
            <label
              htmlFor="company-name"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre de la Empresa
            </label>
            <input
              id="company-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>
          {/* Campo Persona de Contacto */}
          <div>
            <label
              htmlFor="contact-person"
              className="block text-sm font-medium text-gray-700"
            >
              Persona de Contacto
            </label>
            <input
              id="contact-person"
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>
          {/* Campo Teléfono */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Teléfono
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>
          {/* Campo URL de Ubicación */}
          <div>
            <label
              htmlFor="location-url"
              className="block text-sm font-medium text-gray-700"
            >
              URL de Ubicación
            </label>
            <input
              id="location-url"
              type="url"
              value={locationUrl}
              onChange={(e) => setLocationUrl(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>
          {/* Campo Notas */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700"
            >
              Notas
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>
          {error && <p className="text-sm text-center text-red-600">{error}</p>}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-3 font-semibold text-gray-700 bg-gray-200 rounded-lg shadow-sm hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 font-semibold text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
            >
              {isSubmitting ? "Guardando..." : "Guardar Empresa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCompanyForm;
