import { Hexagon, Github, Twitter, Mail } from "lucide-react";

export default function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-card mt-24">
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Hexagon className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-card-foreground">TaskHive</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Manage your tasks efficiently. Stay organised, stay productive.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Resources
            </p>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Documentation
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              API Reference
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Support
            </a>
          </div>

          {/* Social */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Connect
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="GitHub"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Email"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {year} TaskHive. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
