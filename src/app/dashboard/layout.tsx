// src/app/dashboard/layout.tsx
import React from "react";
import Header from "@/components/dashboard/Header";

// Layout que envuelve todas las páginas dentro de /dashboard
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header /> {/* Barra de navegación superior */}
      <main className="flex-grow p-4 md:p-8">
        {children} {/* Contenido de la página actual */}
      </main>
    </div>
  );
}
