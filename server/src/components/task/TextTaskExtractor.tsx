'use client';

import React, { useState } from 'react';

interface TextTaskExtractorProps {
  onTasksExtracted: () => void;
  onCancel?: () => void;
}

export default function TextTaskExtractor({ onTasksExtracted, onCancel }: TextTaskExtractorProps) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // テキストのバリデーション
    if (!text.trim()) {
      setError('テキストは必須です');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/backlog/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'タスクの抽出に失敗しました');
      }
      
      // フォームをリセット
      setText('');
      
      // 親コンポーネントに通知
      onTasksExtracted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タスクの抽出に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="border rounded-lg p-4 shadow-sm mb-4">
      <h2 className="text-xl font-semibold mb-4">テキストからタスクを抽出</h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="task-text" className="block text-sm font-medium text-gray-700 mb-1">
            テキスト <span className="text-red-500">*</span>
          </label>
          <textarea
            id="task-text"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-white"
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="タスクを抽出するテキストを入力してください"
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
            {isSubmitting ? '抽出中...' : 'タスクを抽出'}
          </button>
        </div>
      </form>
    </div>
  );
}
