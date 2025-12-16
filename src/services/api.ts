/**
 * API Service Layer
 * 
 * This file contains all API functions that currently return mock data.
 * To connect to a real backend later:
 * 1. Replace the mock implementations with fetch() or axios calls
 * 2. Update the base URL to your API endpoint
 * 3. Add proper authentication headers
 * 
 * Example replacement:
 * ```
 * const API_BASE = 'https://your-api.com/api/v1';
 * 
 * export const getRobots = async (): Promise<Robot[]> => {
 *   const response = await fetch(`${API_BASE}/robots`, {
 *     headers: { Authorization: `Bearer ${getToken()}` }
 *   });
 *   return response.json();
 * };
 * ```
 */

import { 
  robots, tasks, floorMaps, alerts, models, logs, users,
  Robot, Task, FloorMap, Alert, Model, LogEntry, User
} from './mockData';

// Simulated network delay (adjust for testing)
const NETWORK_DELAY = 300;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// === Robots ===
export const getRobots = async (): Promise<Robot[]> => {
  await delay(NETWORK_DELAY);
  return [...robots];
};

export const getRobotById = async (id: string): Promise<Robot | undefined> => {
  await delay(NETWORK_DELAY);
  return robots.find(r => r.id === id);
};

export const updateRobot = async (id: string, updates: Partial<Robot>): Promise<Robot> => {
  await delay(NETWORK_DELAY);
  const index = robots.findIndex(r => r.id === id);
  if (index === -1) throw new Error('Robot not found');
  robots[index] = { ...robots[index], ...updates };
  return robots[index];
};

// === Tasks ===
export const getTasks = async (): Promise<Task[]> => {
  await delay(NETWORK_DELAY);
  return [...tasks];
};

export const getTaskById = async (id: string): Promise<Task | undefined> => {
  await delay(NETWORK_DELAY);
  return tasks.find(t => t.id === id);
};

export const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'status'>): Promise<Task> => {
  await delay(NETWORK_DELAY);
  const newTask: Task = {
    ...task,
    id: `task_${Date.now()}`,
    created_at: new Date().toISOString(),
    status: 'queued',
  };
  tasks.unshift(newTask);
  return newTask;
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
  await delay(NETWORK_DELAY);
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Task not found');
  tasks[index] = { ...tasks[index], ...updates };
  return tasks[index];
};

export const assignRobotToTask = async (taskId: string, robotId: string): Promise<Task> => {
  await delay(NETWORK_DELAY);
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) throw new Error('Task not found');
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    assigned_robot: robotId,
    status: 'assigned',
    eta_minutes: Math.floor(Math.random() * 10) + 5,
  };
  return tasks[taskIndex];
};

// === Maps ===
export const getMaps = async (): Promise<FloorMap[]> => {
  await delay(NETWORK_DELAY);
  return [...floorMaps];
};

export const getMapByFloor = async (floor: number): Promise<FloorMap | undefined> => {
  await delay(NETWORK_DELAY);
  return floorMaps.find(m => m.floor === floor);
};

// === Alerts ===
export const getAlerts = async (): Promise<Alert[]> => {
  await delay(NETWORK_DELAY);
  return [...alerts];
};

export const acknowledgeAlert = async (id: string): Promise<Alert> => {
  await delay(NETWORK_DELAY);
  const index = alerts.findIndex(a => a.id === id);
  if (index === -1) throw new Error('Alert not found');
  alerts[index] = { ...alerts[index], acknowledged: true };
  return alerts[index];
};

export const resolveAlert = async (id: string): Promise<Alert> => {
  await delay(NETWORK_DELAY);
  const index = alerts.findIndex(a => a.id === id);
  if (index === -1) throw new Error('Alert not found');
  alerts[index] = { ...alerts[index], acknowledged: true, resolved: true };
  return alerts[index];
};

// === Models ===
export const getModels = async (): Promise<Model[]> => {
  await delay(NETWORK_DELAY);
  return [...models];
};

export const rolloutModel = async (modelId: string, robotIds: string[]): Promise<Model> => {
  await delay(NETWORK_DELAY * 3); // Longer delay for rollout
  const index = models.findIndex(m => m.id === modelId);
  if (index === -1) throw new Error('Model not found');
  models[index] = {
    ...models[index],
    deployed_to: [...new Set([...models[index].deployed_to, ...robotIds])],
  };
  return models[index];
};

// === Logs ===
export const getLogs = async (filters?: {
  event_type?: string;
  user_id?: string;
  robot_id?: string;
  from_date?: string;
  to_date?: string;
}): Promise<LogEntry[]> => {
  await delay(NETWORK_DELAY);
  let filtered = [...logs];
  
  if (filters?.event_type) {
    filtered = filtered.filter(l => l.event_type === filters.event_type);
  }
  if (filters?.user_id) {
    filtered = filtered.filter(l => l.user_id === filters.user_id);
  }
  if (filters?.robot_id) {
    filtered = filtered.filter(l => l.robot_id === filters.robot_id);
  }
  
  return filtered;
};

export const addLogEntry = async (entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<LogEntry> => {
  await delay(100);
  const newEntry: LogEntry = {
    ...entry,
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newEntry);
  return newEntry;
};

// === Users ===
export const getUsers = async (): Promise<User[]> => {
  await delay(NETWORK_DELAY);
  return [...users];
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  await delay(NETWORK_DELAY);
  return users.find(u => u.id === id);
};
