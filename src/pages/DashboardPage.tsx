import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Package, 
  Bot, 
  AlertTriangle, 
  Clock,
  ArrowRight,
  TrendingUp,
  Battery,
  Zap,
  Play,
  Pause,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { robots, tasks, alerts } from '@/services/mockData';
import { simulation } from '@/services/simulation';
import { eventBus, TelemetryEvent } from '@/services/eventBus';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { simulationRunning, setSimulationRunning } = useAppStore();
  const [robotStates, setRobotStates] = useState(robots);
  const [currentTasks, setCurrentTasks] = useState(tasks);

  useEffect(() => {
    // Subscribe to telemetry updates
    const unsubscribe = eventBus.on('telemetry', (telemetry: TelemetryEvent) => {
      setRobotStates(prev => 
        prev.map(r => 
          r.id === telemetry.robot_id 
            ? { ...r, pose: telemetry.pose, battery: telemetry.battery_pct, status: telemetry.state as typeof r.status }
            : r
        )
      );
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (simulationRunning) {
      simulation.start();
    } else {
      simulation.stop();
    }
    
    return () => simulation.stop();
  }, [simulationRunning]);

  // Calculate stats
  const activeRobots = robotStates.filter(r => r.status === 'en_route').length;
  const idleRobots = robotStates.filter(r => r.status === 'idle').length;
  const chargingRobots = robotStates.filter(r => r.status === 'charging').length;
  const errorRobots = robotStates.filter(r => r.status === 'error').length;
  
  const todayTasks = currentTasks.filter(t => {
    const taskDate = new Date(t.created_at).toDateString();
    const today = new Date().toDateString();
    return taskDate === today;
  });
  const completedTasks = todayTasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = todayTasks.filter(t => t.status === 'in_progress').length;
  
  const avgEta = currentTasks
    .filter(t => t.eta_minutes)
    .reduce((sum, t) => sum + (t.eta_minutes || 0), 0) / 
    Math.max(1, currentTasks.filter(t => t.eta_minutes).length);

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
  const criticalAlerts = unacknowledgedAlerts.filter(a => a.severity === 'critical');

  const kpiCards = [
    {
      title: 'Active Deliveries',
      value: inProgressTasks,
      change: '+12%',
      trend: 'up',
      icon: Package,
      color: 'text-primary',
    },
    {
      title: 'Avg. Delivery Time',
      value: `${Math.round(avgEta)} min`,
      change: '-3%',
      trend: 'down',
      icon: Clock,
      color: 'text-accent',
    },
    {
      title: 'Active Robots',
      value: `${activeRobots}/${robotStates.length}`,
      change: 'Online',
      trend: 'neutral',
      icon: Bot,
      color: 'text-status-active',
    },
    {
      title: 'Open Alerts',
      value: unacknowledgedAlerts.length,
      change: criticalAlerts.length > 0 ? `${criticalAlerts.length} critical` : 'None critical',
      trend: criticalAlerts.length > 0 ? 'warning' : 'neutral',
      icon: AlertTriangle,
      color: criticalAlerts.length > 0 ? 'text-destructive' : 'text-warning',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header Actions */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Overview</h2>
          <p className="text-muted-foreground">Real-time fleet status and delivery metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={simulationRunning ? 'destructive' : 'hero'}
            onClick={() => setSimulationRunning(!simulationRunning)}
          >
            {simulationRunning ? (
              <>
                <Pause className="h-4 w-4" />
                Stop Simulation
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start Simulation
              </>
            )}
          </Button>
          <Link to="/tasks/new">
            <Button variant="default">
              New Delivery
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} variant="kpi" className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <h3 className="text-3xl font-bold text-foreground mt-2">{kpi.value}</h3>
                  <p className={cn(
                    'text-xs mt-1 flex items-center gap-1',
                    kpi.trend === 'up' && 'text-success',
                    kpi.trend === 'down' && 'text-success',
                    kpi.trend === 'warning' && 'text-destructive',
                    kpi.trend === 'neutral' && 'text-muted-foreground'
                  )}>
                    {kpi.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                    {kpi.change}
                  </p>
                </div>
                <div className={cn('p-3 rounded-xl bg-muted', kpi.color)}>
                  <kpi.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mini Map */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-[400px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Live Fleet View</CardTitle>
              <Link to="/map">
                <Button variant="ghost" size="sm">
                  Full Map
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="h-[calc(100%-60px)]">
              <div className="relative w-full h-full rounded-xl bg-muted/50 border border-border overflow-hidden">
                {/* Grid background */}
                <svg className="absolute inset-0 w-full h-full opacity-20">
                  <defs>
                    <pattern id="dashGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#dashGrid)" />
                </svg>

                {/* Floor label */}
                <div className="absolute top-4 left-4 z-10">
                  <Badge variant="secondary">Floor 2 - Ward Level</Badge>
                </div>

                {/* Robot markers */}
                {robotStates.map((robot) => (
                  <motion.div
                    key={robot.id}
                    className="absolute"
                    initial={false}
                    animate={{
                      left: `${(robot.pose.x / 300) * 100}%`,
                      top: `${(robot.pose.y / 220) * 100}%`,
                    }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  >
                    <div className="relative group cursor-pointer">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110',
                        robot.status === 'en_route' && 'bg-status-active',
                        robot.status === 'idle' && 'bg-status-idle',
                        robot.status === 'charging' && 'bg-status-charging',
                        robot.status === 'error' && 'bg-status-error animate-pulse',
                        robot.status === 'offline' && 'bg-status-offline',
                      )}>
                        <Bot className="h-4 w-4 text-background" />
                      </div>
                      {robot.status === 'en_route' && (
                        <div className="absolute inset-0 rounded-full bg-status-active animate-ping opacity-30" />
                      )}
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                        <div className="bg-popover text-popover-foreground text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap border border-border">
                          <p className="font-semibold">{robot.name}</p>
                          <p className="text-muted-foreground capitalize">{robot.status.replace('_', ' ')}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Battery className="h-3 w-3" />
                            <span>{Math.round(robot.battery)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fleet Status */}
        <motion.div variants={itemVariants}>
          <Card className="h-[400px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Fleet Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-status-active/10">
                  <Zap className="h-4 w-4 text-status-active" />
                  <div>
                    <p className="text-lg font-bold text-foreground">{activeRobots}</p>
                    <p className="text-xs text-muted-foreground">En Route</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-status-idle/10">
                  <Activity className="h-4 w-4 text-status-idle" />
                  <div>
                    <p className="text-lg font-bold text-foreground">{idleRobots}</p>
                    <p className="text-xs text-muted-foreground">Idle</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-status-charging/10">
                  <Battery className="h-4 w-4 text-status-charging" />
                  <div>
                    <p className="text-lg font-bold text-foreground">{chargingRobots}</p>
                    <p className="text-xs text-muted-foreground">Charging</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-status-error/10">
                  <AlertTriangle className="h-4 w-4 text-status-error" />
                  <div>
                    <p className="text-lg font-bold text-foreground">{errorRobots}</p>
                    <p className="text-xs text-muted-foreground">Error</p>
                  </div>
                </div>
              </div>

              {/* Robot List */}
              <div className="space-y-2 max-h-[180px] overflow-y-auto">
                {robotStates.map((robot) => (
                  <Link key={robot.id} to={`/fleet/${robot.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-2 h-2 rounded-full',
                          robot.status === 'en_route' && 'bg-status-active',
                          robot.status === 'idle' && 'bg-status-idle',
                          robot.status === 'charging' && 'bg-status-charging',
                          robot.status === 'error' && 'bg-status-error animate-pulse',
                        )} />
                        <span className="font-medium text-sm">{robot.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {Math.round(robot.battery)}%
                        </span>
                        <Badge variant={robot.status as 'idle' | 'active' | 'charging' | 'error'} className="text-[10px] px-1.5">
                          {robot.status === 'en_route' ? 'Active' : robot.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Recent Tasks</CardTitle>
              <Link to="/tasks">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {task.from_zone} → {task.to_zone}
                        </p>
                        <p className="text-xs text-muted-foreground">{task.payload}</p>
                      </div>
                    </div>
                    <Badge variant={task.priority as 'low' | 'normal' | 'high' | 'critical'}>
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Alerts */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Recent Alerts</CardTitle>
              <Link to="/alerts">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={cn(
                        'h-4 w-4',
                        alert.severity === 'critical' && 'text-destructive',
                        alert.severity === 'warning' && 'text-warning',
                        alert.severity === 'info' && 'text-info',
                      )} />
                      <div>
                        <p className="text-sm font-medium line-clamp-1">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      alert.severity === 'critical' ? 'destructive' :
                      alert.severity === 'warning' ? 'warning' : 'info'
                    }>
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
