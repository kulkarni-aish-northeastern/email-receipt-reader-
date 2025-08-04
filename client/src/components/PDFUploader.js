import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const PDFUploader = ({ onSuccess, onError }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadedFile(file);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await axios.post('/api/upload-receipt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onSuccess(response.data);
      setUploadedFile(null);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to upload PDF';
      onError(errorMessage);
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  }, [onSuccess, onError]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: uploading
  });

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive && !isDragReject
            ? 'border-primary-400 bg-primary-50'
            : isDragReject
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="h-8 w-8 text-primary-600 mx-auto animate-spin" />
            <div>
              <p className="text-sm font-medium text-gray-900">Processing PDF...</p>
              <p className="text-xs text-gray-500 mt-1">Extracting receipt data</p>
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
            <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isDragActive ? 'Drop the PDF here' : 'Drag & drop a PDF receipt'}
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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="bg-yellow-100 p-1 rounded">
            <FileText className="h-4 w-4 text-yellow-600" />
          </div>
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Supported Receipts</p>
            <p>Works best with receipts from: Walmart, Target, Costco, Amazon, Starbucks, McDonald's, and other major retailers.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFUploader; 