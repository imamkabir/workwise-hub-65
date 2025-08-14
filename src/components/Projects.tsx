import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Calendar, Users, Clock } from "lucide-react";

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  progress: number;
  team: string[];
  deadline: string;
  priority: 'low' | 'medium' | 'high';
}

const projectsData: Project[] = [
  {
    id: 1,
    name: "Mobile App Development",
    description: "Building a cross-platform mobile application for employee attendance tracking",
    status: 'active',
    progress: 75,
    team: ['John Doe', 'Sarah Wilson', 'Mike Johnson'],
    deadline: '2024-03-15',
    priority: 'high'
  },
  {
    id: 2,
    name: "Dashboard Redesign",
    description: "Modernizing the admin dashboard with new UI/UX improvements",
    status: 'active',
    progress: 45,
    team: ['Emily Davis', 'Alex Chen'],
    deadline: '2024-02-28',
    priority: 'medium'
  },
  {
    id: 3,
    name: "API Integration",
    description: "Integrating with third-party HR systems for seamless data sync",
    status: 'completed',
    progress: 100,
    team: ['David Brown', 'Lisa Garcia'],
    deadline: '2024-01-20',
    priority: 'high'
  },
  {
    id: 4,
    name: "Security Audit",
    description: "Comprehensive security review and implementation of best practices",
    status: 'on-hold',
    progress: 25,
    team: ['Robert Taylor'],
    deadline: '2024-04-10',
    priority: 'low'
  },
];

export const Projects = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'on-hold'>('all');

  const filteredProjects = filter === 'all' 
    ? projectsData 
    : projectsData.filter(project => project.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'on-hold': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Projects</h2>
          <p className="text-muted-foreground">Manage and track your team projects</p>
        </div>
        <Button className="gradient-primary glow">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'active', 'completed', 'on-hold'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status as any)}
            className={filter === status ? "gradient-primary" : "glass"}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
          </Button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="glass hover:scale-105 transition-transform">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <Badge className={getPriorityColor(project.priority)}>
                  {project.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status and Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                    <span className="text-sm capitalize">{project.status.replace('-', ' ')}</span>
                  </div>
                  <span className="text-sm font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {/* Team */}
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {project.team.length} member{project.team.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Deadline */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{project.deadline}</span>
              </div>

              {/* Team Members */}
              <div className="space-y-2">
                <span className="text-sm font-medium">Team:</span>
                <div className="flex flex-wrap gap-1">
                  {project.team.map((member, index) => (
                    <Badge key={index} variant="secondary" className="text-xs glass">
                      {member}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 glass">
                  View Details
                </Button>
                <Button size="sm" className="flex-1 gradient-primary">
                  <Clock className="w-3 h-3 mr-1" />
                  Log Time
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {projectsData.filter(p => p.status === 'active').length}
            </div>
            <div className="text-sm text-muted-foreground">Active Projects</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {projectsData.filter(p => p.status === 'completed').length}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {projectsData.filter(p => p.status === 'on-hold').length}
            </div>
            <div className="text-sm text-muted-foreground">On Hold</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.round(projectsData.reduce((acc, p) => acc + p.progress, 0) / projectsData.length)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Progress</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};