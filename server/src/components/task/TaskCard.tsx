'use client';

import React, { useState } from 'react';
import { Task } from '../../utils/backlogLoader';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: string) => void;
  onTaskUpdate?: (updatedTask: Task) => void;
  initialExpanded?: boolean;
}

export default function TaskCard({ task, onStatusChange, onTaskUpdate, initialExpanded = false }: TaskCardProps) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);

  const toggleExpand = () => {
    if (!isEditing) {
      setExpanded(!expanded);
    }
  };

  const handleMarkDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStatusChange) {
      onStatusChange(task.id, 'Done');
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditedTitle(task.title);
    setEditedDescription(task.description);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTaskUpdate) {
      onTaskUpdate({
        ...task,
        title: editedTitle,
        description: editedDescription
      });
    }
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditedTitle(task.title);
    setEditedDescription(task.description);
  };

  return (
    <div
      className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={toggleExpand}
      data-testid="task-card"
    >
      {!isEditing ? (
        <>
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-semibold">
              <span className="px-2 mx-1 bg-blue-100 text-blue-800">
                {task.id}
              </span>
              {task.title}
            </h2>
          </div>
          {task.status !== 'Done' && (
            <button
              onClick={handleMarkDone}
              className="mx-1 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              完了
            </button>
          )}
          <button
            onClick={handleEdit}
            className="mx-1 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            編集
          </button>

          {expanded && (
            <>
              <p className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-line">{task.description}</p>

              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {task.labels && task.labels.map((label, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-300 text-gray-600 text-xs rounded-full">
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500">担当可能: {task.assignable_to.join(', ')}</p>
              </div>
            </>
          )}
        </>
      ) : (
        <div onClick={(e) => e.stopPropagation()} className="editing-form">
          <div className="mb-4">
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
              タイトル
            </label>
            <input
              id="task-title"
              type="text"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-white"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              id="task-description"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-white"
              rows={5}
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-gray-400 text-gray-800 rounded hover:bg-gray-500"
            >
              保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
