import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../components/GlassCard';
import { 
  User, 
  Camera,
  Mail,
  Calendar as CalendarIcon,
  Sun,
  Moon,
  Check,
  Save,
  Loader2
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export const Settings: React.FC = () => {
  const { user, theme, setTheme } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    dob: '',
    email: '',
    photoUrl: '',
    theme: 'dark'
  });

  useEffect(() => {
    const uid = user?.uid || 'guest_user';

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as any;
          setProfile(data);
          if (data.theme) setTheme(data.theme);
        } else {
          setProfile({
            fullName: user?.displayName || 'Legend Guest',
            dob: '',
            email: user?.email || 'guest@3legends.app',
            photoUrl: user?.photoURL || '',
            theme: 'dark'
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    setProfile({ ...profile, theme: newTheme });
  };

  const handleSave = async () => {
    const uid = user?.uid || 'guest_user';
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', uid), profile, { merge: true });
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-neon-blue border-t-transparent rounded-full animate-spin neon-glow-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-glow-blue">Settings</h1>
          <p className="text-white/60">Manage your legends profile and preferences.</p>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
          <button 
            onClick={() => handleThemeChange('light')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              profile.theme === 'light' 
                ? 'bg-white text-black font-bold shadow-lg' 
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <Sun className="w-4 h-4" />
            Light
          </button>
          <button 
            onClick={() => handleThemeChange('dark')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              profile.theme === 'dark' 
                ? 'bg-neon-blue text-black font-bold shadow-lg neon-glow-blue' 
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <Moon className="w-4 h-4" />
            Dark
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <GlassCard>
          <h3 className="text-xl font-bold mb-6">Profile Information</h3>
          <div className="flex items-center gap-6 mb-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                {profile.photoUrl ? (
                  <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-12 h-12 text-white/20" />
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              <button 
                onClick={handlePhotoClick}
                className="absolute bottom-[-8px] right-[-8px] p-2 bg-neon-blue text-black rounded-xl neon-glow-blue hover:scale-110 transition-transform"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h4 className="text-lg font-bold text-glow-blue">{profile.fullName || 'Legend User'}</h4>
              <p className="text-sm text-white/40">Update your personal details below.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase flex items-center gap-2">
                <User className="w-3 h-3" /> Full Name
              </label>
              <input 
                type="text" 
                value={profile.fullName}
                onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-neon-blue/50 transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase flex items-center gap-2">
                <CalendarIcon className="w-3 h-3" /> DoB (Date of Birth)
              </label>
              <input 
                type="date" 
                value={profile.dob}
                onChange={(e) => setProfile({...profile, dob: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-neon-blue/50 transition-all" 
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase flex items-center gap-2">
                <Mail className="w-3 h-3" /> MAIL (Email)
              </label>
              <input 
                type="email" 
                value={profile.email}
                readOnly
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none opacity-60 cursor-not-allowed" 
              />
            </div>
          </div>
        </GlassCard>

        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-neon-blue text-black font-bold px-10 py-4 rounded-xl neon-glow-blue hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
