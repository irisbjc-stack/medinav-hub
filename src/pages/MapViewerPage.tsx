import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Navigation,
  Play,
  Pause,
  RotateCcw,
  Battery,
  MapPin,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { robots, floorMaps, Zone } from '@/services/mockData';
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

export default function MapViewerPage() {
  const { selectedFloor, setSelectedFloor, simulationRunning } = useAppStore();
  const [robotStates, setRobotStates] = useState(robots);
  const [zoom, setZoom] = useState(1);
  const [showZones, setShowZones] = useState(true);
  const [showPaths, setShowPaths] = useState(true);
  const [selectedRobot, setSelectedRobot] = useState<string | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);

  const currentMap = floorMaps.find(m => m.floor === selectedFloor);

  useEffect(() => {
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

  const floorRobots = robotStates.filter(r => r.floor === selectedFloor);

  const getZoneColor = (type: Zone['type']) => {
    const colors = {
      clinical: 'fill-primary/20 stroke-primary',
      pharmacy: 'fill-success/20 stroke-success',
      corridor: 'fill-muted stroke-border',
      elevator: 'fill-warning/20 stroke-warning',
      storage: 'fill-secondary stroke-secondary-foreground/30',
      restricted: 'fill-destructive/20 stroke-destructive',
    };
    return colors[type] || 'fill-muted stroke-border';
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
          <h2 className="text-2xl font-bold text-foreground">Map Viewer</h2>
          <p className="text-muted-foreground">Real-time robot positions and facility layout</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Floor Selector */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {floorMaps.map(map => (
              <Button
                key={map.floor}
                variant={selectedFloor === map.floor ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedFloor(map.floor)}
              >
                F{map.floor}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Map */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card className="overflow-hidden">
            {/* Map Controls */}
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{currentMap?.name || 'Unknown Floor'}</Badge>
                {simulationRunning && (
                  <Badge variant="active" className="animate-pulse">
                    <Activity className="h-3 w-3" />
                    Live
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={showZones ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowZones(!showZones)}
                >
                  <Layers className="h-4 w-4" />
                  Zones
                </Button>
                <Button
                  variant={showPaths ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowPaths(!showPaths)}
                >
                  <Navigation className="h-4 w-4" />
                  Paths
                </Button>
                <div className="flex items-center gap-1 ml-2">
                  <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
                  <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(2, z + 0.25))}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0 h-[500px] relative overflow-hidden bg-muted/30">
              {/* Map SVG */}
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
              >
                <svg viewBox="0 0 320 240" className="w-full h-full max-w-[640px]">
                  {/* Grid */}
                  <defs>
                    <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-border" />
                    </pattern>
                  </defs>
                  <rect width="320" height="240" fill="url(#mapGrid)" />

                  {/* Zones */}
                  {showZones && currentMap?.zones.map(zone => (
                    <g key={zone.id}>
                      <polygon
                        points={zone.polygon.map(p => p.join(',')).join(' ')}
                        className={cn(getZoneColor(zone.type), 'transition-all hover:opacity-80 cursor-pointer')}
                        strokeWidth="1.5"
                      />
                      <text
                        x={zone.polygon.reduce((sum, p) => sum + p[0], 0) / zone.polygon.length}
                        y={zone.polygon.reduce((sum, p) => sum + p[1], 0) / zone.polygon.length}
                        className="fill-foreground text-[8px] font-medium"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {zone.name}
                      </text>
                    </g>
                  ))}

                  {/* Robot Paths (simulated) */}
                  {showPaths && floorRobots.filter(r => r.status === 'en_route').map(robot => (
                    <g key={`path-${robot.id}`}>
                      <path
                        d={`M ${robot.pose.x} ${robot.pose.y} Q ${robot.pose.x + 30} ${robot.pose.y - 20} ${robot.pose.x + 60} ${robot.pose.y + 10}`}
                        className="stroke-primary fill-none"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        opacity="0.5"
                      />
                    </g>
                  ))}

                  {/* Robot Markers */}
                  {floorRobots.map(robot => (
                    <g
                      key={robot.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedRobot(selectedRobot === robot.id ? null : robot.id)}
                    >
                      <motion.circle
                        cx={robot.pose.x}
                        cy={robot.pose.y}
                        r="8"
                        className={cn(
                          robot.status === 'en_route' && 'fill-status-active',
                          robot.status === 'idle' && 'fill-status-idle',
                          robot.status === 'charging' && 'fill-status-charging',
                          robot.status === 'error' && 'fill-status-error',
                          robot.status === 'offline' && 'fill-status-offline',
                        )}
                        initial={false}
                        animate={{
                          cx: robot.pose.x,
                          cy: robot.pose.y,
                        }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                      />
                      {robot.status === 'en_route' && (
                        <motion.circle
                          cx={robot.pose.x}
                          cy={robot.pose.y}
                          r="12"
                          className="fill-none stroke-status-active"
                          strokeWidth="1"
                          initial={false}
                          animate={{
                            cx: robot.pose.x,
                            cy: robot.pose.y,
                            r: [12, 18, 12],
                            opacity: [1, 0, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                      <text
                        x={robot.pose.x}
                        y={robot.pose.y + 1}
                        className="fill-background text-[6px] font-bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {robot.name.slice(-2)}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-border">
                <p className="text-xs font-medium mb-2">Legend</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-status-active" />
                    <span>En Route</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-status-idle" />
                    <span>Idle</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-status-charging" />
                    <span>Charging</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-status-error" />
                    <span>Error</span>
                  </div>
                </div>
              </div>

              {/* Replay Controls */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReplaying(!isReplaying)}
                >
                  {isReplaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  Replay
                </Button>
                <Button variant="outline" size="icon">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Robot List */}
        <motion.div variants={itemVariants}>
          <Card className="h-[584px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Floor {selectedFloor} Robots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 overflow-y-auto max-h-[500px]">
              {floorRobots.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No robots on this floor
                </p>
              ) : (
                floorRobots.map(robot => (
                  <motion.div
                    key={robot.id}
                    className={cn(
                      'p-4 rounded-lg border transition-all cursor-pointer',
                      selectedRobot === robot.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-muted/50 hover:bg-muted'
                    )}
                    onClick={() => setSelectedRobot(selectedRobot === robot.id ? null : robot.id)}
                    layout
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{robot.name}</span>
                      <Badge variant={robot.status === 'en_route' ? 'active' : robot.status as 'idle' | 'charging' | 'error'}>
                        {robot.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {/* Battery */}
                    <div className="flex items-center gap-2 mb-2">
                      <Battery className={cn(
                        'h-4 w-4',
                        robot.battery > 50 ? 'text-success' :
                        robot.battery > 20 ? 'text-warning' : 'text-destructive'
                      )} />
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all',
                            robot.battery > 50 ? 'bg-success' :
                            robot.battery > 20 ? 'bg-warning' : 'bg-destructive'
                          )}
                          style={{ width: `${robot.battery}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{Math.round(robot.battery)}%</span>
                    </div>

                    {/* Position */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>({Math.round(robot.pose.x)}, {Math.round(robot.pose.y)})</span>
                    </div>

                    {/* Expanded info */}
                    {selectedRobot === robot.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-3 border-t border-border space-y-2"
                      >
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Confidence</span>
                          <span>{(robot.localization_confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Speed</span>
                          <span>{robot.speed?.toFixed(2) || 0} m/s</span>
                        </div>
                        {robot.current_task_id && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Task</span>
                            <span className="text-primary">{robot.current_task_id}</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
