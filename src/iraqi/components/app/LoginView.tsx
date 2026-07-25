import React, { useState } from "react";
import { SCRIPT_URL } from "@/iraqi/types";
import { fetchWithRetry } from "@/iraqi/lib/fetchWithRetry";
import { Lock, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const LoginView = ({ onLogin }: { onLogin: (role: string) => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    try {
      const payload = new URLSearchParams();
      payload.append("action", "login");
      payload.append("username", username);
      payload.append("password", password);

      let data: any = {};
      try {
        const res = await fetchWithRetry(SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: payload.toString(),
        });
        const text = await res.text();

        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.log("Backend did not return JSON, using fallback mode");
          data = { status: "error", message: "Backend not updated" };
        }
      } catch (networkError) {
        console.log("Network error, using fallback mode");
        data = { status: "error", message: "Network error" };
      }

      // Hardcoded fallback since backend is not updated yet
      if (data.status !== "success") {
        const hardcodedUsers: Record<string, { pass: string; role: string }> = {
          owner: { pass: "mostang2021", role: "owner" },
          admin: { pass: "shein4321", role: "admin" },
          moderator: { pass: "shein1234", role: "moderator" },
          modertor: { pass: "shein1234", role: "moderator" },
          delvery: { pass: "sheindelivery", role: "delivery" },
        };

        const user = hardcodedUsers[username.toLowerCase().trim()];
        if (user && user.pass === password) {
          data = { status: "success", role: user.role };
        } else {
          data = { status: "error", message: "Invalid username or password" };
        }
      }

      if (data.status === "success") {
        localStorage.setItem("iraqi_auth_role", data.role);
        localStorage.setItem("iraqi_auth_username", username.toLowerCase().trim());
        onLogin(data.role);
      } else {
        toast({
          title: "Error",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to connect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center professional-surface p-4 sm:p-6">
      <div className="w-full max-w-sm glass-surface rounded-2xl shadow-2xl shadow-slate-950/10 p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 flex justify-center">
            {/* The square app logo is stored in the public folder as logo-512.png. */}
            <img
              src="/logo-512.png"
              alt="Shein Iraqi"
              className="w-24 h-32 sm:w-28 sm:h-40 object-cover rounded-2xl shadow-xl shadow-primary/10 border border-primary/20"
              onError={(e) => {
                // Fallback if image isn't uploaded yet
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/400x600/600/FFF?text=Shein\\nIraqi";
              }}
            />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to continue operations</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Username</label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Enter username"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Password</label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-bold rounded-xl py-3 flex items-center justify-center transition-all hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 mt-6 shadow-lg shadow-primary/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};
