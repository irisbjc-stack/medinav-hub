import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Bot,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { tasks, robots, floorMaps, Task } from '@/services/mockData';
import { createTask } from '@/services/api';
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

const statusIcons = {
  queued: Clock,
  assigned: Bot,
  in_progress: Package,
  completed: CheckCircle,
  cancelled: XCircle,
  failed: AlertCircle,
};

const zones = floorMaps.flatMap(m => m.zones.map(z => z.name));

export default function TaskManagerPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New task form
  const [newTask, setNewTask] = useState({
    from_zone: '',
    to_zone: '',
    priority: 'normal' as Task['priority'],
    payload: 'Medication',
    notes: '',
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.from_zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.to_zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.payload.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleCreateTask = async () => {
    if (!newTask.from_zone || !newTask.to_zone) {
      toast({
        title: 'Missing fields',
        description: 'Please select both origin and destination zones.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createTask({
        ...newTask,
        requester: 'u_clinician',
      });
      
      toast({
        title: 'Task Created',
        description: `Delivery task created: ${newTask.from_zone} → ${newTask.to_zone}`,
      });
      
      setIsCreateModalOpen(false);
      setNewTask({
        from_zone: '',
        to_zone: '',
        priority: 'normal',
        payload: 'Medication',
        notes: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create task. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: Task['status']) => {
    const colors = {
      queued: 'text-muted-foreground',
      assigned: 'text-info',
      in_progress: 'text-primary',
      completed: 'text-success',
      cancelled: 'text-muted-foreground',
      failed: 'text-destructive',
    };
    return colors[status];
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
          <h2 className="text-2xl font-bold text-foreground">Task Manager</h2>
          <p className="text-muted-foreground">Create and manage delivery tasks</p>
        </div>
        <Button variant="hero" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4" />
          New Delivery
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Task Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Queued', count: tasks.filter(t => t.status === 'queued').length, color: 'text-muted-foreground' },
          { label: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length, color: 'text-primary' },
          { label: 'Completed', count: tasks.filter(t => t.status === 'completed').length, color: 'text-success' },
          { label: 'Failed', count: tasks.filter(t => t.status === 'failed').length, color: 'text-destructive' },
        ].map(stat => (
          <Card key={stat.label} variant="kpi">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={cn('text-2xl font-bold', stat.color)}>{stat.count}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Task List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || priorityFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : "Create your first delivery task to get started"}
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Create Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map(task => {
            const StatusIcon = statusIcons[task.status];
            const assignedRobot = robots.find(r => r.id === task.assigned_robot);
            
            return (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={cn('p-2 rounded-lg bg-muted', getStatusColor(task.status))}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{task.from_zone}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{task.to_zone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant={task.priority}>{task.priority}</Badge>
                          <span>•</span>
                          <span>{task.payload}</span>
                          {assignedRobot && (
                            <>
                              <span>•</span>
                              <span className="text-primary">{assignedRobot.name}</span>
                            </>
                          )}
                        </div>
                        {task.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{task.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {task.eta_minutes && task.status === 'in_progress' && (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          ETA: {Math.round(task.eta_minutes)} min
                        </Badge>
                      )}
                      <Badge variant={
                        task.status === 'completed' ? 'success' :
                        task.status === 'in_progress' ? 'active' :
                        task.status === 'failed' ? 'error' : 'secondary'
                      }>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </motion.div>

      {/* Create Task Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Delivery</DialogTitle>
            <DialogDescription>
              Schedule a new delivery task. An available robot will be automatically assigned.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="from_zone">From Zone</Label>
              <Select value={newTask.from_zone} onValueChange={(v) => setNewTask(prev => ({ ...prev, from_zone: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select origin" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map(zone => (
                    <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="to_zone">To Zone</Label>
              <Select value={newTask.to_zone} onValueChange={(v) => setNewTask(prev => ({ ...prev, to_zone: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map(zone => (
                    <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={newTask.priority} onValueChange={(v) => setNewTask(prev => ({ ...prev, priority: v as Task['priority'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Payload Type</Label>
              <Select value={newTask.payload} onValueChange={(v) => setNewTask(prev => ({ ...prev, payload: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medication">Medication</SelectItem>
                  <SelectItem value="Sample">Lab Sample</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Documents">Documents</SelectItem>
                  <SelectItem value="Supplies">Supplies</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                placeholder="Add any special instructions..."
                value={newTask.notes}
                onChange={(e) => setNewTask(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={handleCreateTask} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
