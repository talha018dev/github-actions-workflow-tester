"use client";

import { IconCheck, IconCopy, IconX, IconRefresh } from "@tabler/icons-react";
import { useState } from "react";

export default function TestAgoraPage() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  
  const testConfig = async () => {
    setStatus('testing');
    try {
      // Test the token API
      const response = await fetch('/api/agora/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelName: 'test-channel',
          uid: 'test-user',
        }),
      });
      
      const data = await response.json();
      setResult(data);
      setStatus(data.error ? 'error' : 'success');
    } catch (error) {
      setResult({ error: String(error) });
      setStatus('error');
    }
  };
  
  const copyEnvTemplate = () => {
    navigator.clipboard.writeText(`NEXT_PUBLIC_AGORA_APP_ID=your_app_id_here
AGORA_APP_CERTIFICATE=your_certificate_here`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-rose-950/20 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Agora Configuration Test</h1>
        <p className="text-gray-400 mb-8">Verify your Agora setup for video calling</p>
        
        {/* Current Status */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold mb-4">Environment Variables</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300">NEXT_PUBLIC_AGORA_APP_ID</span>
              {appId ? (
                <span className="flex items-center gap-2 text-emerald-400">
                  <IconCheck size={16} /> Set ({appId.slice(0, 8)}...)
                </span>
              ) : (
                <span className="flex items-center gap-2 text-red-400">
                  <IconX size={16} /> Not set
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300">AGORA_APP_CERTIFICATE</span>
              <span className="text-amber-400 text-sm">
                (Server-side only - test below)
              </span>
            </div>
          </div>
        </div>
        
        {/* Test Button */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold mb-4">Token Generation Test</h2>
          
          <button
            onClick={testConfig}
            disabled={status === 'testing'}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            {status === 'testing' ? (
              <>Testing...</>
            ) : (
              <><IconRefresh size={18} /> Test Token Generation</>
            )}
          </button>
          
          {result && (
            <div className={`mt-4 p-4 rounded-lg ${status === 'error' ? 'bg-red-500/20 border border-red-500/30' : 'bg-emerald-500/20 border border-emerald-500/30'}`}>
              <pre className="text-sm text-gray-300 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        {/* Instructions */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
          <h2 className="text-amber-300 font-bold mb-4">⚠️ "dynamic use static key" Error?</h2>
          
          <p className="text-gray-300 mb-4">
            This error means your Agora project requires token authentication. You have two options:
          </p>
          
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Option 1: Add Certificate (Recommended)</h3>
              <p className="text-gray-400 text-sm mb-3">
                Add both variables to <code className="text-amber-400">.env.local</code>:
              </p>
              <div className="bg-gray-950 rounded p-3 font-mono text-sm text-gray-300 relative">
                <pre>{`NEXT_PUBLIC_AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_certificate`}</pre>
                <button 
                  onClick={copyEnvTemplate}
                  className="absolute top-2 right-2 p-1 hover:bg-gray-800 rounded"
                >
                  {copied ? <IconCheck size={16} className="text-emerald-400" /> : <IconCopy size={16} className="text-gray-500" />}
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Get certificate from: Agora Console → Project → Config → App certificate
              </p>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Option 2: Disable Token Auth (Quick Testing)</h3>
              <ol className="text-gray-400 text-sm space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://console.agora.io" target="_blank" className="text-blue-400 hover:underline">console.agora.io</a></li>
                <li>Select your project → <strong>Config</strong></li>
                <li>Find <strong>&quot;Primary certificate&quot;</strong></li>
                <li>Click <strong>Actions → Delete</strong> to disable token auth</li>
                <li>Now you only need <code className="text-amber-400">NEXT_PUBLIC_AGORA_APP_ID</code></li>
              </ol>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm mt-4">
            After updating <code>.env.local</code>, restart the dev server: <code className="text-amber-400">npm run dev</code>
          </p>
        </div>
      </div>
    </div>
  );
}

