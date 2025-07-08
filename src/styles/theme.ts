// src/styles/theme.ts
// Sistema de diseño centralizado para Gestor Verde

export const theme = {
  // Espaciado estandarizado
  spacing: {
    xs: "0.5rem", // 8px
    sm: "0.75rem", // 12px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "3rem", // 48px
  },

  // Colores principales
  colors: {
    primary: {
      50: "rgb(240 253 244)",
      100: "rgb(220 252 231)",
      200: "rgb(187 247 208)",
      300: "rgb(134 239 172)",
      400: "rgb(74 222 128)",
      500: "rgb(34 197 94)",
      600: "rgb(22 163 74)",
      700: "rgb(21 128 61)",
      800: "rgb(22 101 52)",
      900: "rgb(20 83 45)",
    },
    gray: {
      50: "rgb(249 250 251)",
      100: "rgb(243 244 246)",
      200: "rgb(229 231 235)",
      300: "rgb(209 213 219)",
      400: "rgb(156 163 175)",
      500: "rgb(107 114 128)",
      600: "rgb(75 85 99)",
      700: "rgb(55 65 81)",
      800: "rgb(31 41 55)",
      900: "rgb(17 24 39)",
    },
  },

  // Clases CSS estandarizadas
  classes: {
    // Contenedores
    card: "bg-white rounded-lg shadow-md",
    cardPadding: "p-4 md:p-6",
    cardLarge: "p-6 md:p-8",

    // Botones
    buttonPrimary:
      "px-4 py-2 font-semibold text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200",
    buttonSecondary:
      "px-4 py-2 font-semibold text-green-600 bg-white border border-green-600 rounded-lg hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200",
    buttonGray:
      "px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200",

    // Inputs
    input:
      "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500",
    textarea:
      "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 resize-vertical",

    // Textos
    title: "text-lg md:text-xl font-bold text-gray-700",
    titleLarge: "text-xl md:text-2xl font-bold text-gray-800",
    subtitle: "text-sm text-gray-600",

    // Layouts responsivos
    flexResponsive: "flex flex-col md:flex-row gap-4 md:gap-6",
    gridResponsive:
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6",

    // Espaciado
    sectionSpacing: "mb-6 md:mb-8",
    marginTop: "mt-6 md:mt-8",

    // Estados
    loading: "flex items-center justify-center py-8 text-gray-500",
    error:
      "text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3",
    success:
      "text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3",

    // Modales
    modal:
      "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4",
    modalContent:
      "bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto",
    modalContentLarge:
      "bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto",
  },
} as const;

// Helper para combinar clases CSS
export const cn = (
  ...classes: (string | undefined | false | null)[]
): string => {
  return classes.filter(Boolean).join(" ");
};

// Hook personalizado para clases responsivas
export const useResponsiveClass = () => {
  return {
    cardPadding: theme.classes.cardPadding,
    buttonPrimary: theme.classes.buttonPrimary,
    buttonSecondary: theme.classes.buttonSecondary,
    input: theme.classes.input,
    title: theme.classes.title,
    flexResponsive: theme.classes.flexResponsive,
    loading: theme.classes.loading,
  };
};
