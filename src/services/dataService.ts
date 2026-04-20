import { User, MoodLog, ActivityLog, MOOD_CONFIG, MoodLabel, Alert } from '../types';
import { generateId, formatDate, formatTime } from '../lib/utils';
import { isAfter, subDays } from 'date-fns';

/**
 * dataService.ts
 * 
 * This service manages data persistence with the Google Sheets backend.
 */

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwLbx_5oclss5qoq3MinygpHdJzyf5ceCb_3ZRlxqLzaayuKIy1BlRxFB_rhmEsB4j_/exec';

const STORAGE_KEYS = {
  CURRENT_USER: 'moodie_current_session',
  LAST_LOGIN: 'moodie_last_login'
};

// --- FETCH HELPER ---

async function fetchSheet<T>(action: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<T> {
  let url = `${WEB_APP_URL}?action=${action}`;
  
  // Add cache buster for GET requests
  if (method === 'GET') {
    url += `&_t=${Date.now()}`;
  }

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'text/plain;charset=utf-8', 
    },
    body: method === 'POST' ? JSON.stringify({ action, ...body }) : undefined,
    redirect: 'follow',
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
        console.error('Database Error: Received HTML instead of JSON. This usually means the Google Script permissions are wrong.');
        throw new Error('DATABASE_PERMISSION_ERROR');
      }
      throw new Error(`Invalid response format from database.`);
    }

    // Handle standard Google Apps Script wrapper { status: 'success', data: [...] } or { action: '...', data: [...] }
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if ('error' in data) throw new Error(data.error as string);
      
      // If result contains a 'data' field, use that (common in many GAS templates)
      if ('data' in data) {
        return data.data as T;
      }
    }
    
    return data;
  } catch (error) {
    console.error(`Fetch error for action ${action}:`, error);
    throw error;
  }
}

// --- DATA METHODS ---

