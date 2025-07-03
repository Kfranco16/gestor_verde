// src/components/dashboard/PlantInventory.tsx
"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";

// Definimos el "tipo" para una planta
type Plant = {
  id: number;
  name: string;
  scientific_name?: string;
  location_in_site: string;
  notes?: string;
};

// El componente recibe el ID de la empresa a la que pertenece este inventario
export default function PlantInventory({ companyId }: { companyId: number }) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  // Estados para el formulario de añadir planta
  const [plantName, setPlantName] = useState("");
  const [plantScientificName, setPlantScientificName] = useState("");
  const [plantLocation, setPlantLocation] = useState("");
  const [plantNotes, setPlantNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Estados para edición
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [editName, setEditName] = useState("");
  const [editScientificName, setEditScientificName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Función para obtener las plantas de esta empresa
  const fetchPlants = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .eq("company_id", companyId)
      .order("name", { ascending: true });

    if (error) {
      setFeedback("Error al obtener las plantas: " + error.message);
    } else {
      setPlants(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPlants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  // Función para manejar el envío del formulario de nueva planta
  const handleAddPlant = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const { error } = await supabase.from("plants").insert([
      {
        name: plantName,
        scientific_name: plantScientificName,
        location_in_site: plantLocation,
        notes: plantNotes,
        company_id: companyId,
      },
    ]);

    if (error) {
      setFeedback("Error al añadir la planta: " + error.message);
    } else {
      setFeedback("¡Planta añadida con éxito!");
      setPlantName("");
      setPlantScientificName("");
      setPlantLocation("");
      setPlantNotes("");
      setIsFormVisible(false); // Ocultamos el formulario
      fetchPlants(); // ¡Refrescamos la lista de plantas!
    }
    setIsSubmitting(false);
  };

  // Función para eliminar planta
  const handleDeletePlant = async (plantId: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta planta?")) return;
    const { error } = await supabase.from("plants").delete().eq("id", plantId);
    if (error) {
      setFeedback("Error al eliminar la planta: " + error.message);
    } else {
      setFeedback("Planta eliminada correctamente.");
      fetchPlants();
    }
  };

  // Función para iniciar edición
  const startEditPlant = (plant: Plant) => {
    setEditingPlant(plant);
    setEditName(plant.name);
    setEditScientificName(plant.scientific_name || "");
    setEditLocation(plant.location_in_site);
    setEditNotes(plant.notes || "");
  };

  // Función para guardar edición
  const handleEditPlant = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingPlant) return;
    setIsSubmitting(true);
    setFeedback(null);
    const { error } = await supabase
      .from("plants")
      .update({
        name: editName,
        scientific_name: editScientificName,
        location_in_site: editLocation,
        notes: editNotes,
      })
      .eq("id", editingPlant.id);
    if (error) {
      setFeedback("Error al editar la planta: " + error.message);
    } else {
      setFeedback("¡Planta actualizada!");
      setEditingPlant(null);
      fetchPlants();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-6 mt-8 bg-gray-50 rounded-lg shadow-inner">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-700">
          Inventario de Plantas
        </h2>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          {isFormVisible ? "Cancelar" : "+ Añadir Planta"}
        </button>
      </div>

      {/* Feedback visual */}
      {feedback && (
        <div
          className={`mt-4 text-center text-sm ${
            feedback.startsWith("¡") ? "text-green-600" : "text-red-600"
          }`}
        >
          {feedback}
        </div>
      )}

      {/* Formulario para añadir planta (se muestra condicionalmente) */}
      {isFormVisible && (
        <form
          onSubmit={handleAddPlant}
          className="p-4 mt-4 bg-white border rounded-md"
        >
          <h3 className="mb-4 text-lg font-semibold">Nueva Planta</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="plant-name" className="block text-sm font-medium">
                Nombre de la Planta
              </label>
              <input
                id="plant-name"
                type="text"
                required
                value={plantName}
                onChange={(e) => setPlantName(e.target.value)}
                className="w-full px-3 py-2 mt-1 border rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="plant-scientific-name"
                className="block text-sm font-medium"
              >
                Nombre Científico
              </label>
              <input
                id="plant-scientific-name"
                type="text"
                value={plantScientificName}
                onChange={(e) => setPlantScientificName(e.target.value)}
                className="w-full px-3 py-2 mt-1 border rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="plant-location"
                className="block text-sm font-medium"
              >
                Ubicación en el Sitio
              </label>
              <input
                id="plant-location"
                type="text"
                required
                value={plantLocation}
                onChange={(e) => setPlantLocation(e.target.value)}
                className="w-full px-3 py-2 mt-1 border rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="plant-notes"
                className="block text-sm font-medium"
              >
                Notas
              </label>
              <textarea
                id="plant-notes"
                value={plantNotes}
                onChange={(e) => setPlantNotes(e.target.value)}
                className="w-full px-3 py-2 mt-1 border rounded-md"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-md disabled:bg-gray-400"
            >
              {isSubmitting ? "Guardando..." : "Guardar Planta"}
            </button>
          </div>
        </form>
      )}

      {/* Formulario para editar planta (modal simple) */}
      {editingPlant && (
        <form
          onSubmit={handleEditPlant}
          className="p-4 mt-4 bg-white border rounded-md shadow-lg"
        >
          <h3 className="mb-4 text-lg font-semibold">Editar Planta</h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="edit-plant-name"
                className="block text-sm font-medium"
              >
                Nombre de la Planta
              </label>
              <input
                id="edit-plant-name"
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 mt-1 border rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="edit-plant-scientific-name"
                className="block text-sm font-medium"
              >
                Nombre Científico
              </label>
              <input
                id="edit-plant-scientific-name"
                type="text"
                value={editScientificName}
                onChange={(e) => setEditScientificName(e.target.value)}
                className="w-full px-3 py-2 mt-1 border rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="edit-plant-location"
                className="block text-sm font-medium"
              >
                Ubicación en el Sitio
              </label>
              <input
                id="edit-plant-location"
                type="text"
                required
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full px-3 py-2 mt-1 border rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="edit-plant-notes"
                className="block text-sm font-medium"
              >
                Notas
              </label>
              <textarea
                id="edit-plant-notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full px-3 py-2 mt-1 border rounded-md"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingPlant(null)}
                className="w-full px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-md disabled:bg-gray-400"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Lista de plantas existentes */}
      <div className="mt-6">
        {isLoading ? (
          <p>Cargando inventario...</p>
        ) : (
          <ul className="space-y-3">
            {plants.map((plant) => (
              <li
                key={plant.id}
                className="p-3 bg-white rounded-md shadow-sm relative"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold">{plant.name}</p>
                    {plant.scientific_name && (
                      <p className="text-sm text-gray-700 italic">
                        {plant.scientific_name}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      {plant.location_in_site}
                    </p>
                    {plant.notes && (
                      <p className="text-xs text-gray-500 mt-1">
                        Notas: {plant.notes}
                      </p>
                    )}
                  </div>
                  {/* Menú de configuración */}
                  <Menu
                    as="div"
                    className="absolute top-2 right-2 text-right z-10"
                  >
                    <Menu.Button className="p-1 rounded-full hover:bg-gray-200 focus:outline-none">
                      <Cog6ToothIcon className="w-5 h-5 text-gray-500" />
                    </Menu.Button>
                    <Transition
                      as={React.Fragment}
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
                            {({ active }) => (
                              <button
                                onClick={() => startEditPlant(plant)}
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
                            {({ active }) => (
                              <button
                                onClick={() => handleDeletePlant(plant.id)}
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
                </div>
              </li>
            ))}
          </ul>
        )}
        {!isLoading && plants.length === 0 && (
          <p className="mt-4 text-center text-gray-500">
            No hay plantas en el inventario para esta empresa.
          </p>
        )}
      </div>
    </div>
  );
}
