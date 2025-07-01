// Este será nuestro componente de la página de Login.
// Creado con React, TypeScript y estilizado con Tailwind CSS.

// Importamos un icono de una librería popular para darle un toque profesional.
// (Más adelante te explicaré cómo instalar esta librería de iconos).
import { LockClosedIcon, EnvelopeIcon } from "@heroicons/react/24/solid";

const LoginPage = () => {
  return (
    // Contenedor principal que centra todo en la pantalla y le da un fondo suave.
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative w-full max-w-sm m-6">
        {/* Tarjeta principal con sombra y bordes redondeados */}
        <div className="relative z-10 p-8 bg-white rounded-xl shadow-lg">
          {/* Encabezado */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">¡Bienvenido!</h1>
            <p className="mt-2 text-gray-500">Inicia sesión en Gestor Verde</p>
          </div>

          {/* Espacio para una ilustración (opcional) */}
          <div className="my-8 text-center">
            {/* Aquí podríamos poner un SVG de una planta. Por ahora un emoji. */}
            <span className="text-6xl">🌱</span>
          </div>

          {/* Formulario de Login */}
          <form className="space-y-6">
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
                />
              </div>
            </div>

            {/* Botón de Ingresar */}
            <div>
              <button
                type="submit"
                className="flex justify-center w-full px-4 py-3 font-semibold text-white bg-green-600 border border-transparent rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Ingresar
              </button>
            </div>
          </form>
        </div>

        {/* Elemento decorativo de fondo */}
        <div className="absolute top-0 right-0 z-0 w-24 h-24 bg-green-200 rounded-full -mt-12 -mr-12 blur-lg opacity-50"></div>
        <div className="absolute bottom-0 left-0 z-0 w-24 h-24 bg-teal-200 rounded-full -mb-12 -ml-12 blur-lg opacity-50"></div>
      </div>
    </main>
  );
};

export default LoginPage;
