import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Battery, 
  Activity,
  MapPin,
  Zap,
  Wrench,
  Eye,
  RotateCcw,
  Pause,
  Play,
  Home,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { robots, tasks, Robot } from '@/services/mockData';
import { simulation } from '@/services/simulation';
import { useToast } from '@/hooks/use-toast';
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

export default function FleetPage() {
  const { toast } = useToast();
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  const statusCounts = {
    total: robots.length,
    active: robots.filter(r => r.status === 'en_route').length,
    idle: robots.filter(r => r.status === 'idle').length,
    charging: robots.filter(r => r.status === 'charging').length,
    error: robots.filter(r => r.status === 'error').length,
  };

  const handleInjectFault = (robotId: string) => {
    simulation.injectFault(robotId, 'wheel_slip');
    toast({
      title: 'Fault Injected',
      description: 'Wheel slip fault injected for testing.',
      variant: 'destructive',
    });
  };

  const handleAttemptRecovery = async (robotId: string) => {
    setIsRecovering(true);
    const success = await simulation.attemptRecovery(robotId);
    setIsRecovering(false);
    
    toast({
      title: success ? 'Recovery Successful' : 'Recovery Failed',
      description: success 
        ? 'Robot has resumed normal operations.'
        : 'Manual intervention may be required.',
      variant: success ? 'default' : 'destructive',
    });
  };

  const getRobotTask = (robotId: string) => {
    return tasks.find(t => t.assigned_robot === robotId && t.status === 'in_progress');
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Robot Fleet</h2>
          <p className="text-muted-foreground">Monitor and manage all robots</p>
        </div>
      </motion.div>

      {/* Fleet Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card variant="kpi">
          <CardContent className="p-4 text-center">
            <Bot className="h-6 w-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{statusCounts.total}</p>
            <p className="text-xs text-muted-foreground">Total Fleet</p>
          </CardContent>
        </Card>
        <Card variant="kpi">
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 mx-auto text-status-active mb-2" />
            <p className="text-2xl font-bold text-status-active">{statusCounts.active}</p>
            <p className="text-xs text-muted-foreground">En Route</p>
          </CardContent>
        </Card>
        <Card variant="kpi">
          <CardContent className="p-4 text-center">
            <Activity className="h-6 w-6 mx-auto text-status-idle mb-2" />
            <p className="text-2xl font-bold text-status-idle">{statusCounts.idle}</p>
            <p className="text-xs text-muted-foreground">Idle</p>
          </CardContent>
        </Card>
        <Card variant="kpi">
          <CardContent className="p-4 text-center">
            <Battery className="h-6 w-6 mx-auto text-status-charging mb-2" />
            <p className="text-2xl font-bold text-status-charging">{statusCounts.charging}</p>
            <p className="text-xs text-muted-foreground">Charging</p>
          </CardContent>
        </Card>
        <Card variant="kpi">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto text-status-error mb-2" />
            <p className="text-2xl font-bold text-status-error">{statusCounts.error}</p>
            <p className="text-xs text-muted-foreground">Error</p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Robot List */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="grid gap-4">
            {robots.map(robot => {
              const currentTask = getRobotTask(robot.id);
              
              return (
                <Card 
                  key={robot.id} 
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    selectedRobot?.id === robot.id && 'ring-2 ring-primary'
                  )}
                  onClick={() => setSelectedRobot(robot)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          robot.status === 'en_route' && 'bg-status-active/20',
                          robot.status === 'idle' && 'bg-status-idle/20',
                          robot.status === 'charging' && 'bg-status-charging/20',
                          robot.status === 'error' && 'bg-status-error/20 animate-pulse',
                          robot.status === 'offline' && 'bg-status-offline/20',
                        )}>
                          <Bot className={cn(
                            'h-6 w-6',
                            robot.status === 'en_route' && 'text-status-active',
                            robot.status === 'idle' && 'text-status-idle',
                            robot.status === 'charging' && 'text-status-charging',
                            robot.status === 'error' && 'text-status-error',
                            robot.status === 'offline' && 'text-status-offline',
                          )} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{robot.name}</h3>
                            <Badge variant={robot.status === 'en_route' ? 'active' : robot.status as 'idle' | 'charging' | 'error'}>
                              {robot.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Floor {robot.floor}
                            </span>
                            <span className="flex items-center gap-1">
                              <Battery className={cn(
                                'h-3 w-3',
                                robot.battery > 50 ? 'text-success' :
                                robot.battery > 20 ? 'text-warning' : 'text-destructive'
                              )} />
                              {Math.round(robot.battery)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {currentTask && (
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-medium">{currentTask.from_zone} → {currentTask.to_zone}</p>
                          <p className="text-xs text-muted-foreground">
                            ETA: {currentTask.eta_minutes?.toFixed(0)} min
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Battery bar */}
                    <div className="mt-4">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all',
                            robot.battery > 50 ? 'bg-success' :
                            robot.battery > 20 ? 'bg-warning' : 'bg-destructive'
                          )}
                          style={{ width: `${robot.battery}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Robot Detail Panel */}
        <motion.div variants={itemVariants}>
          <Card className="sticky top-24">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Robot Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRobot ? (
                <div className="space-y-6">
                  {/* Robot Info */}
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-16 h-16 rounded-xl flex items-center justify-center',
                      selectedRobot.status === 'en_route' && 'bg-status-active/20',
                      selectedRobot.status === 'idle' && 'bg-status-idle/20',
                      selectedRobot.status === 'charging' && 'bg-status-charging/20',
                      selectedRobot.status === 'error' && 'bg-status-error/20',
                    )}>
                      <Bot className={cn(
                        'h-8 w-8',
                        selectedRobot.status === 'en_route' && 'text-status-active',
                        selectedRobot.status === 'idle' && 'text-status-idle',
                        selectedRobot.status === 'charging' && 'text-status-charging',
                        selectedRobot.status === 'error' && 'text-status-error',
                      )} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{selectedRobot.name}</h3>
                      <Badge variant={selectedRobot.status === 'en_route' ? 'active' : selectedRobot.status as 'idle' | 'charging' | 'error'}>
                        {selectedRobot.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {/* Telemetry */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Telemetry</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Battery</p>
                        <p className="text-lg font-semibold">{Math.round(selectedRobot.battery)}%</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Floor</p>
                        <p className="text-lg font-semibold">{selectedRobot.floor}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Confidence</p>
                        <p className="text-lg font-semibold">{(selectedRobot.localization_confidence * 100).toFixed(1)}%</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Speed</p>
                        <p className="text-lg font-semibold">{selectedRobot.speed?.toFixed(2) || 0} m/s</p>
                      </div>
                    </div>
                  </div>

                  {/* Position */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Position</h4>
                    <div className="p-3 rounded-lg bg-muted/50 font-mono text-sm">
                      x: {selectedRobot.pose.x.toFixed(2)}, y: {selectedRobot.pose.y.toFixed(2)}, θ: {selectedRobot.pose.theta.toFixed(2)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Controls</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedRobot.status === 'error' ? (
                        <Button 
                          variant="hero" 
                          className="col-span-2"
                          onClick={() => handleAttemptRecovery(selectedRobot.id)}
                          disabled={isRecovering}
                        >
                          <RotateCcw className={cn('h-4 w-4', isRecovering && 'animate-spin')} />
                          {isRecovering ? 'Recovering...' : 'Attempt Recovery'}
                        </Button>
                      ) : (
                        <>
                          <Button variant="outline" size="sm">
                            {selectedRobot.status === 'en_route' ? (
                              <>
                                <Pause className="h-4 w-4" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4" />
                                Resume
                              </>
                            )}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Home className="h-4 w-4" />
                            Return
                          </Button>
                          <Link to={`/map?robot=${selectedRobot.id}`} className="col-span-2">
                            <Button variant="secondary" size="sm" className="w-full">
                              <Eye className="h-4 w-4" />
                              View on Map
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Dev Tools */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Developer Tools</p>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleInjectFault(selectedRobot.id)}
                    >
                      <Wrench className="h-4 w-4" />
                      Inject Fault
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a robot to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
