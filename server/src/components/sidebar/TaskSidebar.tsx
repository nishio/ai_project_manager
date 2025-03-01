'use client';

import React from 'react';
import { Task } from '../../utils/backlogLoader';
import TaskCard from '../task/TaskCard';

interface TaskSidebarProps {
  tasks: Task[];
  onClose: () => void;
  onCloseAll: () => void;
  onCloseTask?: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: string) => void;
  onTaskUpdate?: (updatedTask: Task) => void;
}

export default function TaskSidebar({ tasks, onClose, onCloseAll, onCloseTask, onStatusChange, onTaskUpdate }: TaskSidebarProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-gray-100 dark:bg-gray-800 shadow-lg overflow-y-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold dark:text-white">タスク情報</h2>
        <div>
          <button
            onClick={onCloseAll}
            className="px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 mr-2"
          >
            全て閉じる
          </button>
          <button
            onClick={onClose}
            className="px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            閉じる
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {tasks.map(task => (
          <div key={task.id} className="relative">
            <button
              onClick={() => onCloseTask && onCloseTask(task.id)}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              ×
            </button>
            <TaskCard 
              task={task} 
              initialExpanded={true} 
              onStatusChange={onStatusChange}
              onTaskUpdate={onTaskUpdate}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
