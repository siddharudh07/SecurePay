// Fraud Detection System based on Dataset Features
// This simulates the ML model using the transaction dataset features

export interface TransactionData {
  trans_hour: number;
  trans_day: number;
  trans_month: number;
  trans_year: number;
  category: number; // 0-13 mapped categories
  age: number;
  trans_amount: number;
  state: number; // encoded state
  zip: string;
  upi_number: string;
}

// Category mappings from the dataset
export const CATEGORY_MAPPINGS = {
  0: "Entertainment",
  1: "Food Dining", 
  2: "Gas Transport",
  3: "Grocery Net",
  4: "Grocery POS",
  5: "Health Fitness",
  6: "Home",
  7: "Kids Pets",
  8: "Misc Net",
  9: "Misc POS",
  10: "Personal Care",
  11: "Shopping Net",
  12: "Shopping POS",
  13: "Travel"
};

// Risk factors based on real fraud patterns
const RISK_FACTORS = {
  // High-risk transaction categories
  HIGH_RISK_CATEGORIES: [0, 11, 12, 13], // Entertainment, Shopping, Travel
  
  // Suspicious amount ranges
  LOW_AMOUNT_THRESHOLD: 100,
  HIGH_AMOUNT_THRESHOLD: 50000,
  
  // Time-based risks
  HIGH_RISK_HOURS: [0, 1, 2, 3, 4, 5, 22, 23], // Late night/early morning
  
  // Age-based risks
  HIGH_RISK_AGES: { min: 18, max: 25 }, // Young adults higher risk
  
  // Geographic risk multipliers
  HIGH_RISK_STATES: [0, 1, 2], // Encoded high-risk states
};

export function calculateFraudRisk(transaction: TransactionData): {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskFactors: string[];
  isFraud: boolean;
} {
  let riskScore = 0;
  const riskFactors: string[] = [];

  // 1. Category-based risk (30% weight)
  if (RISK_FACTORS.HIGH_RISK_CATEGORIES.includes(transaction.category)) {
    riskScore += 0.3;
    const categoryName = CATEGORY_MAPPINGS[transaction.category as keyof typeof CATEGORY_MAPPINGS];
    riskFactors.push(`High-risk category: ${categoryName} - This category has historically higher fraud rates (+30% risk)`);
  }

  // 2. Amount-based risk (25% weight)
  if (transaction.trans_amount < RISK_FACTORS.LOW_AMOUNT_THRESHOLD) {
    riskScore += 0.1;
    riskFactors.push(`Low amount: ₹${transaction.trans_amount} - Amounts below ₹${RISK_FACTORS.LOW_AMOUNT_THRESHOLD} may indicate card testing (+10% risk)`);
  } else if (transaction.trans_amount > RISK_FACTORS.HIGH_AMOUNT_THRESHOLD) {
    riskScore += 0.25;
    riskFactors.push(`High amount: ₹${transaction.trans_amount.toLocaleString()} - Large transactions above ₹${RISK_FACTORS.HIGH_AMOUNT_THRESHOLD.toLocaleString()} require extra verification (+25% risk)`);
  }

  // 3. Time-based risk (20% weight)
  if (RISK_FACTORS.HIGH_RISK_HOURS.includes(transaction.trans_hour)) {
    riskScore += 0.2;
    const timeStr = `${transaction.trans_hour.toString().padStart(2, '0')}:00`;
    riskFactors.push(`Suspicious timing: ${timeStr} - Transactions between 10 PM - 6 AM have higher fraud rates (+20% risk)`);
  }

  // 4. Age-based risk (15% weight)
  if (transaction.age >= RISK_FACTORS.HIGH_RISK_AGES.min && 
      transaction.age <= RISK_FACTORS.HIGH_RISK_AGES.max) {
    riskScore += 0.15;
    riskFactors.push(`Age factor: ${transaction.age} years - Age group ${RISK_FACTORS.HIGH_RISK_AGES.min}-${RISK_FACTORS.HIGH_RISK_AGES.max} shows higher fraud involvement (+15% risk)`);
  }

  // 5. Geographic risk (10% weight)
  if (RISK_FACTORS.HIGH_RISK_STATES.includes(transaction.state)) {
    riskScore += 0.1;
    riskFactors.push(`Geographic risk: High-risk region detected - This location has elevated fraud activity (+10% risk)`);
  }

  // Add positive factors for low-risk transactions
  if (riskFactors.length === 0 || riskScore < 0.3) {
    const positiveFactors: string[] = [];
    
    // Safe category
    if (!RISK_FACTORS.HIGH_RISK_CATEGORIES.includes(transaction.category)) {
      const categoryName = CATEGORY_MAPPINGS[transaction.category as keyof typeof CATEGORY_MAPPINGS];
      positiveFactors.push(`✓ Safe category: ${categoryName} - Low fraud risk category`);
    }
    
    // Normal amount
    if (transaction.trans_amount >= RISK_FACTORS.LOW_AMOUNT_THRESHOLD && 
        transaction.trans_amount <= RISK_FACTORS.HIGH_AMOUNT_THRESHOLD) {
      positiveFactors.push(`✓ Normal amount: ₹${transaction.trans_amount.toLocaleString()} - Within typical transaction range`);
    }
    
    // Safe timing
    if (!RISK_FACTORS.HIGH_RISK_HOURS.includes(transaction.trans_hour)) {
      const timeStr = `${transaction.trans_hour.toString().padStart(2, '0')}:00`;
      positiveFactors.push(`✓ Safe timing: ${timeStr} - Transaction during normal business hours`);
    }
    
    // Safe age group
    if (transaction.age < RISK_FACTORS.HIGH_RISK_AGES.min || 
        transaction.age > RISK_FACTORS.HIGH_RISK_AGES.max) {
      positiveFactors.push(`✓ Low-risk age: ${transaction.age} years - Age group with lower fraud rates`);
    }
    
    // Safe location
    if (!RISK_FACTORS.HIGH_RISK_STATES.includes(transaction.state)) {
      positiveFactors.push(`✓ Safe location: Low-risk geographic region`);
    }
    
    // Add positive factors to risk factors array for display
    riskFactors.push(...positiveFactors);
  }

  // Normalize risk score to 0-1 range
  riskScore = Math.min(riskScore, 1);

  // Determine risk level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  if (riskScore < 0.3) {
    riskLevel = 'LOW';
  } else if (riskScore < 0.7) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'HIGH';
  }

  // Determine if transaction is fraud (threshold at 0.5)
  const isFraud = riskScore >= 0.5;

  return {
    riskScore,
    riskLevel,
    riskFactors,
    isFraud
  };
}

