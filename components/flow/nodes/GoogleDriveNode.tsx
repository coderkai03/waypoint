'use client';

import { useState, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { getGoogleWorkspaceClient } from '@/lib/mcp/adapters/googleWorkspaceClient';
import type { GoogleDriveNodeData } from '@/types/flow';

export function GoogleDriveNode(props: NodeProps) {
  const { data, id } = props;
  const nodeData = data as unknown as GoogleDriveNodeData;
  const [fileId, setFileId] = useState(nodeData.fileId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract file ID from Google Drive URL if provided
  const extractFileId = (input: string): string => {
    // Handle various Google Drive URL formats
    const urlPatterns = [
      /\/d\/([a-zA-Z0-9-_]+)/, // Standard share URL
      /id=([a-zA-Z0-9-_]+)/, // URL with id parameter
      /\/file\/d\/([a-zA-Z0-9-_]+)/, // File view URL
    ];

    for (const pattern of urlPatterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // If no URL pattern matches, assume it's already a file ID
    return input.trim();
  };

  const fetchFile = useCallback(async () => {
    if (!fileId.trim()) {
      setError('Please enter a file ID or URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get Google token from Clerk via API route
      const tokenResponse = await fetch('/api/auth/google-token');
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to get Google token. Please ensure you are signed in with Google.');
      }
      const { token } = await tokenResponse.json();
      
      if (!token) {
        throw new Error('No Google token available. Please connect your Google account in Clerk.');
      }
      
      const client = await getGoogleWorkspaceClient(token);
      const extractedId = extractFileId(fileId);
      
      // Use readDriveFile which handles metadata and content fetching
      const result = await client.readDriveFile(extractedId) as Record<string, unknown>;
      
      if (!result) {
        throw new Error('File not found');
      }

      const mimeType = (result.mimeType || result.mime_type || '') as string;
      let fileType = 'unknown';

      // Determine file type from MIME type
      if (mimeType.includes('document') || mimeType === 'application/vnd.google-apps.document') {
        fileType = 'document';
      } else if (mimeType.includes('spreadsheet') || mimeType === 'application/vnd.google-apps.spreadsheet') {
        fileType = 'spreadsheet';
      } else if (mimeType.includes('presentation') || mimeType === 'application/vnd.google-apps.presentation') {
        fileType = 'presentation';
      } else if (mimeType.includes('folder') || mimeType === 'application/vnd.google-apps.folder') {
        fileType = 'folder';
      } else {
        fileType = 'file';
      }
      
      // Update node data
      nodeData.fileId = extractedId;
      nodeData.fileName = (result.name || 'Untitled') as string;
      nodeData.fileType = fileType;
      nodeData.mimeType = mimeType;
      nodeData.content = result.content || result;
      nodeData.isLoading = false;
    } catch (err: any) {
      console.error('Failed to fetch file:', err);
      setError(err.message || 'Failed to fetch file');
      nodeData.isLoading = false;
    } finally {
      setIsLoading(false);
    }
  }, [fileId, nodeData]);

  const getFileTypeLabel = () => {
    switch (nodeData.fileType) {
      case 'document':
        return 'Google Doc';
      case 'spreadsheet':
        return 'Google Sheet';
      case 'presentation':
        return 'Google Slides';
      case 'folder':
        return 'Folder';
      default:
        return 'File';
    }
  };

  const getFileTypeIcon = () => {
    switch (nodeData.fileType) {
      case 'document':
        return '📄';
      case 'spreadsheet':
        return '📊';
      case 'presentation':
        return '📽️';
      case 'folder':
        return '📁';
      default:
        return '📎';
    }
  };

  const renderContentPreview = () => {
    if (!nodeData.content) return null;

    if (nodeData.fileType === 'document') {
      const docContent = nodeData.content as Record<string, unknown>;
      const contentText = (docContent?.content || '') as string;
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
          {contentText ? `${contentText.substring(0, 150)}...` : 'No content available'}
        </div>
      );
    } else if (nodeData.fileType === 'spreadsheet') {
      const sheetData = nodeData.content as Record<string, unknown>;
      const values = sheetData?.values as unknown[];
      const rowCount = Array.isArray(values) ? values.length : 0;
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {rowCount > 0 ? `${rowCount} rows loaded` : 'No data available'}
        </div>
      );
    } else {
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {nodeData.fileType === 'folder' ? 'Folder contents' : 'File loaded'}
        </div>
      );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-blue-500 w-80 p-4">
      <h3 className="font-semibold text-lg mb-3">Google Drive Reference</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">File ID or URL</label>
          <input
            type="text"
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
            placeholder="Enter file ID or Google Drive URL"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <button
          onClick={fetchFile}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : 'Load File'}
        </button>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        {nodeData.fileName && (
          <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded">
            <div className="flex items-center gap-2 mb-1">
              <span>{getFileTypeIcon()}</span>
              <span className="font-medium">{nodeData.fileName}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Type: {getFileTypeLabel()}
            </div>
            {renderContentPreview()}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
}

