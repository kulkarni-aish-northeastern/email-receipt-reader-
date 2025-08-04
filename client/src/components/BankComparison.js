import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, TrendingUp, TrendingDown, RefreshCw, X } from 'lucide-react';
import axios from 'axios';

const BankComparison = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadedFile(file);

    const formData = new FormData();
    formData.append('csv', file);

    try {
      const response = await axios.post('/api/upload-bank-statement', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(response.data.message);
      setUploadedFile(null);
      fetchComparison(); // Refresh comparison data
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to upload CSV';
      setError(errorMessage);
      setUploadedFile(null);
      setTimeout(() => setError(null), 5000);
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false,
    disabled: uploading
  });

  const fetchComparison = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/compare-transactions');
      setComparison(response.data);
    } catch (err) {
      setError('Failed to fetch comparison data');
      console.error('Error fetching comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };



  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bank Statement Comparison</h2>
          <p className="text-gray-600">Upload CSV bank statements and compare with your ledger</p>
        </div>
        <button
          onClick={fetchComparison}
          disabled={loading}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-success-50 border border-success-200 rounded-lg p-4 animate-fade-in">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-success-500" />
            <p className="text-success-800">{success}</p>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Upload className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Upload Bank Statement</h3>
            <p className="text-sm text-gray-500">Upload a CSV file with your bank transactions</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
              ${isDragActive && !isDragReject
                ? 'border-blue-400 bg-blue-50'
                : isDragReject
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }
              ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            {uploading ? (
              <div className="space-y-3">
                <Loader2 className="h-8 w-8 text-blue-600 mx-auto animate-spin" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Processing CSV...</p>
                  <p className="text-xs text-gray-500 mt-1">Importing transactions</p>
                </div>
              </div>
            ) : uploadedFile ? (
              <div className="space-y-3">
                <CheckCircle className="h-8 w-8 text-success-600 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Ready to process</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {isDragActive ? 'Drop the CSV here' : 'Drag & drop a CSV bank statement'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    or click to browse files
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* File Info */}
          {uploadedFile && !uploading && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-1 rounded">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">CSV Format Requirements</p>
                <p>Your CSV should have columns: Date, Description, Amount. We'll automatically detect common formats.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{comparison.matches.length}</p>
                  <p className="text-sm text-gray-500">Matching Transactions</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{comparison.ledger_only.length}</p>
                  <p className="text-sm text-gray-500">Ledger Only</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-3 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{comparison.bank_only.length}</p>
                  <p className="text-sm text-gray-500">Bank Only</p>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Matches */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Matches</h3>
                  <p className="text-sm text-gray-500">{comparison.matches.length} transactions</p>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {comparison.matches.map((match, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">
                        {match.ledger.merchant}
                      </span>
                      <span className="text-sm font-bold text-green-800">
                        {formatCurrency(match.ledger.amount)}
                      </span>
                    </div>
                    <div className="text-xs text-green-600">
                      {formatDate(match.ledger.date)} • {match.bank.description}
                    </div>
                  </div>
                ))}
                {comparison.matches.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No matching transactions found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ledger Only */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Ledger Only</h3>
                  <p className="text-sm text-gray-500">{comparison.ledger_only.length} transactions</p>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {comparison.ledger_only.map((item, index) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-yellow-800">
                        {item.merchant}
                      </span>
                      <span className="text-sm font-bold text-yellow-800">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    <div className="text-xs text-yellow-600">
                      {formatDate(item.date)} • {item.category}
                    </div>
                  </div>
                ))}
                {comparison.ledger_only.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No ledger-only transactions</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bank Only */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-red-100 p-2 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Bank Only</h3>
                  <p className="text-sm text-gray-500">{comparison.bank_only.length} transactions</p>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {comparison.bank_only.map((item, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-red-800">
                        {item.description}
                      </span>
                      <span className="text-sm font-bold text-red-800">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    <div className="text-xs text-red-600">
                      {formatDate(item.date)} • {item.type}
                    </div>
                  </div>
                ))}
                {comparison.bank_only.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingDown className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No bank-only transactions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading comparison data...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankComparison; 