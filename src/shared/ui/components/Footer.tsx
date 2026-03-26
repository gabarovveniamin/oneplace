import { Instagram, MessageCircle, Github } from "lucide-react";

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
  return (
    <footer className="footer-shell mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-card px-4 py-3 sm:px-6 sm:py-3 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <img src="/Log.png" alt="OnePlace" className="h-8 w-8 object-cover" />
            <div>
              <p className="text-sm font-semibold tracking-tight">OnePlace</p>
              <p className="text-xs text-muted-foreground">Work. Market. Community.</p>
            </div>
            <div className="hidden sm:block w-px h-6 bg-border" />
            <p className="hidden sm:block text-xs text-muted-foreground">© 2026 OnePlace</p>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href="https://x.com/venom_simbiote"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 flex items-center justify-center"
              aria-label="X"
            >
              <XIcon className="h-4 w-4" />
            </a>
            <a
              href="https://www.instagram.com/gabarovveniamin/"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 flex items-center justify-center"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://t.me/gabarovveniamin"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 flex items-center justify-center"
              aria-label="Telegram"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/gabarovveniamin"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 flex items-center justify-center"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
