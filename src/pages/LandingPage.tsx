import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  MapPin, 
  Zap, 
  Shield, 
  ArrowRight, 
  Play,
  Activity,
  Brain,
  Route,
  CheckCircle,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Route,
    title: 'SLAM Navigation',
    description: 'Real-time simultaneous localization and mapping for precise indoor navigation in complex hospital environments.',
  },
  {
    icon: Brain,
    title: 'Adaptive Intelligence',
    description: 'ML-powered decision making that learns from operational patterns and optimizes delivery routes dynamically.',
  },
  {
    icon: Activity,
    title: 'Real-time Telemetry',
    description: 'Continuous monitoring of robot status, battery levels, localization confidence, and task progress.',
  },
  {
    icon: Shield,
    title: 'Safety-First Design',
    description: 'Multi-layered obstacle detection, emergency stops, and compliance with hospital safety protocols.',
  },
];

const stats = [
  { value: '99.7%', label: 'Delivery Success Rate' },
  { value: '<8 min', label: 'Average Delivery Time' },
  { value: '24/7', label: 'Autonomous Operation' },
  { value: '5+', label: 'Robots in Fleet' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-hero overflow-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/10 border-b border-border/10"
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">MedBot</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Demo
            </a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="hero" size="sm">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto max-w-6xl relative">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <motion.div variants={itemVariants}>
              <Badge variant="secondary" className="mb-6 px-4 py-1.5">
                <Zap className="w-3 h-3 mr-1" />
                Next-Gen Healthcare Logistics
              </Badge>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
            >
              Navigating Healthcare
              <br />
              <span className="text-gradient">with Smart Robots</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              Autonomous medical logistics powered by SLAM navigation and adaptive intelligence. 
              Delivering medications, samples, and equipment with precision and safety.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/login">
                <Button variant="hero" size="xl">
                  <Play className="w-5 h-5" />
                  Try Interactive Demo
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="xl">
                  View Documentation
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Robot Visualization */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-16 relative"
          >
            <div className="relative mx-auto max-w-4xl aspect-video rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm overflow-hidden shadow-2xl">
              {/* Mock Dashboard Preview */}
              <div className="absolute inset-0 p-6">
                <div className="grid grid-cols-3 gap-4 h-full">
                  {/* Mini Map */}
                  <div className="col-span-2 rounded-xl bg-muted/50 border border-border/50 p-4 relative overflow-hidden">
                    <div className="absolute top-4 left-4 text-xs font-medium text-muted-foreground">Floor 2 - Ward Level</div>
                    
                    {/* Simulated floor grid */}
                    <svg className="w-full h-full opacity-30" viewBox="0 0 300 200">
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      {/* Zones */}
                      <rect x="20" y="20" width="100" height="60" rx="4" className="fill-primary/20 stroke-primary" strokeWidth="1" />
                      <rect x="140" y="20" width="80" height="60" rx="4" className="fill-accent/20 stroke-accent" strokeWidth="1" />
                      <rect x="20" y="100" width="80" height="80" rx="4" className="fill-destructive/20 stroke-destructive" strokeWidth="1" />
                    </svg>
                    
                    {/* Animated robot marker */}
                    <motion.div
                      className="absolute w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/50"
                      animate={{
                        x: [100, 150, 180, 150, 100],
                        y: [80, 60, 100, 140, 80],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      style={{ left: 0, top: 0 }}
                    >
                      <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-50" />
                    </motion.div>
                  </div>

                  {/* Side Stats */}
                  <div className="space-y-4">
                    <div className="rounded-xl bg-muted/50 border border-border/50 p-4">
                      <div className="text-xs text-muted-foreground mb-1">Active Robots</div>
                      <div className="text-2xl font-bold text-foreground">4/5</div>
                    </div>
                    <div className="rounded-xl bg-muted/50 border border-border/50 p-4">
                      <div className="text-xs text-muted-foreground mb-1">Tasks Today</div>
                      <div className="text-2xl font-bold text-foreground">47</div>
                    </div>
                    <div className="rounded-xl bg-primary/10 border border-primary/30 p-4">
                      <div className="text-xs text-primary mb-1">In Transit</div>
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-primary animate-robot-move" />
                        <span className="text-sm font-medium text-foreground">R-07 → Ward 5B</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating badges */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute -left-4 top-1/4 hidden lg:block"
            >
              <Badge variant="success" className="shadow-lg px-3 py-1.5">
                <CheckCircle className="w-3 h-3 mr-1" />
                Task Completed
              </Badge>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute -right-4 top-1/3 hidden lg:block"
            >
              <Badge variant="info" className="shadow-lg px-3 py-1.5">
                <MapPin className="w-3 h-3 mr-1" />
                High Precision Mode
              </Badge>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/20 bg-muted/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              Core Capabilities
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Hospital Logistics
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every feature designed with healthcare workflows in mind, ensuring safe, 
              efficient, and compliant autonomous deliveries.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="glass" className="h-full p-6 hover:shadow-glow transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="demo" className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl bg-gradient-primary p-12 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20" />
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Transform Your Hospital Logistics?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Experience our interactive demo with simulated robot operations, 
                real-time telemetry, and task management.
              </p>
              <Link to="/login">
                <Button variant="glass" size="xl" className="bg-background/20 hover:bg-background/30 text-primary-foreground border-primary-foreground/20">
                  <Play className="w-5 h-5" />
                  Launch Demo
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/20">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">MedBot</span>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Navigating Healthcare Dynamics with SLAM & Adaptive Intelligence
            </p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
