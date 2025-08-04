import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Receipt, Database, Banknote, Menu, X, Mail } from 'lucide-react';
import axios from 'axios';
import PDFUploader from './components/PDFUploader';
import LedgerTable from './components/LedgerTable';
import BankComparison from './components/BankComparison';
import EmailSettings from './components/EmailSettings';

function App() {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentView, setCurrentView] = useState('receipts'); // 'receipts', 'bank', or 'email'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch ledger data on component mount
  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/ledger');
      setLedger(response.data);
    } catch (err) {
      setError('Failed to fetch ledger data');
      console.error('Error fetching ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (data) => {
    setSuccess('Receipt uploaded and parsed successfully!');
    fetchLedger(); // Refresh the ledger
    setTimeout(() => setSuccess(null), 5000);
  };

  const handleUploadError = (error) => {
    setError(error);
    setTimeout(() => setError(null), 5000);
  };

  const Navigation = () => (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Email Receipt Reader</h1>
              <p className="text-sm text-gray-500">Upload and parse PDF receipts</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setCurrentView('receipts')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'receipts'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Receipt className="h-4 w-4" />
                <span>Receipts</span>
              </div>
            </button>
            <button
              onClick={() => setCurrentView('bank')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'bank'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Banknote className="h-4 w-4" />
                <span>Bank Comparison</span>
              </div>
            </button>
            <button
              onClick={() => setCurrentView('email')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'email'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Email Settings</span>
              </div>
            </button>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Database className="h-4 w-4" />
              <span>{ledger.length} receipts</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => {
                  setCurrentView('receipts');
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'receipts'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Receipt className="h-4 w-4" />
                  <span>Receipts</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setCurrentView('bank');
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'bank'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Banknote className="h-4 w-4" />
                  <span>Bank Comparison</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setCurrentView('email');
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'email'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email Settings</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  const ReceiptsView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-success-50 border border-success-200 rounded-lg p-4 animate-fade-in">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-success-500" />
              <p className="text-success-800">{success}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <Upload className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Upload Receipt</h2>
                  <p className="text-sm text-gray-500">Upload a PDF receipt to parse</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-1 rounded">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Demo Mode</p>
                    <p>For demo purposes, PDFs are manually uploaded instead of being fetched from email.</p>
                  </div>
                </div>
              </div>

              <PDFUploader 
                onSuccess={handleUploadSuccess}
                onError={handleUploadError}
              />
            </div>
          </div>

          {/* Ledger Section */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Database className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Ledger</h2>
                    <p className="text-sm text-gray-500">Parsed receipt data</p>
                  </div>
                </div>
                {loading && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                )}
              </div>

              <LedgerTable 
                ledger={ledger} 
                loading={loading}
                onRefresh={fetchLedger}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Email Receipt Reader - Built with React & Node.js</p>
            <p className="mt-1">Complete solution for receipt management and bank reconciliation</p>
          </div>
        </div>
      </footer>
    </div>
  );

  const BankView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BankComparison />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Email Receipt Reader - Built with React & Node.js</p>
            <p className="mt-1">Complete solution for receipt management and bank reconciliation</p>
          </div>
        </div>
      </footer>
    </div>
  );

  const EmailView = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <Navigation />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmailSettings />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Email Receipt Reader - Built with React & Node.js</p>
            <p className="mt-1">Complete solution for receipt management and bank reconciliation</p>
          </div>
        </div>
      </footer>
    </div>
  );

  return currentView === 'receipts' ? <ReceiptsView /> : currentView === 'bank' ? <BankView /> : <EmailView />;
}

export default App; 