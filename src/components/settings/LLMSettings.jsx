// src/components/settings/LLMSettings.jsx
import React, { useState, useEffect } from 'react';
import { llmService, LLM_PROVIDERS } from '../../services/llmservice.jsx';

function LLMSettings() {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState(LLM_PROVIDERS.OPENROUTER);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('brahma_llm_key');
    const savedProvider = localStorage.getItem('brahma_llm_provider');

    if (savedKey) {
      setApiKey(savedKey);
      setProvider(savedProvider || LLM_PROVIDERS.OPENROUTER);
      llmService.initialize(savedKey, savedProvider || LLM_PROVIDERS.OPENROUTER);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('brahma_llm_key', apiKey);
    localStorage.setItem('brahma_llm_provider', provider);
    llmService.initialize(apiKey, provider);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    llmService.initialize(apiKey, provider);

    try {
      const response = await llmService.sendMessage(
        "Hello! This is a test message. Please respond briefly to confirm you're working.",
        { systemPrompt: 'You are a helpful assistant. Respond briefly.', conversationHistory: [] },
        { maxTokens: 50 },
      );
      setTestResult({
        success: response.success,
        message: response.success ? response.content : response.error,
      });
    } catch (e) {
      setTestResult({ success: false, message: e.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">LLM Configuration</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
          >
            <option value={LLM_PROVIDERS.OPENROUTER}>OpenRouter (Recommended)</option>
            <option value={LLM_PROVIDERS.GROQ}>Groq (Fast)</option>
            <option value={LLM_PROVIDERS.ANTHROPIC}>Anthropic Direct</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`Enter your ${provider} API key`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={!apiKey}
            className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-150"
          >
            {saved ? '✓ Saved!' : 'Save Configuration'}
          </button>

          <button
            onClick={handleTest}
            disabled={!apiKey || testing}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-150"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        {testResult && (
          <div
            className={`p-4 rounded-lg mt-4 ${
              testResult.success
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <p className="font-bold mb-2">
              {testResult.success ? '✓ Connection Success!' : '✗ Connection Error'}
            </p>
            <p className="text-sm italic">{testResult.message}</p>
          </div>
        )}

        <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800 mt-4 border border-yellow-200">
          <p className="font-medium mb-1">💡 Cost Estimate</p>
          <p>This service allows you to use powerful, state-of-the-art models.</p>
          <p>Cost is typically <strong>$0.01 - $0.05 per conversation</strong>.</p>
        </div>
      </div>
    </div>
  );
}

export default LLMSettings;