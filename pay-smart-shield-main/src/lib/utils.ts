import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse CSV string into array of objects
 * @param csvString CSV content as string
 * @returns Array of objects with CSV data
 */
export function parseCSV(csvString: string): Record<string, string>[] {
  const lines = csvString.trim().split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(value => value.trim());
    const obj: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    
    return obj;
  });
}

/**
 * Load CSV file and parse its content
 * @param filePath Path to the CSV file
 * @returns Promise resolving to parsed CSV data
 */
export async function loadCSV(filePath: string): Promise<Record<string, string>[]> {
  try {
    const response = await fetch(filePath);
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error('Error loading CSV file:', error);
    return [];
  }
}

/**
 * Parse a UPI QR/intent string into components.
 * Supports formats like:
 * - upi://pay?pa=merchant@upi&pn=Name&am=123.45&cu=INR&tn=Note
 * - UPI ID directly like merchant@upi
 */
export function parseUpiPayload(payload: string): {
  upiId: string | null;
  amount: string | null;
  params: Record<string, string>;
} {
  const clean = (payload || '').trim();
  const result: { upiId: string | null; amount: string | null; params: Record<string, string> } = {
    upiId: null,
    amount: null,
    params: {}
  };

  // If plain UPI ID
  if (/^[a-zA-Z0-9_.\-]+@\w+$/i.test(clean)) {
    result.upiId = clean;
    return result;
  }

  try {
    // Normalize to URL for query parsing
    const uri = clean.startsWith('upi://') ? clean : `upi://pay?${clean}`;
    const url = new URL(uri);
    const searchParams = url.searchParams;
    searchParams.forEach((value, key) => {
      result.params[key] = value;
    });
    result.upiId = result.params['pa'] || result.params['upi'] || null;
    result.amount = result.params['am'] || null;
  } catch {
    // Fallback: try manual parse of query string
    const query = clean.replace(/^upi:\/\/pay\??/i, '');
    query.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) {
        result.params[decodeURIComponent(k)] = v ? decodeURIComponent(v) : '';
      }
    });
    result.upiId = result.params['pa'] || result.params['upi'] || null;
    result.amount = result.params['am'] || null;
  }

  return result;
}

// Persistent storage helpers for app state
type StoredUser = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  state?: string;
  role: 'admin' | 'user' | 'merchant';
  dateOfBirth?: string;
  age?: number;
  bank?: string;
  address?: string;
  zipCode?: string;
};

type StoredMerchant = {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  mobile: string;
  businessType: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  upiId: string;
};

type StoredTransaction = {
  id: string;
  timestamp: string;
  amount: number;
  category?: string;
  merchantName?: string;
  upiId: string;
  status: 'Success' | 'Flagged' | 'Blocked';
  fraudRisk: number; // 0 legit, 1 fraud
  customerAge?: number;
  customerLocation?: string;
  customerId?: string;
};

const STORAGE_KEYS = {
  users: 'pss_users',
  merchants: 'pss_merchants',
  transactions: 'pss_transactions',
  currentUser: 'pss_current_user'
} as const;

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getCurrentUser(): StoredUser | null {
    return readJSON<StoredUser | null>(STORAGE_KEYS.currentUser, null);
  },
  setCurrentUser(user: StoredUser | null) {
    if (user) writeJSON(STORAGE_KEYS.currentUser, user);
    else localStorage.removeItem(STORAGE_KEYS.currentUser);
  },
  ensureAdminUser() {
    const users = storage.getUsers();
    if (!users.some(u => u.role === 'admin')) {
      const admin: StoredUser = {
        id: 'admin',
        name: 'Admin',
        email: 'admin@system.local',
        mobile: '0000000000',
        role: 'admin'
      };
      storage.saveUsers([admin, ...users]);
    }
  },
  getUsers(): StoredUser[] {
    return readJSON<StoredUser[]>(STORAGE_KEYS.users, []);
  },
  saveUsers(users: StoredUser[]) {
    writeJSON(STORAGE_KEYS.users, users);
  },
  addUser(user: StoredUser) {
    const users = storage.getUsers();
    storage.saveUsers([...
      users,
      user
    ]);
  },
  getMerchants(): StoredMerchant[] {
    return readJSON<StoredMerchant[]>(STORAGE_KEYS.merchants, []);
  },
  saveMerchants(merchants: StoredMerchant[]) {
    writeJSON(STORAGE_KEYS.merchants, merchants);
  },
  addMerchant(merchant: StoredMerchant) {
    const list = storage.getMerchants();
    storage.saveMerchants([...
      list,
      merchant
    ]);
  },
  getTransactions(): StoredTransaction[] {
    return readJSON<StoredTransaction[]>(STORAGE_KEYS.transactions, []);
  },
  saveTransactions(txns: StoredTransaction[]) {
    writeJSON(STORAGE_KEYS.transactions, txns);
  },
  addTransaction(txn: StoredTransaction) {
    const list = storage.getTransactions();
    storage.saveTransactions([txn, ...list]);
  }
};

export type { StoredUser, StoredMerchant, StoredTransaction };
