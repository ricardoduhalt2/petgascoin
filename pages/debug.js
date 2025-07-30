// Debug page to identify the undefined component
import { useState } from 'react';

// Test imports one by one
// import { useWeb3 } from '../src/contexts/Web3Context';

export default function DebugPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page - Step {step}</h1>
      <p>This page is working! Basic React components are fine.</p>
      
      <div className="mt-4">
        <button 
          onClick={() => setStep(step + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Next Step: {step + 1}
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Step 1: Basic React components ✅</p>
        <p>Step 2: Add Web3Context import</p>
        <p>Step 3: Add component imports</p>
        <p>Step 4: Add full functionality</p>
      </div>
    </div>
  );
}