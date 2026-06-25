'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, MoreVertical, Calendar, CheckCircle, 
  Clock, Edit3, Trash2, Film, FileText, Camera,
  Palette, X, ChevronRight, Eye, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePostsStore, usePlatformStore } from '@/stores';

interface ContentProject {
  id: string;
  title: string;
  description: string | null;
  status: string;
  productionStage: string;
  thumbnailUrl: string | null;
  ideaDate: string | null;
  scriptDeadline: string | null;
  filmedDate: string | null;
  editedDate: string | null;
  reviewDate: string | null;
  seriesId: string | null;
  series?: { id: string; name: string; color: string | null };
  milestones: Milestone[];
  createdAt: string;
}

interface Milestone {
  id: string;
  title: string;
  dueDate: string | null;
  completedAt: string | null;
  notes: string | null;
}

type Stage = 'idea' | 'scripting' | 'filming' | 'editing' | 'review' | 'ready' | 'scheduled';

const STAGES: { id: Stage; label: string; icon: any; color: string; borderColor: string }[] = [
  { id: 'idea', label: 'Ideas', icon: FileText, color: 'bg-bg-secondary', borderColor: 'border-text-text-muted' },
  { id: 'scripting', label: 'Scripting', icon: FileText, color: 'bg-blue-100', borderColor: 'border-blue-300' },
  { id: 'filming', label: 'Filming', icon: Camera, color: 'bg-purple-100', borderColor: 'border-purple-300' },
  { id: 'editing', label: 'Editing', icon: Film, color: 'bg-orange-100', borderColor: 'border-orange-300' },
  { id: 'review', label: 'Review', icon: Eye, color: 'bg-yellow-100', borderColor: 'border-yellow-300' },
  { id: 'ready', label: 'Ready', icon: CheckCircle, color: 'bg-green-100', borderColor: 'border-green-300' },
  { id: 'scheduled', label: 'Scheduled', icon: Calendar, color: 'bg-bg-primary/10', borderColor: 'border-text-primary' },
];

