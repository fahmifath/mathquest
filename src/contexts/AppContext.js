import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, logoutUser, getMe } from '../services/authService';
import { selectEducationLevel } from '../services/educationLevelService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    // Hydrate dari localStorage saat pertama load
    const saved = localStorage.getItem('mq_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [preTestResult, setPreTestResult] = useState(() => {
    const saved = localStorage.getItem('mq_pretest');
    return saved ? JSON.parse(saved) : null;
  });

  const [achievements, setAchievements] = useState([
    { id: 1, title: 'First Step', icon: '🚀', desc: 'Selesaikan Pre-test pertama', unlocked: true },
    { id: 2, title: 'Math Warrior', icon: '⚔️', desc: 'Selesaikan 10 tantangan', unlocked: false },
    { id: 3, title: '7 Days Streak', icon: '🔥', desc: 'Belajar 7 hari berturut-turut', unlocked: false },
  ]);

  // ── SYNC KE LOCALSTORAGE ───────────────────────────────────────────────────

  useEffect(() => {
    if (user) {
      localStorage.setItem('mq_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mq_user');
    }
  }, [user]);

  const normalizeUser = (beUser) => {
    const latestLevel = beUser.userEducationLevels?.[0]?.educationLevel || null;
    return {
      id:       beUser.id,
      username: beUser.name,            
      email:    beUser.email,
      foto:     beUser.avatarUrl
                || `https://api.dicebear.com/7.x/avataaars/svg?seed=${beUser.name}`,
      xp:       beUser.userXp?.totalXp || 0,
      level:    beUser.userXp?.level || 1,
      xpToNext: beUser.userXp?.xpToNextLevel || 100,
      jenjang:  latestLevel,
      rank:     '-',
    };
  };

  const login = async (credentials) => {
    const { user: beUser, token } = await loginUser(credentials);

    // Simpan token untuk request selanjutnya
    localStorage.setItem('mq_token', token);

    // Set user ke state dengan format FE
    setUser(normalizeUser(beUser));
    return normalizeUser(beUser);
  };
  
  const updateJenjang = async (educationLevel) => {
    await selectEducationLevel(educationLevel);
    setUser((prev) => ({ ...prev, jenjang: educationLevel }));
  };

  const syncXpFromBE = (userXpFromBE) => {
    setUser((prev) => ({
      ...prev,
      xp:      userXpFromBE.totalXp,
      level:   userXpFromBE.level,
      xpToNext: userXpFromBE.xpToNextLevel,
    }));
  };

  const addXP = (amount) => {
    setUser((prev) => {
      if (!prev) return null;
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 1000) + 1;
      return { ...prev, xp: newXP, level: newLevel };
    });
  };

  const refreshUser = async () => {
    try {
      const beUser = await getMe();
      setUser(normalizeUser(beUser));
    } catch (err) {
      // Token expired atau invalid → logout
      if (err.status === 401) logout();
    }
  };

  const logout = async () => {
    try {
      await logoutUser(); 
    } catch {
      // Abaikan error logout dari BE
    }
    setUser(null);
    setPreTestResult(null);
    localStorage.removeItem('mq_token');
    localStorage.removeItem('mq_user');
    localStorage.removeItem('mq_pretest');
  };

  // ── PROVIDER ───────────────────────────────────────────────────────────────

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        login,
        updateJenjang,
        preTestResult,
        setPreTestResult,
        achievements,
        setAchievements,
        addXP,
        syncXpFromBE,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};