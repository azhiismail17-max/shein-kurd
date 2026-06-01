import React, { useState, useMemo } from 'react';
import { MonthlyStats, Order, getOrderStatus } from '@/iraqi/types';
import { ShoppingCart, Clock, Package, DollarSign, Calculator, Plus, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import MonthSelector from './MonthSelector';
import { getCustomerTotalPrice } from '@/iraqi/lib/order-utils';

interface DashboardViewProps {
  stats: MonthlyStats | undefined;
  orders: Order[];
  viewingMonth: string;
  availableMonths: string[];
  setViewingMonth: (m: string) => void;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (q: string) => void;
  onNewOrder: () => void;
  activeYear: string;
  setActiveYear: (y: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  stats, orders, viewingMonth, availableMonths, setViewingMonth, setActiveTab, setSearchQuery, onNewOrder, activeYear, setActiveYear
}) => {
  const [showFinancials, setShowFinancials] = useState(false);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'hourly'>('daily');

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => getOrderStatus(o) === 'pending').length;
  const pendingInBoxes = orders.filter(o => getOrderStatus(o) === 'pending' && String(o.box_name || '').trim()).length;
  const pendingUnboxed = pendingOrders - pendingInBoxes;
  const uniqueBatches = new Set(orders.map(o => {
    const box = String(o.box_name || '').trim();
    if (!box) return '';
    const match = box.match(/(\d+)/);
    return match ? match[1] : box;
  }).filter(Boolean));

  const revenue = orders.length > 0
    ? orders.reduce((sum, order) => sum + getCustomerTotalPrice(order, orders), 0)
    : stats?.revenue || 0;
  const buy = stats?.buy || 0;
  const wgt = stats?.wgt || 0;
  const etc = stats?.etc || 0;
  const lost = stats?.lost || 0;
  const totalCost = buy + wgt + etc + lost;
  const profit = revenue - totalCost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  const activityData = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach(order => {
      if (!order.date || order.date === 'Unknown Date') return;
      const parts = order.date.split(' ');
      if (parts.length !== 2) return;
      const [datePart, timePart] = parts;
      const [day, month] = datePart.split('/');
      const [hour] = timePart.split(':');
      let key = '';
      if (timeframe === 'weekly') key = `Week ${Math.ceil(parseInt(day, 10) / 7)}`;
      else if (timeframe === 'daily') key = `${day}/${month}`;
      else key = `${hour}:00`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.keys()).sort().map(k => ({ name: k, orders: map.get(k) || 0 }));
  }, [orders, timeframe]);

  const statusData = [
    { name: 'Pending', value: pendingOrders, color: 'hsl(var(--status-pending))' },
    { name: 'Processed', value: totalOrders - pendingOrders, color: 'hsl(var(--primary))' },
  ];

  const StatCard = ({ title, value, icon: Icon, sub, onClick }: {
    title: string; value: string | number; icon: React.ElementType; sub?: string; onClick?: () => void;
  }) => (
    <button onClick={onClick} className="bg-card p-5 rounded-xl border border-border hover:border-primary/30 transition-all text-left w-full group">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="p-2 rounded-lg bg-primary/10 text-primary"><Icon size={18} /></div>
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{title}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-[10px] uppercase font-medium tracking-wider text-muted-foreground mt-1">{sub}</div>}
    </button>
  );

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border">
        <div>
          <h1 className="text-xl font-bold">Financial Overview</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Analytics & Performance Metrics</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <MonthSelector viewingMonth={viewingMonth} setViewingMonth={setViewingMonth} activeYear={activeYear} setActiveYear={setActiveYear} availableMonths={availableMonths} />
          <button onClick={onNewOrder} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm transition-colors glow-primary">
            <Plus size={16} /> New Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={totalOrders} icon={ShoppingCart} sub={`${viewingMonth} Registry`} onClick={() => { setSearchQuery(''); setActiveTab('orders'); }} />
        <StatCard title="Pending" value={pendingOrders} icon={Clock} sub={`📦 ${pendingInBoxes} in boxes · ${pendingUnboxed} unboxed`} onClick={() => { setSearchQuery('pending'); setActiveTab('orders'); }} />
        <StatCard title="Active Boxes" value={uniqueBatches.size} icon={Package} sub="In progress" onClick={() => setActiveTab('batches')} />
        <StatCard title="Revenue" value={`${(revenue / 1000000).toFixed(1)}M`} icon={DollarSign} sub="Total IQD" onClick={() => setShowFinancials(p => !p)} />
      </div>

      {showFinancials && (
        <div className="bg-card p-5 rounded-xl border border-border animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><Calculator size={18} /></div>
              <h3 className="font-bold">Financial Breakdown</h3>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${profit > 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
              {margin.toFixed(1)}% Margin
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-secondary p-4 rounded-lg">
              <div className="text-muted-foreground text-xs font-medium mb-1">Revenue</div>
              <div className="text-xl font-bold font-mono">{revenue.toLocaleString()} <span className="text-xs text-muted-foreground">IQD</span></div>
            </div>
            <div className="bg-secondary p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Buying Cost</span><span className="text-destructive font-mono font-semibold">{buy.toLocaleString()}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Weight/Ship</span><span className="text-destructive font-mono font-semibold">{wgt.toLocaleString()}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Other</span><span className="text-destructive font-mono font-semibold">{etc.toLocaleString()}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Lost</span><span className="text-destructive font-mono font-semibold">{lost.toLocaleString()}</span></div>
              <div className="border-t border-border pt-2 flex justify-between text-xs font-bold"><span>Total Cost</span><span className="font-mono">{totalCost.toLocaleString()}</span></div>
            </div>
            <div className="bg-secondary p-4 rounded-lg flex flex-col items-center justify-center">
              <div className="text-muted-foreground text-xs font-medium mb-1">Net Profit</div>
              <div className={`text-2xl font-bold font-mono ${profit > 0 ? 'text-primary' : 'text-destructive'}`}>{profit.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">IQD</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card p-5 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><TrendingUp size={18} /></div>
              <h3 className="font-bold text-sm">Order Activity</h3>
            </div>
            <div className="flex gap-1">
              {(['daily', 'weekly', 'hourly'] as const).map(tf => (
                <button key={tf} onClick={() => setTimeframe(tf)} className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase transition-all ${timeframe === tf ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}>{tf}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border">
          <h3 className="font-bold text-sm mb-4">Order Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {statusData.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-muted-foreground">{s.name}: <span className="font-semibold text-foreground">{s.value}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
