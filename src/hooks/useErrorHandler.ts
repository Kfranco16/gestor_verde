// src/hooks/useErrorHandler.ts
import { useState, useCallback } from "react";

interface ErrorState {
  message: string;
  details?: unknown;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState | null>(null);

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    console.error("Error capturado:", error);

    let message = customMessage || "Ha ocurrido un error inesperado";

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    } else if (error && typeof error === "object" && "message" in error) {
      message = (error as { message: string }).message;
    }

    setError({ message, details: error });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: error !== null,
  };
};

// Hook para manejar estados de carga
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);

  const withLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T> => {
      setIsLoading(true);
      try {
        const result = await asyncFn();
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    setIsLoading,
    withLoading,
  };
};

// Hook combinado para manejo de async operations
export const useAsyncOperation = () => {
  const { error, handleError, clearError } = useErrorHandler();
  const { isLoading, withLoading } = useLoading();

  const executeAsync = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      errorMessage?: string
    ): Promise<T | null> => {
      clearError();
      try {
        return await withLoading(asyncFn);
      } catch (err) {
        handleError(err, errorMessage);
        return null;
      }
    },
    [withLoading, handleError, clearError]
  );

  return {
    isLoading,
    error,
    executeAsync,
    clearError,
  };
};
