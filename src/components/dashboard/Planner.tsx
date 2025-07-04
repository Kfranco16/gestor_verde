// src/components/dashboard/Planner.tsx
"use client";

import Link from "next/link";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

const Planner = () => {
  return (
    <div className="p-6 mt-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2 justify-center">
        <span className="inline-block p-2 bg-blue-100 rounded-full">
          <CalendarDaysIcon className="w-7 h-7 text-blue-500" />
        </span>
        Planificador de Visitas
      </h2>
      <p className="mt-2 text-gray-500 text-center">
        Programa y visualiza tus próximas visitas.
      </p>
      <div className="mt-6 flex flex-col items-center">
        <div className="w-full max-w-md p-4 bg-gray-100 bg-opacity-70 rounded-md border border-gray-200 text-center">
          <p className="text-black">
            Vista previa del calendario próximamente.
          </p>
        </div>
        <Link
          href="/dashboard/planner"
          className="mt-6 px-6 py-3 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300"
        >
          Ir al Planificador
        </Link>
      </div>
    </div>
  );
};

export default Planner;
