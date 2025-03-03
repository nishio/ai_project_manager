'use client';

import React, { useEffect, useState } from 'react';
import { Task, Backlog } from '../utils/backlogLoader';
import { Proposal } from './api/backlog/proposal/route';
import TaskFilter from '../components/TaskFilter';
import TaskCard from '../components/task/TaskCard';
import MarkdownEditor from '../components/MarkdownEditor';
import ProposalReviewPanel from '../components/review/ProposalReviewPanel';

export default function Home() {
  const [backlog, setBacklog] = useState<Backlog | null>(null);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [showMarkdownEditor, setShowMarkdownEditor] = useState<boolean>(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState<boolean>(false);
  const [proposalsError, setProposalsError] = useState<string | null>(null);
  const [showProposals, setShowProposals] = useState<boolean>(true);

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

    const fetchProposals = async () => {
      try {
        setProposalsLoading(true);
        const response = await fetch('/api/backlog/proposal');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setProposals(data.proposals || []);
        setProposalsLoading(false);
      } catch (err) {
        setProposalsError(err instanceof Error ? err.message : 'Unknown error occurred');
        setProposalsLoading(false);
      }
    };

    fetchBacklog();
    fetchProposals();
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

  // 提案を承認する関数
  const handleApproveProposal = async (proposalId: string) => {
    try {
      const response = await fetch('/api/backlog/proposal/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // 提案リストとバックログを再取得
      const updatedProposalsResponse = await fetch('/api/backlog/proposal');
      if (!updatedProposalsResponse.ok) {
        throw new Error(`Error: ${updatedProposalsResponse.status}`);
      }
      const updatedProposalsData = await updatedProposalsResponse.json();
      setProposals(updatedProposalsData.proposals || []);

      const updatedBacklogResponse = await fetch('/api/backlog');
      if (!updatedBacklogResponse.ok) {
        throw new Error(`Error: ${updatedBacklogResponse.status}`);
      }
      const updatedBacklogData = await updatedBacklogResponse.json();
      setBacklog(updatedBacklogData);
      setFilteredTasks(updatedBacklogData.tasks || []);
    } catch (err) {
      console.error('Error approving proposal:', err);
      alert('提案の承認に失敗しました。');
    }
  };

  // 提案を拒否する関数
  const handleRejectProposal = async (proposalId: string) => {
    try {
      const response = await fetch('/api/backlog/proposal/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // 提案リストを再取得
      const updatedProposalsResponse = await fetch('/api/backlog/proposal');
      if (!updatedProposalsResponse.ok) {
        throw new Error(`Error: ${updatedProposalsResponse.status}`);
      }
      const updatedProposalsData = await updatedProposalsResponse.json();
      setProposals(updatedProposalsData.proposals || []);
    } catch (err) {
      console.error('Error rejecting proposal:', err);
      alert('提案の拒否に失敗しました。');
    }
  };

  // 提案を修正する関数
  const handleModifyProposal = async (proposalId: string, modifiedTask: Task) => {
    try {
      const response = await fetch('/api/backlog/proposal/modify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          modifiedTask,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // 提案リストを再取得
      const updatedProposalsResponse = await fetch('/api/backlog/proposal');
      if (!updatedProposalsResponse.ok) {
        throw new Error(`Error: ${updatedProposalsResponse.status}`);
      }
      const updatedProposalsData = await updatedProposalsResponse.json();
      setProposals(updatedProposalsData.proposals || []);
    } catch (err) {
      console.error('Error modifying proposal:', err);
      alert('提案の修正に失敗しました。');
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
        {/* AI提案レビューセクション */}
        {proposals.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">AIからの提案 ({proposals.filter(p => p.status === 'pending').length}件)</h2>
              <button
                onClick={() => setShowProposals(!showProposals)}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                {showProposals ? '提案を隠す' : '提案を表示'}
              </button>
            </div>

            {showProposals && (
              <div className="mb-4">
                {proposalsLoading ? (
                  <div className="text-sm text-blue-500">提案を読み込み中...</div>
                ) : proposalsError ? (
                  <div className="text-sm text-red-500">エラー: {proposalsError}</div>
                ) : (
                  <div>
                    {proposals.filter(p => p.status === 'pending').length === 0 ? (
                      <div className="text-sm text-gray-500">レビュー待ちの提案はありません</div>
                    ) : (
                      <div className="space-y-4">
                        {proposals
                          .filter(p => p.status === 'pending')
                          .map(proposal => (
                            <ProposalReviewPanel
                              key={proposal.id}
                              proposal={proposal}
                              onApprove={handleApproveProposal}
                              onReject={handleRejectProposal}
                              onModify={handleModifyProposal}
                            />
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 既存のMarkdownエディタセクション */}
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => setShowMarkdownEditor(!showMarkdownEditor)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showMarkdownEditor ? 'Markdownエディタを閉じる' : 'Markdownエディタを開く'}
          </button>
        </div>

        {showMarkdownEditor && (
          <div className="mb-8">
            <MarkdownEditor tasks={backlog.tasks} />
          </div>
        )}

        {/* 既存のタスクフィルターセクション */}
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

        {/* 既存のタスクリストセクション */}
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
