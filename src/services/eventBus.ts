/**
 * Event Bus for Real-time Simulation
 * 
 * This service simulates WebSocket connections for real-time telemetry.
 * To connect to a real WebSocket server later:
 * 
 * ```
 * const socket = new WebSocket('wss://your-api.com/ws');
 * 
 * socket.onmessage = (event) => {
 *   const data = JSON.parse(event.data);
 *   if (data.type === 'telemetry') {
 *     eventBus.emit('telemetry', data.payload);
 *   }
 * };
 * ```
 */

type EventCallback<T = unknown> = (data: T) => void;

interface TelemetryEvent {
  robot_id: string;
  timestamp: string;
  pose: { x: number; y: number; theta: number };
  battery_pct: number;
  state: string;
  current_task_id?: string;
  localization_confidence: number;
  speed: number;
}

interface AlertEvent {
  id: string;
  robot_id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
}

interface TaskEvent {
  task_id: string;
  status: string;
  message: string;
}

type EventMap = {
  telemetry: TelemetryEvent;
  alert: AlertEvent;
  task_update: TaskEvent;
  simulation_tick: { time: number };
};

class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback as EventCallback);
    };
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  off<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void {
    this.listeners.get(event)?.delete(callback as EventCallback);
  }

  removeAllListeners(event?: keyof EventMap): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export const eventBus = new EventBus();

// Export types
export type { TelemetryEvent, AlertEvent, TaskEvent, EventMap };
