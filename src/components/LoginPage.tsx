"use client";
import { useRouter } from "next/navigation";

// Componente de la página de Login principal
// Creado con React, TypeScript y estilizado con Tailwind CSS

// Importaciones de React y librerías necesarias
import React, { useState } from "react";
import Image from "next/image";
import { LockClosedIcon, EnvelopeIcon } from "@heroicons/react/24/solid";
import { supabase } from "@/utils/supabaseClient";

const LoginPage = () => {
  // Estados para almacenar los valores de los campos y el estado de la UI
  const [email, setEmail] = useState(""); // Email del usuario
  const [password, setPassword] = useState(""); // Contraseña del usuario
  const [loading, setLoading] = useState(false); // Estado de carga
  const [error, setError] = useState(""); // Mensaje de error
  const [success, setSuccess] = useState(""); // Mensaje de éxito
  // Nuevo estado para alternar entre registro e inicio de sesión
  const [isRegister, setIsRegister] = useState(false); // true = registro, false = login
  const router = useRouter(); // Hook para redirección

  // Función que maneja el registro de usuario con Supabase
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita el comportamiento por defecto del formulario
    setLoading(true);
    setError("");
    setSuccess("");
    // Llama a la función de registro de Supabase
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setError(error.message); // Muestra el error si ocurre
    } else {
      setSuccess(
        "¡Registro exitoso! Revisa tu correo para confirmar tu cuenta."
      );
    }
    setLoading(false);
  };

  // Función para iniciar sesión con Supabase
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("¡Inicio de sesión exitoso!");
      // Redirige al dashboard tras login exitoso
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    }
    setLoading(false);
  };

  return (
    // Contenedor principal que centra todo en la pantalla y le da un fondo suave.
    <main className="flex items-center justify-center min-h-screen bg-gray-100 p-4 md:p-8">
      {/* En desktop, la tarjeta ocupa todo el ancho disponible igual que el dashboard */}
      <div className="relative w-full flex flex-col items-center justify-center">
        {/* Tarjeta principal con sombra y bordes redondeados */}
        <div className="relative z-10 w-full p-6 sm:p-8 md:p-10 bg-white rounded-xl shadow-lg">
          {/* Encabezado con título y subtítulo */}
          <div className="text-center relative flex flex-col items-center justify-center">
            {/* Imagen gestor verde con doble línea (borde doble) */}
            <span className="inline-block rounded-2xl">
              <span className="block rounded-xl border-4 border-green-500 p-2 shadow-lg drop-shadow-md hover:scale-105 transition-transform duration-300">
                <Image
                  src="/gestor verde.png"
                  alt="Gestor Verde Logo"
                  width={320}
                  height={80}
                  className="mx-auto w-4/5 max-w-full h-auto object-contain rounded-lg md:w-[480px] md:h-[120px] lg:w-[700px] lg:h-[200px]"
                  priority
                />
              </span>
            </span>
          </div>

          {/* Espacio para una ilustración (SVG de planta) y línea decorativa */}
          <div className="my-8 text-center relative flex items-center justify-center">
            {/* Línea doble verde decorativa */}
            <div className="absolute left-0 top-1/2 w-full flex flex-col gap-1 -translate-y-1/2 z-0">
              <div className="h-0.5 w-full bg-green-500 rounded-full"></div>
              <div className="h-0.5 w-full bg-green-300 rounded-full"></div>
            </div>
            <Image
              src="/plant.svg"
              alt="Planta"
              width={100}
              height={100}
              className="mx-auto rounded-full border-4 border-green-500 shadow-lg ring-4 ring-green-200 hover:scale-110 transition-transform duration-300 relative z-10"
            />
          </div>

          {/* Formulario de registro o login */}
          <form
            className="space-y-6 mt-4 md:mt-8"
            onSubmit={isRegister ? handleRegister : handleSignIn}
          >
            {/* Campo de Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="tu@email.com"
                  className="block w-full py-3 pl-10 pr-3 border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Actualiza el estado al escribir
                />
              </div>
            </div>

            {/* Campo de Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <LockClosedIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="block w-full py-3 pl-10 pr-3 border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} // Actualiza el estado al escribir
                />
              </div>
            </div>

            {/* Mensajes de error o éxito */}
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
            {success && (
              <div className="text-green-600 text-sm text-center">
                {success}
              </div>
            )}

            {/* Botones para alternar entre registro e inicio de sesión */}
            <div className="flex justify-center gap-4 mt-4">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg font-semibold border transition-colors ${
                  isRegister
                    ? "bg-green-600 text-white"
                    : "bg-white text-green-600 border-green-600"
                } hover:bg-green-700 hover:text-white`}
                onClick={() => setIsRegister(true)}
                disabled={isRegister}
              >
                Registrarse
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg font-semibold border transition-colors ${
                  !isRegister
                    ? "bg-green-600 text-white"
                    : "bg-white text-green-600 border-green-600"
                } hover:bg-green-700 hover:text-white`}
                onClick={() => setIsRegister(false)}
                disabled={!isRegister}
              >
                Iniciar sesión
              </button>
            </div>

            {/* Botón de Registrarse o Iniciar sesión */}
            <div>
              <button
                type="submit"
                className="flex justify-center w-full md:w-[calc(2*8rem+1rem)] mx-auto px-4 py-3 font-semibold text-white bg-green-600 border border-transparent rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60"
                style={{ maxWidth: "calc(2 * 8rem + 1rem)" }}
                disabled={loading}
              >
                {loading
                  ? isRegister
                    ? "Registrando..."
                    : "Iniciando sesión..."
                  : isRegister
                  ? "Registrarse"
                  : "Iniciar sesión"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