export const DataService = {
  // USER MANAGEMENT
  async registerUser(userData: Omit<User, 'user_id' | 'created_at' | 'status'>): Promise<User> {
    const newUser: Partial<User> = {
      ...userData,
      user_id: generateId(),
      created_at: new Date().toISOString(),
      status: 'active'
    };
    const result = await fetchSheet<User>('registerUser', 'POST', newUser);
    return result;
  },

  async login(identifier: string, password?: string): Promise<User | null> {
    let rawData = await fetchSheet<any>('getUsers', 'GET', { _t: Date.now() });
    
    // Robustly handle different Google Sheets data formats (Object Array vs 2D Array)
    let users: any[] = [];
    if (Array.isArray(rawData)) {
      // Check if it's a 2D array (first element is an array)
      if (Array.isArray(rawData[0])) {
        const headers = rawData[0].map((h: any) => String(h).toLowerCase().replace(/[\s_]/g, ''));
        users = rawData.slice(1).map(row => {
          const obj: any = {};
          headers.forEach((h: string, i: number) => {
            obj[h] = row[i];
          });
          return obj;
        });
      } else {
        users = rawData; // Already an array of objects
      }
    }

    if (users.length === 0) {
      throw new Error('The user database is empty. Please register your account first!');
    }

    const trimmedId = identifier.trim().toLowerCase();
    const cleanId = trimmedId.replace(/[^a-z0-9]/g, '');
    const trimmedPassword = (password || '').trim();

    // Flexible value finder
    const getFuzzyVal = (obj: any, targets: string[]) => {
      const keys = Object.keys(obj);
      for (const target of targets) {
        const normTarget = target.toLowerCase().replace(/[\s_]/g, '');
        // Match if key contains target or vice versa
        const match = keys.find(k => {
          const nk = k.toLowerCase().replace(/[\s_]/g, '');
          return nk === normTarget || nk.includes(normTarget) || normTarget.includes(nk);
        });
        if (match) return String(obj[match]);
      }
      return '';
    };
    
    const foundUser = users.find(u => {
      const dbName = getFuzzyVal(u, ['fullname', 'name', 'user']).trim().toLowerCase();
      const dbPass = getFuzzyVal(u, ['password', 'pass', 'pwd']).trim();
      return (dbName === trimmedId || dbName.replace(/[^a-z0-9]/g, '') === cleanId) && dbPass === trimmedPassword;
    });
    
    if (!foundUser) {
      const dbNames = users.map(u => getFuzzyVal(u, ['fullname', 'name']).trim()).filter(Boolean);
      const nameExists = dbNames.some(n => n.toLowerCase() === trimmedId || n.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanId);
      
      if (nameExists) {
        throw new Error('Incorrect password. Use the Eye icon to see what you typed!');
      } else {
        const existingNames = dbNames.slice(0, 3).join(', ');
        const nameHint = existingNames ? ` (Names found in database: ${existingNames}...)` : '';
        throw new Error(`We couldn't find "${identifier}" in the user list.${nameHint}`);
      }
    }

    // Map fuzzy keys to standard User model keys
    // Try to get previous login from localStorage since we don't update the sheet yet
    const previousLogin = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN);
    
    const user: User = {
      user_id: getFuzzyVal(foundUser, ['userid', 'user_id', 'id']),
      full_name: getFuzzyVal(foundUser, ['fullname', 'name', 'user']),
      student_email: getFuzzyVal(foundUser, ['studentemail', 'email', 'student']),
      parent_email: getFuzzyVal(foundUser, ['parentemail', 'email', 'parent']),
      parent_name: getFuzzyVal(foundUser, ['parentname', 'guardian']),
      class_name: getFuzzyVal(foundUser, ['classname', 'class']),
      age: parseInt(getFuzzyVal(foundUser, ['age']), 10) || 0,
      role: 'student',
      status: 'active',
      last_login: previousLogin || getFuzzyVal(foundUser, ['lastlogin', 'lastactive']),
      created_at: getFuzzyVal(foundUser, ['createdat', 'joined']) || new Date().toISOString()
    };
    
    // Update last login for next time
    localStorage.setItem(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  },

  getCurrentUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setUserSession(user: User) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // MOOD LOGS
  async saveMoodLog(log: Omit<MoodLog, 'log_id' | 'date' | 'time' | 'risk_flag' | 'created_at' | 'support_requested'>): Promise<MoodLog> {
    const newLog: any = {
      ...log,
      log_id: generateId(),
      date: formatDate(new Date()),
      time: formatTime(new Date()),
      risk_flag: log.mood_score <= 1,
      support_requested: false,
      created_at: new Date().toISOString(),
      // Send dual keys for spreadsheet compatibility
      mood_score: log.mood_score,
      score: log.mood_score
    };
    const result = await fetchSheet<MoodLog>('saveMood', 'POST', newLog);
    return result;
  },

  async getMoodLogs(userId: string): Promise<MoodLog[]> {
    const rawData = await fetchSheet<any[]>('getMoodLogs', 'GET');
    
    let logs: any[] = [];
    if (Array.isArray(rawData)) {
      if (Array.isArray(rawData[0])) {
        const headers = rawData[0].map((h: any) => String(h).toLowerCase().replace(/[\s_]/g, ''));
        logs = rawData.slice(1).map(row => {
          const obj: any = {};
          headers.forEach((h: string, i: number) => {
            obj[h] = row[i];
          });
          return obj;
        });
      } else {
        logs = rawData;
      }
    }

    const getFuzzyVal = (obj: any, targets: string[]) => {
      const keys = Object.keys(obj);
      for (const target of targets) {
        const normTarget = target.toLowerCase().replace(/[\s_]/g, '');
        const match = keys.find(k => k.toLowerCase().replace(/[\s_]/g, '') === normTarget);
        if (match) return obj[match];
      }
      return null;
    };

    return logs
      .map(l => ({
        log_id: String(getFuzzyVal(l, ['logid', 'id']) || ''),
        user_id: String(getFuzzyVal(l, ['userid', 'user_id']) || ''),
        date: String(getFuzzyVal(l, ['date']) || ''),
        time: String(getFuzzyVal(l, ['time']) || ''),
        mood_emoji: String(getFuzzyVal(l, ['moodemoji', 'emoji']) || ''),
        mood_label: String(getFuzzyVal(l, ['moodlabel', 'label']) || '') as MoodLabel,
        mood_score: parseInt(getFuzzyVal(l, ['moodscore', 'score']), 10) || 0,
        note: String(getFuzzyVal(l, ['note', 'remarks']) || ''),
        risk_flag: !!getFuzzyVal(l, ['riskflag', 'risk']),
        support_requested: !!getFuzzyVal(l, ['supportrequested', 'support']),
        created_at: String(getFuzzyVal(l, ['createdat', 'created_at']) || '')
      }))
      .filter(l => l.user_id === userId)
      .sort((a, b) => {
        const dComp = (b.date || '').localeCompare(a.date || '');
        if (dComp !== 0) return dComp;
        return (b.time || '').localeCompare(a.time || '');
      });
  },

  // ACTIVITY LOGS
  async saveActivityLog(log: Omit<ActivityLog, 'activity_id' | 'date' | 'time' | 'created_at'>): Promise<ActivityLog> {
    const newLog: Partial<ActivityLog> = {
      ...log,
      activity_id: generateId(),
      date: formatDate(new Date()),
      time: formatTime(new Date()),
      created_at: new Date().toISOString()
    };
    const result = await fetchSheet<ActivityLog>('saveActivity', 'POST', newLog);
    return result;
  },

  async getActivityLogs(userId: string): Promise<ActivityLog[]> {
    const logs = await fetchSheet<ActivityLog[]>('getActivityLogs', 'GET');
    return logs.filter(l => l.user_id === userId);
  }
};

// --- ALERT LOGIC ---

export const AlertService = {
  async saveAlert(alertData: Omit<Alert, 'alert_id' | 'date' | 'time' | 'created_at'>): Promise<Alert> {
    const newAlert: Partial<Alert> = {
      ...alertData,
      alert_id: generateId(),
      date: formatDate(new Date()),
      time: formatTime(new Date()),
      created_at: new Date().toISOString()
    };
    return await fetchSheet<Alert>('saveAlert', 'POST', newAlert);
  },

  async checkRiskPatterns(userId: string): Promise<{ trigger: boolean; reason: string | null }> {
    const logs = await DataService.getMoodLogs(userId);
    if (logs.length < 3) return { trigger: false, reason: null };

    // Check for last 3 mood scores 1 or below
    const recent3 = logs.slice(0, 3);
    const risk = recent3.every(l => l.mood_score <= 1);
    
    if (risk) {
      const reason = 'Last 3 mood entries were low (Sad or Very Sad)';
      const summary = recent3.map(l => `${l.mood_label} (${l.date})`).join(', ');
      
      await this.saveAlert({
        user_id: userId,
        trigger_reason: reason,
        recent_mood_summary: summary,
        parent_notified: true,
        notification_status: 'Sent'
      });

      return { trigger: true, reason };
    }

    return { trigger: false, reason: null };
  },

  async triggerManualSupportNotification(userId: string) {
    const user = DataService.getCurrentUser();
    if (!user) return false;

    await this.saveAlert({
      user_id: userId,
      trigger_reason: 'User manually requested support',
      recent_mood_summary: 'Manual trigger',
      parent_notified: true,
      notification_status: 'Sent'
    });

    console.log(`[Support Notification] Manual alert sent for ${user.full_name} to ${user.parent_email}`);
    return true;
  }
};
