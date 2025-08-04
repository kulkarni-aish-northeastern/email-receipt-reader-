import React, { useState, useEffect } from 'react';
import { Mail, Shield, Server, Wifi, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const EmailSettings = () => {
  const [settings, setSettings] = useState({
    email: '',
    password: '',
    imap_host: '',
    imap_port: 993
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentSettings, setCurrentSettings] = useState(null);

  useEffect(() => {
    fetchCurrentSettings();
  }, []);

  const fetchCurrentSettings = async () => {
    try {
      const response = await fetch('/api/email-settings');
      const data = await response.json();
      if (data.email) {
        setCurrentSettings(data);
        setSettings({
          email: data.email,
          password: '••••••••',
          imap_host: data.imap_host,
          imap_port: data.imap_port
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/email-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Email settings saved successfully!' });
        fetchCurrentSettings();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save email settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/test-email-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Email connection successful!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Connection failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to test connection' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleProcessEmails = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/process-emails', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Email processing started! Check your receipts.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to process emails' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to process emails' });
    } finally {
      setIsLoading(false);
    }
  };

  const presetProviders = [
    { name: 'Gmail', host: 'imap.gmail.com', port: 993 },
    { name: 'Outlook', host: 'outlook.office365.com', port: 993 },
    { name: 'Yahoo', host: 'imap.mail.yahoo.com', port: 993 },
    { name: 'iCloud', host: 'imap.mail.me.com', port: 993 },
  ];

  const selectProvider = (provider) => {
    setSettings(prev => ({
      ...prev,
      imap_host: provider.host,
      imap_port: provider.port
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Email Integration</h1>
              <p className="text-blue-100">Automatically process receipts from your email</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Current Status */}
          {currentSettings && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">Email integration is active</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Connected to {currentSettings.email} via {currentSettings.imap_host}
              </p>
            </div>
          )}

          {/* Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Email Settings Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Provider Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quick Setup - Select Your Email Provider
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {presetProviders.map((provider) => (
                  <button
                    key={provider.name}
                    type="button"
                    onClick={() => selectProvider(provider)}
                    className="p-3 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm font-medium"
                  >
                    {provider.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="your-email@gmail.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password or App Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={settings.password}
                  onChange={(e) => setSettings(prev => ({ ...prev, password: e.target.value }))}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                For Gmail, use an App Password if 2FA is enabled
              </p>
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-1">Gmail Setup Instructions:</p>
                <ol className="text-xs text-blue-700 space-y-1">
                  <li>1. Enable 2-Factor Authentication in Google Account</li>
                  <li>2. Generate App Password: Security → 2-Step Verification → App passwords</li>
                  <li>3. Select "Mail" app and use the generated password</li>
                  <li>4. Enable IMAP in Gmail settings</li>
                </ol>
              </div>
            </div>

            {/* IMAP Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IMAP Host
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Server className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={settings.imap_host}
                    onChange={(e) => setSettings(prev => ({ ...prev, imap_host: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="imap.gmail.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IMAP Port
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Wifi className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={settings.imap_port}
                    onChange={(e) => setSettings(prev => ({ ...prev, imap_port: parseInt(e.target.value) }))}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="993"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isTesting ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Wifi className="h-5 w-5" />
                )}
                <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
                <span>{isLoading ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>

          {/* Manual Processing */}
          {currentSettings && (
            <div className="mt-8 p-6 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Manual Email Processing</h3>
              <p className="text-gray-600 mb-4">
                Click the button below to manually process emails and extract receipts.
              </p>
              <button
                onClick={handleProcessEmails}
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
                <span>Process Emails Now</span>
              </button>
            </div>
          )}

                     {/* Information */}
           <div className="mt-8 p-6 bg-blue-50 rounded-xl">
             <h3 className="text-lg font-semibold text-blue-900 mb-3">How It Works</h3>
             <div className="space-y-3 text-blue-800">
               <div className="flex items-start space-x-3">
                 <div className="bg-blue-200 rounded-full p-1 mt-0.5">
                   <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                 </div>
                 <p>Automatically checks your email every 5 minutes for new PDF receipts</p>
               </div>
               <div className="flex items-start space-x-3">
                 <div className="bg-blue-200 rounded-full p-1 mt-0.5">
                   <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                 </div>
                 <p>Extracts receipt data and adds it to your ledger</p>
               </div>
               <div className="flex items-start space-x-3">
                 <div className="bg-blue-200 rounded-full p-1 mt-0.5">
                   <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                 </div>
                 <p>Works alongside manual uploads - you can use both methods</p>
               </div>
             </div>
           </div>

           {/* Troubleshooting */}
           <div className="mt-6 p-6 bg-yellow-50 rounded-xl">
             <h3 className="text-lg font-semibold text-yellow-900 mb-3">Troubleshooting</h3>
             <div className="space-y-3 text-yellow-800">
               <div className="flex items-start space-x-3">
                 <div className="bg-yellow-200 rounded-full p-1 mt-0.5">
                   <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                 </div>
                 <p><strong>Gmail:</strong> Use App Password, not your regular password</p>
               </div>
               <div className="flex items-start space-x-3">
                 <div className="bg-yellow-200 rounded-full p-1 mt-0.5">
                   <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                 </div>
                 <p><strong>Outlook:</strong> May need to enable "Less secure app access"</p>
               </div>
               <div className="flex items-start space-x-3">
                 <div className="bg-yellow-200 rounded-full p-1 mt-0.5">
                   <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                 </div>
                 <p><strong>Yahoo:</strong> Generate an app-specific password</p>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings; 