// Generate mock transaction for testing
export function generateMockTransaction(): TransactionData {
  const now = new Date();
  return {
    trans_hour: now.getHours(),
    trans_day: now.getDate(),
    trans_month: now.getMonth() + 1,
    trans_year: now.getFullYear(),
    category: Math.floor(Math.random() * 14),
    age: Math.floor(Math.random() * 50) + 18,
    trans_amount: Math.floor(Math.random() * 100000) + 50,
    state: Math.floor(Math.random() * 10),
    zip: String(Math.floor(Math.random() * 999999) + 100000),
    upi_number: `test${Math.floor(Math.random() * 10000)}@upi`
  };
}

// Merchant verification based on transaction patterns
export function verifyMerchant(merchantTransactions: TransactionData[]): {
  verificationScore: number;
  status: 'VERIFIED' | 'PENDING' | 'FLAGGED';
  flags: string[];
} {
  let verificationScore = 1.0;
  const flags: string[] = [];

  if (merchantTransactions.length === 0) {
    return {
      verificationScore: 0,
      status: 'PENDING',
      flags: ['No transaction history']
    };
  }

  // Check for suspicious patterns
  const fraudulentTransactions = merchantTransactions.filter(txn => 
    calculateFraudRisk(txn).isFraud
  );

  const fraudRate = fraudulentTransactions.length / merchantTransactions.length;

  if (fraudRate > 0.3) {
    verificationScore -= 0.5;
    flags.push('High fraud rate detected');
  }

  // Check for unusual amount patterns
  const amounts = merchantTransactions.map(txn => txn.trans_amount);
  const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const maxAmount = Math.max(...amounts);

  if (maxAmount > avgAmount * 10) {
    verificationScore -= 0.2;
    flags.push('Unusual transaction amount patterns');
  }

  // Check for time pattern anomalies
  const nightTransactions = merchantTransactions.filter(txn => 
    RISK_FACTORS.HIGH_RISK_HOURS.includes(txn.trans_hour)
  );

  if (nightTransactions.length / merchantTransactions.length > 0.5) {
    verificationScore -= 0.3;
    flags.push('Unusual transaction timing patterns');
  }

  let status: 'VERIFIED' | 'PENDING' | 'FLAGGED';
  if (verificationScore >= 0.7) {
    status = 'VERIFIED';
  } else if (verificationScore >= 0.4) {
    status = 'PENDING';
  } else {
    status = 'FLAGGED';
  }

  return {
    verificationScore,
    status,
    flags
  };
}