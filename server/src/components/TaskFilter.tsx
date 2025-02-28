'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '../utils/backlogLoader';

interface TaskFilterProps {
  tasks: Task[];
  onFilterChange: (filteredTasks: Task[]) => void;
}

export default function TaskFilter({ tasks, onFilterChange }: TaskFilterProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [labelFilter, setLabelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // すべてのステータスとラベルを取得
  const allStatuses = ['all', ...Array.from(new Set(tasks.map(task => task.status)))];
  const allLabels = ['all', ...Array.from(new Set(tasks.flatMap(task => task.labels || [])))];

  // フィルタリング関数
  const applyFilters = () => {
    let filteredTasks = [...tasks];

    // ステータスでフィルタリング
    if (statusFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }

    // ラベルでフィルタリング
    if (labelFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task =>
        task.labels && task.labels.includes(labelFilter)
      );
    }

    // 検索クエリでフィルタリング
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.id.toLowerCase().includes(query)
      );
    }

    onFilterChange(filteredTasks);
  };

  // フィルター変更時の処理
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setTimeout(applyFilters, 0);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLabelFilter(e.target.value);
    setTimeout(applyFilters, 0);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setTimeout(applyFilters, 0);
  };

  return (
    <div className="w-full mb-6 p-4 bg-black border rounded-lg">
      <div className="grid grid-cols-1 gap-4">
        {/* ステータスとラベルのフィルターを非表示にする */}
        <div className="hidden">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            ステータス
          </label>
          <select
            id="status-filter"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            {allStatuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'すべてのステータス' : status}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden">
          <label htmlFor="label-filter" className="block text-sm font-medium text-gray-700 mb-1">
            ラベル
          </label>
          <select
            id="label-filter"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            value={labelFilter}
            onChange={handleLabelChange}
          >
            {allLabels.map(label => (
              <option key={label} value={label}>
                {label === 'all' ? 'すべてのラベル' : label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="search-query" className="block text-sm font-medium text-gray-300 mb-1">
            検索
          </label>
          <input
            id="search-query"
            type="text"
            className="w-full rounded-md border-gray-500 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black"
            placeholder="タスク名、説明、IDで検索..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>
    </div>
  );
}