export default function ContentPipeline() {
  const posts = usePostsStore((s) => s.posts);
  const addPost = usePostsStore((s) => s.addPost);
  const updatePost = usePostsStore((s) => s.updatePost);
  const deletePost = usePostsStore((s) => s.deletePost);
  const connections = usePlatformStore((s) => s.connections);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ContentProject | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [dbProjects, setDbProjects] = useState<any[]>([]);

  // Fetch projects from database
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pipeline');
      const data = await res.json();
      if (data.projects) {
        setDbProjects(data.projects);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Use database projects if available, otherwise fall back to posts
  const projects: ContentProject[] = dbProjects.length > 0 
    ? dbProjects.map((p) => ({
        id: p.id,
        title: p.title || 'Untitled',
        description: p.description || null,
        status: p.status || 'active',
        productionStage: p.productionStage || 'idea',
        thumbnailUrl: p.thumbnailUrl || null,
        ideaDate: p.ideaDate ? new Date(p.ideaDate).toISOString() : null,
        scriptDeadline: p.scriptDeadline ? new Date(p.scriptDeadline).toISOString() : null,
        filmedDate: p.filmedDate ? new Date(p.filmedDate).toISOString() : null,
        editedDate: p.editedDate ? new Date(p.editedDate).toISOString() : null,
        reviewDate: p.reviewDate ? new Date(p.reviewDate).toISOString() : null,
        seriesId: p.seriesId || null,
        series: p.series,
        milestones: p.milestones || [],
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      }))
    : posts.map((post) => ({
        id: post.id,
        title: post.content.slice(0, 100) || 'Untitled Post',
        description: post.content || null,
        status: post.status === 'published' ? 'published' : 'active',
        productionStage: post.status === 'scheduled' ? 'scheduled' : 
                         post.status === 'draft' ? 'idea' : 'ready',
        thumbnailUrl: post.mediaUrls[0] || null,
        ideaDate: post.createdAt ? new Date(post.createdAt).toISOString() : null,
        scriptDeadline: null,
        filmedDate: null,
        editedDate: null,
        reviewDate: null,
        seriesId: null,
        series: undefined,
        milestones: [],
        createdAt: post.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString(),
      }));

  // Group projects by stage
  const getProjectsByStage = (stage: Stage) => {
    return projects.filter((p) => p.productionStage === stage);
  };

  // Create new project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    try {
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projectTitle,
          description: projectDescription,
          status: 'active',
          productionStage: 'idea',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProjectTitle('');
        setProjectDescription('');
        setShowModal(false);
        fetchProjects();
      }
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  // Delete project
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Delete this project?')) return;
    
    try {
      const res = await fetch(`/api/pipeline?id=${projectId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchProjects();
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    e.dataTransfer.setData('projectId', projectId);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle drop - update the project's stage
  const handleDrop = async (e: React.DragEvent, newStage: Stage) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('projectId');
    
    try {
      const res = await fetch('/api/pipeline', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: projectId,
          productionStage: newStage,
          status: newStage === 'scheduled' ? 'scheduled' : 'active',
        }),
      });
      if (res.ok) {
        fetchProjects();
      }
    } catch (err) {
      console.error('Failed to update project:', err);
    }
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Content Pipeline</h1>
          <p className="text-text-secondary mt-1">Manage your content from idea to publication</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Project
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <div
            key={stage.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
            className="flex-shrink-0 w-72"
          >
            {/* Column Header */}
            <div className={`px-3 py-2 rounded-t-lg border-2 ${stage.color} ${stage.borderColor}`}>
              <div className="flex items-center justify-between">
                <stage.icon className="w-4 h-4 text-text-primary" />
                <span className="font-medium text-sm text-text-primary">{stage.label}</span>
                <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full text-text-secondary">
                  {getProjectsByStage(stage.id).length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className="bg-bg-secondary border-2 border-t-0 border-border rounded-b-lg p-2 min-h-[400px] space-y-2">
              {getProjectsByStage(stage.id).map((project) => (
                <div
                  key={project.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, project.id)}
                  className="bg-bg-card rounded-lg border border-border p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail */}
                  {project.thumbnailUrl ? (
                    <img
                      src={project.thumbnailUrl}
                      alt=""
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                  ) : (
                    <div className="w-full h-24 bg-bg-secondary rounded mb-2 flex items-center justify-center">
                      <Film className="w-8 h-8 text-text-muted" />
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="font-medium text-sm text-text-primary line-clamp-2">{project.title}</h3>

                  {/* Series badge */}
                  {project.series && (
                    <span
                      className="inline-block px-2 py-0.5 text-xs rounded-full mt-2 text-white"
                      style={{ backgroundColor: project.series.color || 'var(--color-accent)' }}
                    >
                      {project.series.name}
                    </span>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
                    {project.ideaDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(project.ideaDate), 'MMM d')}
                      </span>
                    )}
                    {project.milestones.filter((m) => m.completedAt).length > 0 && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-text-success" />
                        {project.milestones.filter((m) => m.completedAt).length}/{project.milestones.length}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
                    <button className="p-1 text-text-muted hover:text-text-primary">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-1 text-text-muted hover:text-text-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add card button */}
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-3 text-sm text-text-muted hover:text-text-primary hover:bg-bg-card rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Flow indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
        <ChevronRight className="w-4 h-4" />
        <span>Drag cards between columns to update status</span>
        <ChevronRight className="w-4 h-4" />
      </div>

      {/* New Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">New Content Project</h2>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Title</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:ring-2 focus:ring-text-primary"
                  placeholder="What is this content about?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
                <textarea
                  rows={3}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:ring-2 focus:ring-text-primary"
                  placeholder="Brief description or notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Content Type</label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-bg-primary text-text-primary">
                  <option value="YouTube">YouTube Video</option>
                  <option value="shorts">YouTube Shorts</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram">Instagram Reel</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-bg-secondary text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-text-primary text-white rounded-lg hover:bg-text-primary-hover transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}