// Mock data for the Healthcare Robot Logistics Platform
// Replace with real API calls later - see services/api.ts

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'operator' | 'clinician' | 'guest';
  email: string;
  avatar?: string;
}

export interface Robot {
  id: string;
  name: string;
  status: 'idle' | 'en_route' | 'charging' | 'error' | 'offline';
  battery: number;
  floor: number;
  pose: { x: number; y: number; theta: number };
  localization_confidence: number;
  current_task_id?: string;
  last_seen: string;
  speed?: number;
}

export interface Task {
  id: string;
  requester: string;
  from_zone: string;
  to_zone: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  payload: string;
  status: 'queued' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
  assigned_robot?: string;
  created_at: string;
  completed_at?: string;
  eta_minutes?: number;
  notes?: string;
}

export interface Zone {
  id: string;
  type: 'clinical' | 'pharmacy' | 'corridor' | 'elevator' | 'storage' | 'restricted';
  polygon: number[][];
  access: 'public' | 'restricted' | 'staff_only';
  floor: number;
  name: string;
}

export interface FloorMap {
  map_id: string;
  floor: number;
  floorplan_svg?: string;
  zones: Zone[];
  name: string;
}

export interface Alert {
  id: string;
  robot_id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolved?: boolean;
}

export interface Model {
  id: string;
  type: 'SLAM' | 'NLP' | 'PathPlanning';
  version: string;
  metrics: Record<string, number>;
  deployed_to: string[];
  created_at: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  event_type: string;
  user_id?: string;
  robot_id?: string;
  task_id?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

// Seed data
export const users: User[] = [
  { id: "u_admin", name: "Alice Admin", role: "admin", email: "alice@hospital.test", avatar: "AA" },
  { id: "u_operator", name: "Omar Operator", role: "operator", email: "omar@hospital.test", avatar: "OO" },
  { id: "u_clinician", name: "Nina Clinician", role: "clinician", email: "nina@hospital.test", avatar: "NC" },
  { id: "u_guest", name: "Guest User", role: "guest", email: "guest@hospital.test", avatar: "GU" },
];

export const robots: Robot[] = [
  {
    id: "robot_R07",
    name: "R-07",
    status: "en_route",
    battery: 72,
    floor: 2,
    pose: { x: 120, y: 180, theta: 1.57 },
    localization_confidence: 0.95,
    current_task_id: "task_001",
    last_seen: new Date().toISOString(),
    speed: 0.8,
  },
  {
    id: "robot_R08",
    name: "R-08",
    status: "idle",
    battery: 98,
    floor: 1,
    pose: { x: 80, y: 120, theta: 0.2 },
    localization_confidence: 0.99,
    last_seen: new Date().toISOString(),
    speed: 0,
  },
  {
    id: "robot_R09",
    name: "R-09",
    status: "charging",
    battery: 45,
    floor: 1,
    pose: { x: 50, y: 50, theta: 0 },
    localization_confidence: 0.97,
    last_seen: new Date().toISOString(),
    speed: 0,
  },
  {
    id: "robot_R10",
    name: "R-10",
    status: "en_route",
    battery: 85,
    floor: 3,
    pose: { x: 200, y: 150, theta: 3.14 },
    localization_confidence: 0.92,
    current_task_id: "task_003",
    last_seen: new Date().toISOString(),
    speed: 1.2,
  },
  {
    id: "robot_R11",
    name: "R-11",
    status: "error",
    battery: 60,
    floor: 2,
    pose: { x: 150, y: 100, theta: 0.5 },
    localization_confidence: 0.75,
    last_seen: new Date(Date.now() - 300000).toISOString(),
    speed: 0,
  },
];

export const tasks: Task[] = [
  {
    id: "task_001",
    requester: "u_clinician",
    from_zone: "Pharmacy",
    to_zone: "Ward 5B",
    priority: "high",
    payload: "Medication",
    status: "in_progress",
    assigned_robot: "robot_R07",
    created_at: new Date(Date.now() - 600000).toISOString(),
    eta_minutes: 8,
    notes: "Urgent insulin delivery",
  },
  {
    id: "task_002",
    requester: "u_clinician",
    from_zone: "Lab",
    to_zone: "Ward 3A",
    priority: "normal",
    payload: "Sample",
    status: "queued",
    created_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "task_003",
    requester: "u_operator",
    from_zone: "Storage",
    to_zone: "ICU",
    priority: "critical",
    payload: "Equipment",
    status: "in_progress",
    assigned_robot: "robot_R10",
    created_at: new Date(Date.now() - 900000).toISOString(),
    eta_minutes: 3,
  },
  {
    id: "task_004",
    requester: "u_clinician",
    from_zone: "Pharmacy",
    to_zone: "ER",
    priority: "high",
    payload: "Medication",
    status: "completed",
    assigned_robot: "robot_R08",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    completed_at: new Date(Date.now() - 3000000).toISOString(),
  },
];

export const floorMaps: FloorMap[] = [
  {
    map_id: "floor1_v1",
    floor: 1,
    name: "Ground Floor",
    zones: [
      { id: "lobby", type: "corridor", name: "Main Lobby", polygon: [[20, 20], [180, 20], [180, 80], [20, 80]], access: "public", floor: 1 },
      { id: "pharmacy", type: "pharmacy", name: "Pharmacy", polygon: [[200, 20], [280, 20], [280, 100], [200, 100]], access: "staff_only", floor: 1 },
      { id: "storage", type: "storage", name: "Storage Room", polygon: [[20, 100], [80, 100], [80, 180], [20, 180]], access: "restricted", floor: 1 },
      { id: "elevator1", type: "elevator", name: "Elevator A", polygon: [[140, 160], [180, 160], [180, 200], [140, 200]], access: "public", floor: 1 },
    ],
  },
  {
    map_id: "floor2_v1",
    floor: 2,
    name: "Ward Floor",
    zones: [
      { id: "ward5b", type: "clinical", name: "Ward 5B", polygon: [[20, 20], [120, 20], [120, 100], [20, 100]], access: "staff_only", floor: 2 },
      { id: "ward5a", type: "clinical", name: "Ward 5A", polygon: [[140, 20], [240, 20], [240, 100], [140, 100]], access: "staff_only", floor: 2 },
      { id: "icu", type: "restricted", name: "ICU", polygon: [[20, 120], [100, 120], [100, 200], [20, 200]], access: "restricted", floor: 2 },
      { id: "corridor2", type: "corridor", name: "Main Corridor", polygon: [[100, 100], [240, 100], [240, 120], [100, 120]], access: "public", floor: 2 },
    ],
  },
  {
    map_id: "floor3_v1",
    floor: 3,
    name: "Lab Floor",
    zones: [
      { id: "lab", type: "clinical", name: "Laboratory", polygon: [[20, 20], [150, 20], [150, 120], [20, 120]], access: "restricted", floor: 3 },
      { id: "ward3a", type: "clinical", name: "Ward 3A", polygon: [[170, 20], [280, 20], [280, 120], [170, 120]], access: "staff_only", floor: 3 },
      { id: "er", type: "clinical", name: "Emergency Room", polygon: [[20, 140], [150, 140], [150, 220], [20, 220]], access: "restricted", floor: 3 },
    ],
  },
];

export const alerts: Alert[] = [
  {
    id: "alert_101",
    robot_id: "robot_R07",
    severity: "warning",
    message: "Low localization confidence in Corridor B (75%)",
    timestamp: new Date(Date.now() - 180000).toISOString(),
    acknowledged: false,
  },
  {
    id: "alert_102",
    robot_id: "robot_R11",
    severity: "critical",
    message: "Wheel slip detected - Robot stopped",
    timestamp: new Date(Date.now() - 60000).toISOString(),
    acknowledged: false,
  },
  {
    id: "alert_103",
    robot_id: "robot_R09",
    severity: "info",
    message: "Battery low - Returning to charging station",
    timestamp: new Date(Date.now() - 600000).toISOString(),
    acknowledged: true,
  },
];

export const models: Model[] = [
  {
    id: "slam_v1",
    type: "SLAM",
    version: "1.0.0",
    metrics: { localization_confidence: 0.96, mapping_accuracy: 0.94 },
    deployed_to: ["robot_R07", "robot_R08", "robot_R09"],
    created_at: "2025-12-01T00:00:00Z",
  },
  {
    id: "slam_v2",
    type: "SLAM",
    version: "2.0.0-beta",
    metrics: { localization_confidence: 0.98, mapping_accuracy: 0.97 },
    deployed_to: ["robot_R10"],
    created_at: "2025-12-10T00:00:00Z",
  },
  {
    id: "nlp_v2",
    type: "NLP",
    version: "2.0.0",
    metrics: { intent_accuracy: 0.93, response_time_ms: 45 },
    deployed_to: ["robot_R07", "robot_R08", "robot_R09", "robot_R10", "robot_R11"],
    created_at: "2025-11-15T00:00:00Z",
  },
  {
    id: "path_v1",
    type: "PathPlanning",
    version: "1.2.0",
    metrics: { path_efficiency: 0.89, obstacle_avoidance: 0.95 },
    deployed_to: ["robot_R07", "robot_R08", "robot_R09", "robot_R10", "robot_R11"],
    created_at: "2025-10-20T00:00:00Z",
  },
];

export const logs: LogEntry[] = [
  {
    id: "log_001",
    timestamp: new Date(Date.now() - 60000).toISOString(),
    event_type: "task_created",
    user_id: "u_clinician",
    task_id: "task_001",
    message: "New delivery task created: Pharmacy → Ward 5B",
  },
  {
    id: "log_002",
    timestamp: new Date(Date.now() - 55000).toISOString(),
    event_type: "task_assigned",
    robot_id: "robot_R07",
    task_id: "task_001",
    message: "Task assigned to robot R-07",
  },
  {
    id: "log_003",
    timestamp: new Date(Date.now() - 30000).toISOString(),
    event_type: "robot_alert",
    robot_id: "robot_R11",
    message: "Critical alert: Wheel slip detected",
  },
];

// Demo credentials
export const demoCredentials = {
  admin: { email: "alice@hospital.test", password: "AdminDemo123!" },
  operator: { email: "omar@hospital.test", password: "OperatorDemo123!" },
  clinician: { email: "nina@hospital.test", password: "ClinicianDemo123!" },
};
