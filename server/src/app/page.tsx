'use client';

import React, { useEffect, useState } from 'react';
import { Task, Backlog } from '../utils/backlogLoader';
import TaskFilter from '../components/TaskFilter';

export default function Home() {
  const [backlog, setBacklog] = useState<Backlog | null>(null);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBacklog = async () => {
      try {
        const response = await fetch('/api/backlog');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setBacklog(data);
        // @ts-expect-error: for debug
        globalThis.backlog = data;
        setFilteredTasks(data.tasks || []);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setLoading(false);
      }
    };

    fetchBacklog();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-xl">バックログデータを読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-xl text-red-500">エラー: {error}</div>
      </div>
    );
  }

  if (!backlog || !backlog.tasks || backlog.tasks.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-xl">バックログにタスクが見つかりませんでした。</div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-8">プロジェクトバックログ</h1>

      <div className="w-full max-w-5xl">
        <TaskFilter
          tasks={backlog.tasks}
          onFilterChange={setFilteredTasks}
        />

        <div className="mb-4 text-sm text-gray-500">
          {filteredTasks.length} 件のタスクが表示されています（全 {backlog.tasks.length} 件中）
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map((task: Task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    </main>
  );
}

function TaskCard({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div
      className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={toggleExpand}
    >
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold">{task.title}</h2>
        <div className="flex space-x-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {task.id}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${task.status === 'Open' ? 'bg-green-100 text-green-800' :
            task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
              task.status === 'Done' ? 'bg-gray-100 text-gray-800' :
                'bg-gray-100 text-gray-800'
            }`}>
            {task.status}
          </span>
        </div>
      </div>

      {expanded && (
        <>
          <p className="mt-4 text-gray-700 whitespace-pre-line">{task.description}</p>

          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {task.labels && task.labels.map((label, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
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
    </div>
  );
}
