/**
 * Simulation Service
 * 
 * Handles real-time simulation of robot telemetry, task updates, and alerts.
 * This creates a realistic demo experience without a backend.
 */

import { eventBus, TelemetryEvent } from './eventBus';
import { robots, tasks, alerts, Robot } from './mockData';

interface SimulationConfig {
  telemetryInterval: number; // ms
  alertProbability: number; // 0-1
  taskCompletionTime: number; // ms
  speed: number; // 0.5x, 1x, 2x
}

const defaultConfig: SimulationConfig = {
  telemetryInterval: 1000,
  alertProbability: 0.02,
  taskCompletionTime: 30000,
  speed: 1,
};

class SimulationService {
  private running = false;
  private intervals: NodeJS.Timeout[] = [];
  private config: SimulationConfig = defaultConfig;
  private robotPaths: Map<string, { x: number; y: number }[]> = new Map();

  start(config?: Partial<SimulationConfig>): void {
    if (this.running) return;
    
    this.config = { ...defaultConfig, ...config };
    this.running = true;
    this.initializeRobotPaths();
    this.startTelemetryLoop();
    this.startAlertLoop();
    this.startTaskLoop();
    
    console.log('🤖 Simulation started');
  }

  stop(): void {
    this.running = false;
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    console.log('🛑 Simulation stopped');
  }

  isRunning(): boolean {
    return this.running;
  }

  setSpeed(speed: number): void {
    this.config.speed = speed;
    if (this.running) {
      this.stop();
      this.start(this.config);
    }
  }

  private initializeRobotPaths(): void {
    robots.forEach(robot => {
      if (robot.status === 'en_route') {
        // Generate a random path for moving robots
        const path = this.generatePath(robot.pose, 10);
        this.robotPaths.set(robot.id, path);
      }
    });
  }

  private generatePath(start: { x: number; y: number }, points: number): { x: number; y: number }[] {
    const path: { x: number; y: number }[] = [{ x: start.x, y: start.y }];
    let current = { x: start.x, y: start.y };
    
    for (let i = 0; i < points; i++) {
      const next = {
        x: Math.max(20, Math.min(280, current.x + (Math.random() - 0.5) * 40)),
        y: Math.max(20, Math.min(200, current.y + (Math.random() - 0.5) * 40)),
      };
      path.push(next);
      current = next;
    }
    
    return path;
  }

  private startTelemetryLoop(): void {
    const interval = setInterval(() => {
      robots.forEach(robot => {
        const telemetry = this.generateTelemetry(robot);
        eventBus.emit('telemetry', telemetry);
        
        // Update robot state
        this.updateRobotState(robot, telemetry);
      });
    }, this.config.telemetryInterval / this.config.speed);
    
    this.intervals.push(interval);
  }

  private generateTelemetry(robot: Robot): TelemetryEvent {
    let newPose = { ...robot.pose };
    let newSpeed = robot.speed || 0;
    
    if (robot.status === 'en_route') {
      const path = this.robotPaths.get(robot.id);
      if (path && path.length > 1) {
        const target = path[1];
        const dx = target.x - robot.pose.x;
        const dy = target.y - robot.pose.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 5) {
          path.shift();
          if (path.length <= 1) {
            // Generate new path
            this.robotPaths.set(robot.id, this.generatePath(robot.pose, 10));
          }
        } else {
          const step = 3 * this.config.speed;
          newPose = {
            x: robot.pose.x + (dx / dist) * step,
            y: robot.pose.y + (dy / dist) * step,
            theta: Math.atan2(dy, dx),
          };
          newSpeed = 0.8 + Math.random() * 0.4;
        }
      }
    }
    
    // Battery drain simulation
    let batteryDrain = 0;
    if (robot.status === 'en_route') batteryDrain = 0.02;
    else if (robot.status === 'charging') batteryDrain = -0.5;
    
