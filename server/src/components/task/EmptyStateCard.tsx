'use client';

import React from 'react';

interface EmptyStateCardProps {
  onShowAddTaskForm: () => void;
  onShowImportForm: () => void;
  onShowTextExtractor: () => void;
}

export default function EmptyStateCard({
  onShowAddTaskForm,
  onShowImportForm,
  onShowTextExtractor,
}: EmptyStateCardProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 mb-4 text-center">
      <h2 className="text-2xl font-bold mb-4">タスクがまだありません</h2>
      <p className="mb-6 text-gray-400">
        タスクを追加するためのいくつかの方法があります：
      </p>
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 justify-center">
        <button
          onClick={onShowAddTaskForm}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          手動でタスクを追加
        </button>
        <button
          onClick={onShowTextExtractor}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          テキストからタスクを抽出
        </button>
        <button
          onClick={onShowImportForm}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          backlog.jsonをインポート
        </button>
      </div>
    </div>
  );
}
