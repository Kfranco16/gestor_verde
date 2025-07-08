// Sistema de eventos para actualizaciones de visitas
// Permite que diferentes componentes notifiquen cambios y otros componentes los escuchen

type VisitEventType =
  | "visit_created"
  | "visit_updated"
  | "visit_deleted"
  | "visit_status_changed";

interface VisitEvent {
  type: VisitEventType;
  payload?: unknown;
  timestamp: number;
}

class VisitEventManager {
  private listeners: Map<VisitEventType, Set<(event: VisitEvent) => void>> =
    new Map();

  // Registrar un listener para un tipo de evento específico
  on(eventType: VisitEventType, callback: (event: VisitEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Devolver función para cleanup
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  // Emitir un evento
  emit(eventType: VisitEventType, payload?: unknown) {
    const event: VisitEvent = {
      type: eventType,
      payload,
      timestamp: Date.now(),
    };

    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error("Error en listener de evento de visita:", error);
        }
      });
    }
  }

  // Limpiar todos los listeners
  clear() {
    this.listeners.clear();
  }
}

// Instancia global del manager
export const visitEventManager = new VisitEventManager();

// Hook para usar en componentes React
export const useVisitEvents = () => {
  return {
    // Funciones para emitir eventos
    notifyVisitCreated: (payload?: unknown) =>
      visitEventManager.emit("visit_created", payload),
    notifyVisitUpdated: (payload?: unknown) =>
      visitEventManager.emit("visit_updated", payload),
    notifyVisitDeleted: (payload?: unknown) =>
      visitEventManager.emit("visit_deleted", payload),
    notifyVisitStatusChanged: (payload?: unknown) =>
      visitEventManager.emit("visit_status_changed", payload),

    // Función para escuchar eventos
    onVisitEvent: (
      eventType: VisitEventType,
      callback: (event: VisitEvent) => void
    ) => {
      return visitEventManager.on(eventType, callback);
    },
  };
};
