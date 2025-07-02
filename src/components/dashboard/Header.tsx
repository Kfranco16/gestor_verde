"use client";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

const Header = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Función para cerrar sesión y redirigir al login
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    // Header sticky y mobile-first
    <header className="bg-white shadow-md sticky top-0 z-30 w-full">
      <nav className="flex items-center justify-between px-3 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 max-w-full">
        {/* Logo/Nombre de la App */}
        <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 select-none">
          🌱 Gestor Verde
        </div>
        {/* Botón de menú hamburguesa solo en mobile/tablet si hay más opciones */}
        <div className="flex items-center gap-2">
          {/* Menú colapsable: solo visible en mobile/tablet */}
          <button
            className="sm:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            type="button"
          >
            {menuOpen ? (
              <XMarkIcon className="w-6 h-6 text-gray-700" />
            ) : (
              <Bars3Icon className="w-6 h-6 text-gray-700" />
            )}
          </button>
          {/* Botón de cerrar sesión: visible siempre en desktop, y en mobile dentro del menú */}
          <div className="hidden sm:block">
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-md"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>
      {/* Menú colapsable para mobile/tablet */}
      {menuOpen && (
        <div className="sm:hidden px-3 pb-2 bg-white border-b border-gray-100 animate-fade-in-down">
          <button
            onClick={() => {
              setMenuOpen(false);
              handleLogout();
            }}
            className="w-full px-3 py-2 text-left text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-md"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
