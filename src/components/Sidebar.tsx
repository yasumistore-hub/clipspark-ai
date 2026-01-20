import { Home, Library, Settings, Sparkles, Video } from "lucide-react";
import { mockRecentProjects } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "library", label: "Library", icon: Library },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ activeNav, onNavChange }: SidebarProps) {
  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-purple to-neon-cyan flex items-center justify-center glow-purple">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">ClipStream</h1>
            <p className="text-xs text-muted-foreground">AI-Powered</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary/20 text-primary glow-purple"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Recent Projects */}
      <div className="p-4 border-t border-sidebar-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Recent Projects
        </h3>
        <div className="space-y-2">
          {mockRecentProjects.map((project) => (
            <button
              key={project.id}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors group"
            >
              <div className="relative">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-12 h-8 rounded object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent rounded" />
                <Video className="absolute bottom-0.5 right-0.5 w-3 h-3 text-primary-foreground" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {project.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {project.clipCount} clips • {project.createdAt}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