    return {
      robot_id: robot.id,
      timestamp: new Date().toISOString(),
      pose: newPose,
      battery_pct: Math.max(0, Math.min(100, robot.battery - batteryDrain)),
      state: robot.status,
      current_task_id: robot.current_task_id,
      localization_confidence: robot.localization_confidence + (Math.random() - 0.5) * 0.02,
      speed: newSpeed,
    };
  }

  private updateRobotState(robot: Robot, telemetry: TelemetryEvent): void {
    const index = robots.findIndex(r => r.id === robot.id);
    if (index === -1) return;
    
    robots[index] = {
      ...robot,
      pose: telemetry.pose,
      battery: telemetry.battery_pct,
      localization_confidence: Math.max(0.7, Math.min(1, telemetry.localization_confidence)),
      speed: telemetry.speed,
      last_seen: telemetry.timestamp,
    };
    
    // Auto-return to charging if battery low
    if (robot.battery < 20 && robot.status !== 'charging') {
      robots[index].status = 'charging';
      eventBus.emit('alert', {
        id: `alert_${Date.now()}`,
        robot_id: robot.id,
        severity: 'info',
        message: `${robot.name} returning to charging station (battery: ${Math.round(robot.battery)}%)`,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Full charge detection
    if (robot.status === 'charging' && robot.battery >= 95) {
      robots[index].status = 'idle';
      robots[index].battery = 100;
    }
  }

  private startAlertLoop(): void {
    const interval = setInterval(() => {
      if (Math.random() < this.config.alertProbability) {
        const randomRobot = robots[Math.floor(Math.random() * robots.length)];
        const alertTypes = [
          { severity: 'info' as const, message: 'Routine diagnostic check completed' },
          { severity: 'warning' as const, message: 'Minor obstacle detected, rerouting' },
          { severity: 'warning' as const, message: 'Localization confidence dropped below 90%' },
        ];
        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        
        const alert = {
          id: `alert_${Date.now()}`,
          robot_id: randomRobot.id,
          severity: alertType.severity,
          message: `${randomRobot.name}: ${alertType.message}`,
          timestamp: new Date().toISOString(),
        };
        
        alerts.unshift({
          ...alert,
          acknowledged: false,
        });
        
        eventBus.emit('alert', alert);
      }
    }, 5000 / this.config.speed);
    
    this.intervals.push(interval);
  }

  private startTaskLoop(): void {
    const interval = setInterval(() => {
      // Progress in-progress tasks
      tasks.forEach((task, index) => {
        if (task.status === 'in_progress' && task.eta_minutes) {
          const newEta = task.eta_minutes - (1 / 60) * this.config.speed;
          
          if (newEta <= 0) {
            tasks[index] = {
              ...task,
              status: 'completed',
              completed_at: new Date().toISOString(),
              eta_minutes: undefined,
            };
            
            eventBus.emit('task_update', {
              task_id: task.id,
              status: 'completed',
              message: `Delivery completed: ${task.from_zone} → ${task.to_zone}`,
            });
            
            // Free up the robot
            if (task.assigned_robot) {
              const robotIndex = robots.findIndex(r => r.id === task.assigned_robot);
              if (robotIndex !== -1) {
                robots[robotIndex].status = 'idle';
                robots[robotIndex].current_task_id = undefined;
              }
            }
          } else {
            tasks[index].eta_minutes = newEta;
          }
        }
        
        // Auto-assign queued tasks
        if (task.status === 'queued') {
          const availableRobot = robots.find(r => r.status === 'idle' && r.battery > 30);
          if (availableRobot) {
            tasks[index] = {
              ...task,
              status: 'in_progress',
              assigned_robot: availableRobot.id,
              eta_minutes: Math.floor(Math.random() * 8) + 5,
            };
            
            const robotIndex = robots.findIndex(r => r.id === availableRobot.id);
            robots[robotIndex].status = 'en_route';
            robots[robotIndex].current_task_id = task.id;
            
            eventBus.emit('task_update', {
              task_id: task.id,
              status: 'assigned',
              message: `Task assigned to ${availableRobot.name}`,
            });
          }
        }
      });
    }, 1000 / this.config.speed);
    
    this.intervals.push(interval);
  }

  // Inject a fault for testing
  injectFault(robotId: string, faultType: 'wheel_slip' | 'localization_loss' | 'battery_critical'): void {
    const index = robots.findIndex(r => r.id === robotId);
    if (index === -1) return;
    
    robots[index].status = 'error';
    
    const faultMessages = {
      wheel_slip: 'Wheel slip detected - emergency stop activated',
      localization_loss: 'Localization lost - manual intervention required',
      battery_critical: 'Critical battery level - immediate return to base',
    };
    
    const alert = {
      id: `alert_${Date.now()}`,
      robot_id: robotId,
      severity: 'critical' as const,
      message: `${robots[index].name}: ${faultMessages[faultType]}`,
      timestamp: new Date().toISOString(),
    };
    
    alerts.unshift({ ...alert, acknowledged: false });
    eventBus.emit('alert', alert);
  }

  // Attempt recovery
  attemptRecovery(robotId: string): Promise<boolean> {
    return new Promise(resolve => {
      setTimeout(() => {
        const success = Math.random() > 0.3;
        const index = robots.findIndex(r => r.id === robotId);
        
        if (index !== -1 && success) {
          robots[index].status = 'idle';
          eventBus.emit('alert', {
            id: `alert_${Date.now()}`,
            robot_id: robotId,
            severity: 'info',
            message: `${robots[index].name}: Recovery successful, resuming operations`,
            timestamp: new Date().toISOString(),
          });
        }
        
        resolve(success);
      }, 3000);
    });
  }
}

export const simulation = new SimulationService();
