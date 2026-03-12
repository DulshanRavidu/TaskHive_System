import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Hexagon, LogOut, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AppHeader() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="border-b bg-card">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Hexagon className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-card-foreground">TaskHive</h1>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3" />
              Admin
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={logout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut className="mr-1.5 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
