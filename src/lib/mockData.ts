// Mock data generator using the dataset structure
import { generateMockTransaction, calculateFraudRisk, CATEGORY_MAPPINGS } from './fraudDetection';
import { loadCSV } from './utils';

// Define types for our dataset
interface TransactionDataRow {
  trans_hour: string;
  trans_day: string;
  trans_month: string;
  trans_year: string;
  category: string;
  upi_number: string;
  age: string;
  trans_amount: string;
  state: string;
  zip: string;
  fraud_risk: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  state: string;
  age: number;
  bankAccount: string;
  status: 'Active' | 'Suspended';
  riskScore: number;
  joinDate: string;
}

export interface Merchant {
  id: number;
  businessName: string;
  ownerName: string;
  businessType: string;
  mobile: string;
  email: string;
  state: string;
  verificationStatus: 'Verified' | 'Pending' | 'Flagged';
  fraudScore: number;
  totalTransactions: number;
  monthlyVolume: string;
  joinDate: string;
  upiNumber: string;
}

export interface Transaction {
  id: string;
  timestamp: string;
  amount: number;
  category: string;
  merchant: string;
  customerAge: number;
  state: string;
  fraudRisk: number;
  status: 'Success' | 'Flagged' | 'Blocked';
  upiNumber: string;
  riskFactors?: string[];
}

// Indian states mapping from dataset codes to names
const STATE_MAPPINGS: Record<string, string> = {
  '0': 'Andhra Pradesh',
  '1': 'Arunachal Pradesh',
  '2': 'Assam',
  '3': 'Bihar',
  '4': 'Chhattisgarh',
  '5': 'Goa',
  '6': 'Gujarat',
  '7': 'Haryana',
  '8': 'Himachal Pradesh',
  '9': 'Jharkhand',
  '10': 'Karnataka',
  '11': 'Kerala',
  '12': 'Madhya Pradesh',
  '13': 'Maharashtra',
  '14': 'Manipur',
  '15': 'Meghalaya',
  '16': 'Mizoram',
  '17': 'Nagaland',
  '18': 'Odisha',
  '19': 'Punjab',
  '20': 'Rajasthan',
  '21': 'Sikkim',
  '22': 'Tamil Nadu',
  '23': 'Telangana',
  '24': 'Tripura',
  '25': 'Uttar Pradesh',
  '26': 'Uttarakhand',
  '27': 'West Bengal',
  '28': 'Andaman and Nicobar Islands',
  '29': 'Chandigarh',
  '30': 'Dadra and Nagar Haveli and Daman and Diu',
  '31': 'Lakshadweep',
  '32': 'Delhi',
  '33': 'Puducherry',
  '34': 'Jammu and Kashmir',
  '35': 'Ladakh'
};

// Business types mapping from category codes
const BUSINESS_TYPES: Record<string, string> = {
  '0': 'Entertainment',
  '1': 'Food Dining',
  '2': 'Gas Transport',
  '3': 'Grocery Net',
  '4': 'Grocery POS',
  '5': 'Health Fitness',
  '6': 'Home',
  '7': 'Kids Pets',
  '8': 'Misc Net',
  '9': 'Misc POS',
  '10': 'Personal Care',
  '11': 'Shopping Net',
  '12': 'Shopping POS',
  '13': 'Travel'
};

// Store loaded dataset
let transactionData: TransactionDataRow[] = [];

// Load dataset on module initialization
loadCSV('/transaction_dataset_1000_rows.csv').then(data => {
  transactionData = data as unknown as TransactionDataRow[];
  console.log(`Loaded ${transactionData.length} transactions from dataset`);
});

// Indian states for realistic data
const INDIAN_STATES = [
  'Maharashtra', 'Delhi', 'Gujarat', 'Karnataka', 'Tamil Nadu',
  'Uttar Pradesh', 'West Bengal', 'Rajasthan', 'Telangana', 'Punjab',
  'Haryana', 'Kerala', 'Odisha', 'Bihar', 'Jharkhand'
];

const BUSINESS_TYPES_LIST = [
  'Restaurant', 'Grocery Store', 'Electronics', 'Clothing', 'Pharmacy',
  'Gas Station', 'Hotel', 'Travel Agency', 'Education', 'Healthcare',
  'Entertainment', 'Real Estate', 'Automotive', 'Beauty Salon'
];

const BANKS = [
  'SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'IndusInd', 'Yes Bank', 'BOB', 'Canara'
];

// Generate realistic names
const FIRST_NAMES = [
  'Rajesh', 'Priya', 'Amit', 'Neha', 'Suresh', 'Kavya', 'Vikram', 'Shreya',
  'Ravi', 'Pooja', 'Arun', 'Meera', 'Sandeep', 'Divya', 'Manoj', 'Rekha'
];

