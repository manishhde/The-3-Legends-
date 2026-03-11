import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { GlassCard } from '../components/GlassCard';
import { CheckCircle, Briefcase, DollarSign, Zap, Clock, BarChart3, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

export const Dashboard: React.FC = () => {
  const { user, theme } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [taskCount, setTaskCount] = useState(0);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const uid = user?.uid || 'guest_user';

    // Listen to tasks
    const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', uid));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      let paid = 0;
      let pending = 0;
      let count = 0;
      
      const monthlyMap: { [key: string]: number } = {};
      const yearlyMap: { [key: string]: number } = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const amount = data.amount || 0;
        const createdAt = data.createdAt?.toDate() || new Date();
        
        const monthYear = createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const year = createdAt.getFullYear().toString();

        if (data.status === 'Completed') {
          paid += amount;
          monthlyMap[monthYear] = (monthlyMap[monthYear] || 0) + amount;
          yearlyMap[year] = (yearlyMap[year] || 0) + amount;
        } else {
          pending += amount;
        }
        count++;
      });

      // Convert maps to arrays for charts
      const mData = Object.entries(monthlyMap).map(([name, revenue]) => ({ name, revenue }));
      const yData = Object.entries(yearlyMap).map(([year, revenue]) => ({ year, revenue }));

      setTaskCount(count);
      setPaymentTotal(paid);
      setPendingTotal(pending);
      setMonthlyData(mData);
      setYearlyData(yData);
      setLoading(false);
    });

    return () => {
      unsubscribeTasks();
    };
  }, [user]);

  const stats = [
    { label: 'Active Tasks', value: taskCount.toString(), icon: CheckCircle, color: 'blue' },
    { label: 'Revenue', value: `₹${(paymentTotal / 1000).toFixed(1)}k`, icon: DollarSign, color: 'blue' },
    { label: 'Pending', value: `₹${(pendingTotal / 1000).toFixed(1)}k`, icon: Clock, color: 'gold' },
  ];

  const pieData = [
    { name: 'Paid', value: paymentTotal || 1, color: '#00f2ff' },
    { name: 'Pending', value: pendingTotal || 0, color: '#ffcc00' },
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight text-glow-blue"
          >
            𝗧𝗵𝗲 𝟯 𝗟𝗲𝗴𝗲𝗻𝗱𝘀 🎯
          </motion.h1>
          <p className="text-white/40 text-sm font-medium tracking-wide uppercase">System Overview • Active</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3 px-4 py-2 glass rounded-xl border-neon-blue/20">
            <Clock className="w-4 h-4 text-neon-blue" />
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-white">{formatTime(currentTime)}</span>
              <span className="text-[10px] font-bold text-white/40 uppercase">{formatDate(currentTime)}</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Zap className="w-3 h-3 text-neon-blue animate-pulse" />
            <span className="text-[10px] font-bold text-neon-blue uppercase tracking-widest">Optimized Performance</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <GlassCard key={idx} delay={idx * 0.1} glowColor={stat.color as any} className="py-8">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${stat.color === 'blue' ? 'bg-neon-blue/10 text-neon-blue' : 'bg-neon-gold/10 text-neon-gold'}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-0.5">{stat.value}</h3>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2" delay={0.4}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-neon-blue" />
                Monthly Revenue
              </h3>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: theme === 'light' ? '#64748b' : '#94a3b8', fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: theme === 'light' ? '#64748b' : '#94a3b8', fontSize: 12 }}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ 
                      backgroundColor: theme === 'light' ? '#ffffff' : '#050505', 
                      border: '1px solid #ffffff10', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      color: theme === 'light' ? '#0f172a' : '#ffffff'
                    }}
                    itemStyle={{
                      color: theme === 'light' ? '#0f172a' : '#ffffff'
                    }}
                  />
                  <Bar dataKey="revenue" fill="#00f2ff" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-1" delay={0.5}>
          <div className="space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neon-gold" />
              Yearly Revenue
            </h3>
            
            <div className="space-y-4">
              {yearlyData.length > 0 ? yearlyData.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Year</p>
                    <h4 className="text-xl font-bold">{item.year}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Revenue</p>
                    <h4 className="text-xl font-bold text-neon-gold">₹{(item.revenue / 1000).toFixed(1)}k</h4>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center text-white/20 italic">
                  No yearly data available
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
