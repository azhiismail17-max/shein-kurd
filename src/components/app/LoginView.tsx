import React, { useState } from "react";
import { SCRIPT_URL } from "@/types";
import { SCRIPT_URL as IRAQI_SCRIPT_URL } from "@/iraqi/types";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
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
      const normalizedUsername = username.toLowerCase().trim();
      const loginAgainst = async (url: string) => {
        const payload = new URLSearchParams();
        payload.append("action", "login");
        payload.append("username", username);
        payload.append("password", password);

        try {
          const res = await fetchWithRetry(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: payload.toString(),
          });
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch (parseError) {
            console.log("Backend did not return JSON, using fallback mode");
            return { status: "error", message: "Backend not updated" };
          }
        } catch (networkError) {
          console.log("Network error, using fallback mode");
          return { status: "error", message: "Network error" };
        }
      };

      let data: any = await loginAgainst(SCRIPT_URL);
      let targetSystem = data.system || data.profile || "kurdistani";

      if (data.status !== "success") {
        const iraqiData = await loginAgainst(IRAQI_SCRIPT_URL);
        if (iraqiData.status === "success") {
          data = iraqiData;
          targetSystem = "iraqi";
        }
      } else if (targetSystem === "iraqi") {
        targetSystem = "iraqi";
      }

      // Hardcoded fallback since backend is not updated yet
      if (data.status !== "success") {
        const hardcodedUsers: Record<
          string,
          { pass: string; role: string; system?: "kurdistani" | "iraqi" }
        > = {
          owner: { pass: "mostang2021", role: "owner" },
          admin: { pass: "shein4321", role: "admin" },
          moderator: { pass: "shein1234", role: "moderator", system: "iraqi" },
          modertor: { pass: "shein1234", role: "moderator", system: "iraqi" },
          delivery: { pass: "sheindelivery", role: "delivery", system: "iraqi" },
          delvery: { pass: "sheindelivery", role: "delivery", system: "iraqi" },
        };

        const user = hardcodedUsers[normalizedUsername];
        if (user && user.pass === password) {
          data = { status: "success", role: user.role };
          targetSystem = user.system || "kurdistani";
        } else {
          data = { status: "error", message: "Invalid username or password" };
        }
      }

      if (data.status === "success") {
        if (targetSystem === "iraqi") {
          localStorage.setItem("iraqi_auth_role", data.role);
          localStorage.setItem("iraqi_auth_username", normalizedUsername);
          window.location.href = "/iraqi";
          return;
        }
        localStorage.setItem("auth_role", data.role);
        localStorage.setItem("auth_username", normalizedUsername);
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
      <div className="w-full max-w-5xl grid gap-5 lg:grid-cols-[1.08fr_0.92fr] items-stretch">
        <div className="hidden lg:flex bg-sidebar text-sidebar-foreground border border-sidebar-border rounded-2xl p-8 flex-col justify-between overflow-hidden shadow-2xl shadow-slate-950/15 bg-[radial-gradient(circle_at_top_left,hsl(var(--sidebar-primary)/0.22),transparent_26rem)]">
          <div>
            <div className="w-14 h-14 overflow-hidden rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-extrabold shadow-lg shadow-black/25 ring-1 ring-white/10">
              <img
                src="/logo-512.png"
                alt="Shein Kurdistani"
                className="h-full w-full object-cover"
              />
            </div>
            <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-white">
              Shein Kurdistani
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-sidebar-foreground">
              Professional order operations, boxes, delivery, finance, and team workflow in one
              secure system.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-sidebar-border/80 bg-sidebar-accent/85 p-3 shadow-sm">
              <div className="font-bold text-white">Orders</div>
              <div className="mt-1">Live workflow</div>
            </div>
            <div className="rounded-xl border border-sidebar-border/80 bg-sidebar-accent/85 p-3 shadow-sm">
              <div className="font-bold text-white">Boxes</div>
              <div className="mt-1">Batch control</div>
            </div>
            <div className="rounded-xl border border-sidebar-border/80 bg-sidebar-accent/85 p-3 shadow-sm">
              <div className="font-bold text-white">Team</div>
              <div className="mt-1">Role access</div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm lg:max-w-none mx-auto glass-surface rounded-2xl shadow-2xl shadow-slate-950/10 p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="mx-auto mb-6 flex justify-center">
              {/* The square app logo is stored in the public folder as logo-512.png. */}
              <img
                src="/logo-512.png"
                alt="Shein Kurdistani"
                className="w-24 h-32 sm:w-28 sm:h-40 object-cover rounded-2xl shadow-xl shadow-primary/10 border border-primary/20"
                onError={(e) => {
                  // Fallback if image isn't uploaded yet
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/400x600/600/FFF?text=Shein\\nKurdistani";
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
    </div>
  );
};
