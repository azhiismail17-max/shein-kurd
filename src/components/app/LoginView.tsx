import React, { useState } from 'react';
import { SCRIPT_URL } from '@/types';
import { SCRIPT_URL as IRAQI_SCRIPT_URL } from '@/iraqi/types';
import { fetchWithRetry } from '@/lib/fetchWithRetry';
import { Lock, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const LoginView = ({ onLogin }: { onLogin: (role: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
        payload.append('action', 'login');
        payload.append('username', username);
        payload.append('password', password);

        try {
          const res = await fetchWithRetry(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: payload.toString()
          });
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch (parseError) {
            console.log('Backend did not return JSON, using fallback mode');
            return { status: 'error', message: 'Backend not updated' };
          }
        } catch (networkError) {
          console.log('Network error, using fallback mode');
          return { status: 'error', message: 'Network error' };
        }
      };

      let data: any = await loginAgainst(SCRIPT_URL);
      let targetSystem = data.system || data.profile || 'kurdistani';

      if (data.status !== 'success') {
        const iraqiData = await loginAgainst(IRAQI_SCRIPT_URL);
        if (iraqiData.status === 'success') {
          data = iraqiData;
          targetSystem = 'iraqi';
        }
      } else if (targetSystem === 'iraqi') {
        targetSystem = 'iraqi';
      }

      // Hardcoded fallback since backend is not updated yet
      if (data.status !== 'success') {
        const hardcodedUsers: Record<string, { pass: string, role: string }> = {
          'owner': { pass: 'mostang2021', role: 'owner' },
          'admin': { pass: 'shein4321', role: 'admin' },
          'modertor': { pass: 'shein1234', role: 'moderator' },
          'delvery': { pass: 'sheindelivery', role: 'delivery' } 
        };

        const user = hardcodedUsers[normalizedUsername];
        if (user && user.pass === password) {
          data = { status: 'success', role: user.role };
          targetSystem = 'kurdistani';
        } else {
          data = { status: 'error', message: 'Invalid username or password' };
        }
      }
      
      if (data.status === 'success') {
        if (targetSystem === 'iraqi') {
          localStorage.setItem('iraqi_auth_role', data.role);
          localStorage.setItem('iraqi_auth_username', normalizedUsername);
          window.location.href = '/iraqi';
          return;
        }
        localStorage.setItem('auth_role', data.role);
        localStorage.setItem('auth_username', normalizedUsername);
        onLogin(data.role);
      } else {
        toast({ title: 'Error', description: data.message || 'Invalid credentials', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to connect. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-xl p-6">
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 flex justify-center">
            {/* The user can upload their custom logo to the public folder as logo.jpg */}
            <img 
              src="/logo.jpg" 
              alt="Shein Kurdistani" 
              className="w-32 h-48 object-cover rounded-2xl shadow-2xl border-2 border-primary/20"
              onError={(e) => {
                // Fallback if image isn't uploaded yet
                (e.target as HTMLImageElement).src = 'https://placehold.co/400x600/600/FFF?text=Shein\\nKurdistani';
              }}
            />
          </div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-primary transition-colors"
                placeholder="Enter username"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-primary transition-colors"
                placeholder="Enter password"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-medium rounded-lg py-2.5 flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-70 mt-6"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
