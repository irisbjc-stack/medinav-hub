import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Bot,
  Filter,
  Bell,
  BellOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { alerts, robots, Alert } from '@/services/mockData';
import { acknowledgeAlert, resolveAlert } from '@/services/api';
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

export default function AlertsPage() {
  const { toast } = useToast();
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [localAlerts, setLocalAlerts] = useState(alerts);

  const filteredAlerts = localAlerts.filter(alert => {
    return severityFilter === 'all' || alert.severity === severityFilter;
  });

  const unacknowledgedCount = localAlerts.filter(a => !a.acknowledged).length;
  const criticalCount = localAlerts.filter(a => a.severity === 'critical' && !a.resolved).length;

  const handleAcknowledge = async (alertId: string) => {
    await acknowledgeAlert(alertId);
    setLocalAlerts(prev => 
      prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a)
    );
    toast({
      title: 'Alert Acknowledged',
      description: 'The alert has been marked as acknowledged.',
    });
  };

  const handleResolve = async (alertId: string) => {
    await resolveAlert(alertId);
    setLocalAlerts(prev => 
      prev.map(a => a.id === alertId ? { ...a, acknowledged: true, resolved: true } : a)
    );
    toast({
      title: 'Alert Resolved',
      description: 'The alert has been resolved and closed.',
    });
  };

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'info':
        return <Bell className="h-5 w-5 text-info" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
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
          <h2 className="text-2xl font-bold text-foreground">Alerts & Faults</h2>
          <p className="text-muted-foreground">Monitor and respond to system alerts</p>
        </div>
        <div className="flex items-center gap-2">
          {unacknowledgedCount > 0 && (
            <Badge variant="warning" className="gap-1">
              <Bell className="h-3 w-3" />
              {unacknowledgedCount} unread
            </Badge>
          )}
          {criticalCount > 0 && (
            <Badge variant="critical" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {criticalCount} critical
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Filter */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alert List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No alerts</h3>
              <p className="text-muted-foreground">All systems operating normally</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map(alert => {
            const robot = robots.find(r => r.id === alert.robot_id);
            
            return (
              <Card 
                key={alert.id} 
                className={cn(
                  'transition-all',
                  !alert.acknowledged && 'border-l-4',
                  !alert.acknowledged && alert.severity === 'critical' && 'border-l-destructive bg-destructive/5',
                  !alert.acknowledged && alert.severity === 'warning' && 'border-l-warning bg-warning/5',
                  !alert.acknowledged && alert.severity === 'info' && 'border-l-info bg-info/5',
                  alert.resolved && 'opacity-60'
                )}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'p-2 rounded-lg',
                        alert.severity === 'critical' && 'bg-destructive/10',
                        alert.severity === 'warning' && 'bg-warning/10',
                        alert.severity === 'info' && 'bg-info/10',
                      )}>
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          {robot && (
                            <span className="flex items-center gap-1">
                              <Bot className="h-3 w-3" />
                              {robot.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(alert.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        alert.severity === 'critical' ? 'destructive' :
                        alert.severity === 'warning' ? 'warning' : 'info'
                      }>
                        {alert.severity}
                      </Badge>
                      
                      {alert.resolved ? (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Resolved
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-2">
                          {!alert.acknowledged && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAcknowledge(alert.id)}
                            >
                              Acknowledge
                            </Button>
                          )}
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleResolve(alert.id)}
                          >
                            Resolve
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
}
