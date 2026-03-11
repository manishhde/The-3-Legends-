import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Plus, Search, Filter, Calendar as CalendarIcon, Trash2, X, Users, RefreshCw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProjectTask, Status, Priority } from '../types';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { useAuth } from '../AuthContext';

const statusColumns: Status[] = ['Pending', 'In Progress', 'Completed'];

export const TaskManager: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState<Partial<ProjectTask>>({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Pending',
    deadline: '',
    progress: 0,
    amount: 0,
    teamMembers: [],
    files: []
  });

  useEffect(() => {
    const uid = user?.uid || 'guest_user';

    const q = query(collection(db, 'tasks'), where('userId', '==', uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProjectTask[];
      setTasks(taskList);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleUpdateProgress = async (id: string, progress: number) => {
    try {
      await updateDoc(doc(db, 'tasks', id), { progress });
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleManualTransfer = async (task: ProjectTask) => {
    let newStatus: Status | null = null;
    
    if (task.status === 'Pending') newStatus = 'In Progress';
    else if (task.status === 'In Progress') newStatus = 'Completed';
    else if (task.status === 'Completed') newStatus = 'Pending';

    if (newStatus) {
      try {
        await updateDoc(doc(db, 'tasks', task.id), { status: newStatus });
      } catch (error) {
        console.error("Manual transfer error:", error);
      }
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case 'High': return 'text-red-400 bg-red-400/10';
      case 'Medium': return 'text-neon-gold bg-neon-gold/10';
      case 'Low': return 'text-emerald-400 bg-emerald-400/10';
    }
  };

  const handleAddTask = async () => {
    const uid = user?.uid || 'guest_user';
    if (!newTask.title) return;
    
    try {
      await addDoc(collection(db, 'tasks'), {
        title: newTask.title,
        description: newTask.description || '',
        priority: newTask.priority || 'Medium',
        status: newTask.status || 'Pending',
        deadline: newTask.deadline || new Date().toISOString().split('T')[0],
        progress: newTask.progress || 0,
        amount: newTask.amount || 0,
        teamMembers: newTask.teamMembers || [],
        files: newTask.files || [],
        userId: uid,
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'Medium', status: 'Pending', deadline: '', progress: 0, amount: 0, teamMembers: [], files: [] });
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-glow-blue">PROJECT/TASK</h1>
          <p className="text-white/60">Manage your unified legends projects and tasks.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-neon-blue text-black font-bold px-6 py-3 rounded-xl neon-glow-blue hover:scale-105 transition-transform"
          >
            <Plus className="w-5 h-5" />
            Add New Project/Task
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-neon-blue border-t-transparent rounded-full animate-spin neon-glow-blue" />
        </div>
      ) : (
        <>
          <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input 
              type="text" 
              placeholder="Search projects or tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-neon-blue/50 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-white/60">
            <Filter className="w-5 h-5" />
            Filter
          </button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {statusColumns.map((status) => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-bold flex items-center gap-2">
                {status}
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/60">
                  {filteredTasks.filter(t => t.status === status).length}
                </span>
              </h3>
            </div>

            <div className="space-y-4 min-h-[500px]">
              {filteredTasks.filter(t => t.status === status).map((task) => (
                <GlassCard key={task.id} className="p-5 group" delay={0.1}>
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 hover:bg-red-500/20 rounded-md text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold mb-2 group-hover:text-neon-blue transition-colors">{task.title}</h4>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-white/40 line-clamp-2">{task.description}</p>
                    {task.amount > 0 && (
                      <span className="text-xs font-bold text-neon-blue bg-neon-blue/10 px-2 py-1 rounded-lg">
                        ₹{task.amount}
                      </span>
                    )}
                  </div>
                                   {task.status !== 'Completed' && (
                    <button 
                      onClick={() => handleManualTransfer(task)}
                      className="w-full py-2 mb-4 rounded-lg border border-neon-blue bg-neon-blue/20 text-neon-blue font-bold flex items-center justify-center gap-2 transition-all active:scale-95 neon-glow-blue"
                    >
                      <RefreshCw className="w-3 h-3 animate-spin-slow" />
                      Transfer Status
                    </button>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <CalendarIcon className="w-3 h-3" />
                      {task.deadline}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3 text-white/20" />
                      <span className="text-[10px] text-white/40">{task.teamMembers.length}</span>
                    </div>
                  </div>
                </GlassCard>
              ))}
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3 rounded-xl border border-dashed border-white/10 text-white/40 hover:text-white/60 hover:border-white/20 transition-all text-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </div>
        ))}
      </div>
      </>
      )}

      {/* Add Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass w-full max-w-lg rounded-3xl p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-glow-blue">New Project/Task</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">Title</label>
                  <input 
                    type="text" 
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-neon-blue/50" 
                    placeholder="Enter title..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">Description</label>
                  <textarea 
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-neon-blue/50 resize-none" 
                    rows={3}
                    placeholder="Enter description..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase">Priority</label>
                    <select 
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value as Priority})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-neon-blue/50"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase">Deadline</label>
                    <input 
                      type="date" 
                      value={newTask.deadline}
                      onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-neon-blue/50" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">Amount (₹)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={newTask.amount}
                    onChange={(e) => setNewTask({...newTask, amount: parseFloat(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-neon-blue/50" 
                    placeholder="0.00"
                  />
                </div>
              </div>

              <button 
                onClick={handleAddTask}
                className="w-full bg-neon-blue text-black font-bold py-4 rounded-xl neon-glow-blue hover:scale-[1.02] transition-transform"
              >
                Create Item
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
