'use client';

import React, { useEffect, useState } from 'react';
import { Task, Backlog } from '../utils/backlogLoader';
import TaskFilter from '../components/TaskFilter';
import TaskCard from '../components/task/TaskCard';
import MarkdownEditor from '../components/MarkdownEditor';
import AddTaskForm from '../components/task/AddTaskForm';

export default function Home() {
  const [backlog, setBacklog] = useState<Backlog | null>(null);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [showMarkdownEditor, setShowMarkdownEditor] = useState<boolean>(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState<boolean>(false);

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

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      setUpdateLoading(true);
      const response = await fetch('/api/backlog/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          updates: { status: newStatus },
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // 成功したら、バックログを再取得する
      const updatedBacklogResponse = await fetch('/api/backlog');
      if (!updatedBacklogResponse.ok) {
        throw new Error(`Error: ${updatedBacklogResponse.status}`);
      }
      const updatedData = await updatedBacklogResponse.json();
      setBacklog(updatedData);
      setFilteredTasks(prevTasks => {
        // 現在のフィルタリング条件を維持するために、更新されたタスクデータでフィルタリングを再適用
        const updatedTask = updatedData.tasks.find((t: Task) => t.id === taskId);
        return prevTasks.map((t: Task) => t.id === taskId ? updatedTask : t);
      });
    } catch (err) {
      console.error('Error updating task status:', err);
      alert('タスクの更新に失敗しました。');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      setUpdateLoading(true);
      const response = await fetch('/api/backlog/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: updatedTask.id,
          updates: {
            title: updatedTask.title,
            description: updatedTask.description,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // 成功したら、バックログを再取得する
      const updatedBacklogResponse = await fetch('/api/backlog');
      if (!updatedBacklogResponse.ok) {
        throw new Error(`Error: ${updatedBacklogResponse.status}`);
      }
      const updatedData = await updatedBacklogResponse.json();
      setBacklog(updatedData);
      setFilteredTasks(prevTasks => {
        // 現在のフィルタリング条件を維持するために、更新されたタスクデータでフィルタリングを再適用
        const updatedTaskData = updatedData.tasks.find((t: Task) => t.id === updatedTask.id);
        return prevTasks.map((t: Task) => t.id === updatedTask.id ? updatedTaskData : t);
      });
    } catch (err) {
      console.error('Error updating task:', err);
      alert('タスクの更新に失敗しました。');
    } finally {
      setUpdateLoading(false);
    }
  };

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
      <h1 className="text-3xl font-bold mb-8">AIPM<span className="text-sm font-bold mb-8">あいぽん</span></h1>

      <div className="w-full max-w-5xl">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <button
              onClick={() => setShowMarkdownEditor(!showMarkdownEditor)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
            >
              {showMarkdownEditor ? 'Markdownエディタを閉じる' : 'Markdownエディタを開く'}
            </button>
            <button
              onClick={() => setShowAddTaskForm(!showAddTaskForm)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {showAddTaskForm ? 'タスク追加フォームを閉じる' : 'タスクを追加'}
            </button>
          </div>
        </div>

        {showMarkdownEditor && (
          <div className="mb-8">
            <MarkdownEditor tasks={backlog.tasks} />
          </div>
        )}
        
        {showAddTaskForm && (
          <div className="mb-8">
            <AddTaskForm 
              onTaskAdded={async () => {
                // タスクが追加されたら、バックログを再取得する
                try {
                  setUpdateLoading(true);
                  const response = await fetch('/api/backlog');
                  if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                  }
                  const data = await response.json();
                  setBacklog(data);
                  setFilteredTasks(data.tasks || []);
                } catch (err) {
                  console.error('Error refreshing backlog:', err);
                  alert('バックログの更新に失敗しました。');
                } finally {
                  setUpdateLoading(false);
                }
              }}
              onCancel={() => setShowAddTaskForm(false)}
            />
          </div>
        )}

        <TaskFilter
          tasks={backlog.tasks}
          onFilterChange={setFilteredTasks}
        />

        <div className="mb-4 text-sm text-gray-500">
          {filteredTasks.length} 件のタスクが表示されています（全 {backlog.tasks.length} 件中）
        </div>

        {updateLoading && (
          <div className="mb-4 text-sm text-blue-500">
            タスクを更新中...
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map((task: Task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onStatusChange={handleTaskStatusChange}
              onTaskUpdate={handleTaskUpdate}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
