import { Instagram, MessageCircle, Github, Users } from "lucide-react";
import { useSocket } from "../../../core/socket/SocketContext";

const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={className}
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function Footer() {
  const { onlineCount } = useSocket();

  return (
    <footer className="bg-card border-t border-border mt-auto py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Logo & Description (Minimal) */}
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <img src="/Log.png" alt="OnePlace" className="h-6 w-6 object-contain opacity-70" />
              <span className="text-sm font-bold text-foreground opacity-80">OnePlace</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-border" />
            <p className="text-xs text-muted-foreground hidden lg:block">
              Современная платформа для поиска работы и проектов.
            </p>
            <div className="flex items-center space-x-1.5 px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-medium text-green-600 dark:text-green-400">
                {onlineCount} онлайн
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground/60">
              © 2024
            </p>
          </div>

          {/* Social Icons (Larger and centered) */}
          <div className="flex items-center space-x-8">
            <a
              href="https://x.com/venom_simbiote"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-125"
              aria-label="X"
            >
              <XIcon className="h-6 w-6" />
            </a>
            <a
              href="https://www.instagram.com/gabarovveniamin/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-pink-600 transition-all duration-300 hover:scale-125"
              aria-label="Instagram"
            >
              <Instagram className="h-6 w-6" />
            </a>
            <a
              href="https://t.me/gabarovveniamin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-blue-500 transition-all duration-300 hover:scale-125"
              aria-label="Telegram"
            >
              <MessageCircle className="h-6 w-6" />
            </a>
            <a
              href="https://github.com/gabarovveniamin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-125"
              aria-label="GitHub"
            >
              <Github className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