const LAST_NAMES = [
  'Kumar', 'Sharma', 'Patel', 'Singh', 'Reddy', 'Gupta', 'Agarwal', 'Jain',
  'Shah', 'Rao', 'Nair', 'Iyer', 'Chopra', 'Bansal', 'Mittal', 'Sinha'
];

function getRandomName(): string {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
}

function getRandomEmail(name: string): string {
  const cleanName = name.toLowerCase().replace(/\s+/g, '.');
  const domains = ['gmail.com', 'email.com', 'yahoo.com', 'outlook.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${cleanName}@${domain}`;
}

function getRandomMobile(): string {
  const number = Math.floor(Math.random() * 900000000) + 6000000000;
  return `+91-${number.toString().slice(0, 5)}-${number.toString().slice(5)}`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
}

export function generateMockUsers(count: number): User[] {
  const users: User[] = [];
  
  for (let i = 1; i <= count; i++) {
    const name = getRandomName();
    const age = Math.floor(Math.random() * 50) + 18;
    const riskScore = Math.random();
    const status = riskScore > 0.7 ? 'Suspended' : 'Active';
    const bank = BANKS[Math.floor(Math.random() * BANKS.length)];
    const accountNumber = Math.floor(Math.random() * 9000) + 1000;
    
    users.push({
      id: i,
      name,
      email: getRandomEmail(name),
      mobile: getRandomMobile(),
      state: INDIAN_STATES[Math.floor(Math.random() * INDIAN_STATES.length)],
      age,
      bankAccount: `${bank}-****${accountNumber}`,
      status,
      riskScore,
      joinDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
    });
  }
  
  return users;
}

export function generateRealMerchants(): Merchant[] {
  // Create a map to store unique merchants by UPI number
  const merchantMap = new Map<string, Merchant>();
  
  // Process transaction data to extract merchant information
  transactionData.forEach((row, index) => {
    const upiNumber = row.upi_number;
    
    // If we haven't seen this merchant before, create a new entry
    if (!merchantMap.has(upiNumber)) {
      const ownerName = getRandomName();
      const businessType = BUSINESS_TYPES[row.category] || 'General Merchant';
      const businessName = `${ownerName.split(' ')[0]} ${businessType} Merchant`;
      
      // Calculate fraud score based on transaction data for this merchant
      const merchantTransactions = transactionData.filter(txn => txn.upi_number === upiNumber);
      const fraudCount = merchantTransactions.filter(txn => txn.fraud_risk === '1').length;
      const fraudScore = merchantTransactions.length > 0 ? fraudCount / merchantTransactions.length : 0;
      
      let verificationStatus: 'Verified' | 'Pending' | 'Flagged';
      if (fraudScore < 0.3) {
        verificationStatus = 'Verified';
      } else if (fraudScore < 0.6) {
        verificationStatus = 'Pending';
      } else {
        verificationStatus = 'Flagged';
      }
      
      const totalTransactions = merchantTransactions.length;
      // Calculate monthly volume as sum of all transactions for this merchant
      const monthlyVolume = merchantTransactions.reduce((sum, txn) => sum + parseFloat(txn.trans_amount), 0);
      
      merchantMap.set(upiNumber, {
        id: merchantMap.size + 1,
        businessName,
        ownerName,
        businessType,
        mobile: getRandomMobile(),
        email: getRandomEmail(businessName),
        state: STATE_MAPPINGS[row.state] || 'Unknown',
        verificationStatus,
        fraudScore,
        totalTransactions,
        monthlyVolume: formatCurrency(monthlyVolume),
        joinDate: new Date(
          parseInt(row.trans_year),
          parseInt(row.trans_month) - 1,
          parseInt(row.trans_day)
        ).toISOString().split('T')[0],
        upiNumber
      });
    }
  });
  
  return Array.from(merchantMap.values());
}

export function generateMockMerchants(count: number): Merchant[] {
  // Use real merchants if we have transaction data, otherwise generate mock data
  if (transactionData.length > 0) {
    const realMerchants = generateRealMerchants();
    // Return up to 'count' merchants
    return realMerchants.slice(0, count);
  }
  
  const merchants: Merchant[] = [];
  
  for (let i = 1; i <= count; i++) {
    const ownerName = getRandomName();
    const businessType = BUSINESS_TYPES_LIST[Math.floor(Math.random() * BUSINESS_TYPES_LIST.length)];
    const businessName = `${ownerName.split(' ')[0]} ${businessType}`;
    const fraudScore = Math.random();
    const totalTransactions = Math.floor(Math.random() * 5000) + 10;
    const monthlyVolume = Math.floor(Math.random() * 10000000) + 50000;
    
    let verificationStatus: 'Verified' | 'Pending' | 'Flagged';
    if (fraudScore < 0.3) {
      verificationStatus = 'Verified';
    } else if (fraudScore < 0.6) {
      verificationStatus = 'Pending';
    } else {
      verificationStatus = 'Flagged';
    }
    
    merchants.push({
      id: i,
      businessName,
      ownerName,
      businessType,
      mobile: getRandomMobile(),
      email: getRandomEmail(businessName),
      state: INDIAN_STATES[Math.floor(Math.random() * INDIAN_STATES.length)],
      verificationStatus,
      fraudScore,
      totalTransactions,
      monthlyVolume: formatCurrency(monthlyVolume),
      joinDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      upiNumber: `merchant${i}@upi`
    });
  }
  
  return merchants;
}

export function generateRealTransactions(): Transaction[] {
  // Get real merchants first
  const realMerchants = generateRealMerchants();
  const merchantMap = new Map<string, Merchant>();
  realMerchants.forEach(merchant => {
    merchantMap.set(merchant.upiNumber, merchant);
  });
  
  // Convert transaction data to Transaction objects
  const transactions: Transaction[] = transactionData.map((row, index) => {
    // Find merchant for this transaction
    const merchant = merchantMap.get(row.upi_number) || realMerchants[0];
    
    // Create timestamp from transaction data
    const timestamp = new Date(
      parseInt(row.trans_year),
      parseInt(row.trans_month) - 1,
      parseInt(row.trans_day),
      parseInt(row.trans_hour)
    ).toISOString();
    
    // Determine status based on fraud risk
    let status: 'Success' | 'Flagged' | 'Blocked';
    if (row.fraud_risk === '1') {
      status = Math.random() > 0.5 ? 'Flagged' : 'Blocked';
    } else {
      status = 'Success';
    }
    
    return {
      id: `TXN${String(index + 1).padStart(6, '0')}`,
      timestamp,
      amount: parseFloat(row.trans_amount),
      category: BUSINESS_TYPES[row.category] || 'General',
      merchant: merchant.businessName,
      customerAge: parseInt(row.age),
      state: STATE_MAPPINGS[row.state] || 'Unknown',
      fraudRisk: parseInt(row.fraud_risk),
      status,
      upiNumber: row.upi_number
    };
  });
  
  // Sort by timestamp (newest first)
  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function generateMockTransactions(count: number): Transaction[] {
  // Use real transactions if we have transaction data, otherwise generate mock data
  if (transactionData.length > 0) {
    const realTransactions = generateRealTransactions();
    // Return up to 'count' transactions
    return realTransactions.slice(0, count);
  }
  
  const transactions: Transaction[] = [];
  const merchants = generateMockMerchants(20);
  
  for (let i = 1; i <= count; i++) {
    const mockTxn = generateMockTransaction();
    const riskAnalysis = calculateFraudRisk(mockTxn);
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    
    // Generate realistic timestamp
    const now = new Date();
    const pastDate = new Date(now.getTime() - (Math.random() * 30 * 24 * 60 * 60 * 1000)); // Last 30 days
    pastDate.setHours(mockTxn.trans_hour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
    
    let status: 'Success' | 'Flagged' | 'Blocked';
    if (riskAnalysis.riskScore < 0.3) {
      status = 'Success';
    } else if (riskAnalysis.riskScore < 0.7) {
      status = 'Flagged';
    } else {
      status = 'Blocked';
    }
    
    transactions.push({
      id: `TXN${String(i).padStart(3, '0')}`,
      timestamp: pastDate.toISOString(),
      amount: mockTxn.trans_amount,
      category: CATEGORY_MAPPINGS[mockTxn.category as keyof typeof CATEGORY_MAPPINGS],
      merchant: merchant.businessName,
      customerAge: mockTxn.age,
      state: INDIAN_STATES[mockTxn.state % INDIAN_STATES.length],
      fraudRisk: riskAnalysis.isFraud ? 1 : 0,
      status,
      upiNumber: mockTxn.upi_number,
      riskFactors: riskAnalysis.riskFactors
    });
  }
  
  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Analytics functions
export function getTransactionAnalytics(transactions: Transaction[]) {
  const total = transactions.length;
  const fraudulent = transactions.filter(t => t.fraudRisk === 1).length;
  const legitimate = total - fraudulent;
  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
  const fraudVolume = transactions.filter(t => t.fraudRisk === 1).reduce((sum, t) => sum + t.amount, 0);
  
  // Category-wise fraud analysis
  const categoryStats = Object.values(CATEGORY_MAPPINGS).map(category => {
    const categoryTxns = transactions.filter(t => t.category === category);
    const fraudCount = categoryTxns.filter(t => t.fraudRisk === 1).length;
    return {
      category,
      total: categoryTxns.length,
      fraudulent: fraudCount,
      fraudRate: categoryTxns.length > 0 ? (fraudCount / categoryTxns.length * 100) : 0
    };
  });
  
  return {
    total,
    legitimate,
    fraudulent,
    fraudRate: (fraudulent / total * 100),
    totalVolume: formatCurrency(totalVolume),
    fraudVolume: formatCurrency(fraudVolume),
    categoryStats: categoryStats.sort((a, b) => b.fraudRate - a.fraudRate)
  };
}