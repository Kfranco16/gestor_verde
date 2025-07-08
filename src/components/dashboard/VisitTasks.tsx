// src/components/dashboard/VisitTasks.tsx
"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { supabase } from "@/utils/supabaseClient";

// Definimos el tipo para una Tarea
type Task = {
  id: number;
  title: string;
  is_completed: boolean;
  visit_id: number;
  created_at: string;
};

// El componente recibe el ID de la visita a la que pertenecen estas tareas
export default function VisitTasks({ visitId }: { visitId: number }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Función para obtener las tareas de esta visita
  const fetchTasks = useCallback(async () => {
    if (!visitId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("visit_id", visitId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error al obtener las tareas:", error);
        setTasks([]);
      } else {
        setTasks(data || []);
      }
    } catch (error) {
      console.error("Error inesperado:", error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [visitId]);

  // useEffect para cargar las tareas cuando el componente se muestra
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Función para añadir una nueva tarea
  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return; // No añadir tareas vacías
    if (!visitId) {
      alert("Error: No se pudo identificar la visita");
      return;
    }

    setIsAddingTask(true);
    try {
      const { error } = await supabase.from("tasks").insert([
        {
          title: newTaskTitle.trim(),
          visit_id: visitId,
          is_completed: false,
        },
      ]);

      if (error) {
        alert("Error al añadir la tarea: " + error.message);
      } else {
        setNewTaskTitle("");
        await fetchTasks(); // Refrescamos la lista de tareas
      }
    } catch (error) {
      alert("Error inesperado al añadir la tarea");
      console.error("Error:", error);
    } finally {
      setIsAddingTask(false);
    }
  };

  // Función para marcar una tarea como completada/incompleta
  const handleToggleTask = async (task: Task) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ is_completed: !task.is_completed })
        .eq("id", task.id);

      if (error) {
        alert("Error al actualizar la tarea: " + error.message);
      } else {
        // Actualizar el estado local directamente para mejor UX
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.id === task.id ? { ...t, is_completed: !t.is_completed } : t
          )
        );
      }
    } catch (error) {
      alert("Error inesperado al actualizar la tarea");
      console.error("Error:", error);
    }
  };

  // Función para eliminar una tarea
  const handleDeleteTask = async (taskId: number) => {
    const isConfirmed = window.confirm(
      "¿Estás seguro de que quieres eliminar esta tarea?"
    );
    if (!isConfirmed) return;

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) {
        alert("Error al eliminar la tarea: " + error.message);
      } else {
        // Actualizar el estado local
        setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));
      }
    } catch (error) {
      alert("Error inesperado al eliminar la tarea");
      console.error("Error:", error);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-xl font-bold text-gray-700 mb-4">
        📋 Checklist de Tareas
      </h3>

      {/* Formulario para añadir nuevas tareas */}
      <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Añadir nueva tarea..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          disabled={isAddingTask}
          maxLength={255}
        />
        <button
          type="submit"
          disabled={isAddingTask || !newTaskTitle.trim()}
          className="px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isAddingTask ? "..." : "+"}
        </button>
      </form>

      {/* Lista de tareas existentes */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Cargando tareas...</div>
          </div>
        ) : tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
            >
              <input
                type="checkbox"
                checked={task.is_completed}
                onChange={() => handleToggleTask(task)}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <span
                className={`flex-grow text-sm ${
                  task.is_completed
                    ? "line-through text-gray-400"
                    : "text-gray-700"
                }`}
              >
                {task.title}
              </span>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors duration-200"
                title="Eliminar tarea"
              >
                🗑️
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">
              No hay tareas para esta visita.
            </p>
          </div>
        )}
      </div>

      {/* Estadísticas de tareas */}
      {tasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total: {tasks.length} tareas</span>
            <span>
              Completadas: {tasks.filter((t) => t.is_completed).length} /{" "}
              {tasks.length}
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  tasks.length > 0
                    ? (tasks.filter((t) => t.is_completed).length /
                        tasks.length) *
                      100
                    : 0
                }%`,
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
