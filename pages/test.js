// Test page to isolate the undefined component issue
import { useState } from 'react';
import Head from 'next/head';

// Test Web3Context import
// import { useWeb3 } from '../src/contexts/Web3Context';

// Test Layout import
// import Layout from '../src/components/Layout';

// Test individual components
// import WalletCard from '../src/components/WalletCard';
// import TokenInfoCard from '../src/components/TokenInfoCard';
// import QuickActionsCard from '../src/components/QuickActionsCard';
// import TransactionsCard from '../src/components/TransactionsCard';

export default function TestPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head>
        <title>Test Page - Debugging</title>
      </Head>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Page - Step {step}</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Component Testing</h2>
          <p className="mb-4">This basic page works! Now testing components step by step...</p>
          
          <button 
            onClick={() => setStep(step + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Next Step: {step + 1}
          </button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Testing Progress:</h3>
          <ul className="text-sm space-y-1">
            <li className="text-green-600">✅ Step 1: Basic React + Next.js</li>
            <li className="text-gray-500">⏳ Step 2: Web3Context import</li>
            <li className="text-gray-500">⏳ Step 3: Layout component</li>
            <li className="text-gray-500">⏳ Step 4: Individual components</li>
            <li className="text-gray-500">⏳ Step 5: Full integration</li>
          </ul>
        </div>
      </div>
    </div>
  );
}