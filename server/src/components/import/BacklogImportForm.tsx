'use client';

import React, { useState } from 'react';
import { importBacklogFromFile } from '../../utils/migrationUtils';

interface BacklogImportFormProps {
  onImportComplete: () => void;
  onCancel?: () => void;
}

export default function BacklogImportForm({ onImportComplete, onCancel }: BacklogImportFormProps) {
  const [jsonContent, setJsonContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // JSON形式のバリデーション
    if (!jsonContent.trim()) {
      setError('JSONデータを入力してください');
      return;
    }
    
    // JSONのパース
    try {
      JSON.parse(jsonContent);
    } catch (err) {
      setError('有効なJSON形式ではありません');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      // importBacklogFromFileを使用してJSONをインポート
      const result = await importBacklogFromFile(jsonContent);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // フォームをリセット
      setJsonContent('');
      
      // 親コンポーネントに通知
      onImportComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'JSONのインポートに失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="border rounded-lg p-4 shadow-sm mb-4">
      <h2 className="text-xl font-semibold mb-4">backlog.jsonをインポート</h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="json-content" className="block text-sm font-medium text-gray-700 mb-1">
            JSONデータ <span className="text-red-500">*</span>
          </label>
          <textarea
            id="json-content"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-white"
            rows={10}
            value={jsonContent}
            onChange={(e) => setJsonContent(e.target.value)}
            placeholder='{"tasks": [...]} 形式のJSONを貼り付けてください'
            required
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
          )}
          <button
            type="submit"
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'インポート中...' : 'インポート'}
          </button>
        </div>
      </form>
    </div>
  );
}
