'use client';

import * as React from 'react';
import { useState } from 'react';
import { Proposal } from '../../utils/proposalUtils';
import { Task } from '../../utils/backlogLoader';
import ProposalDetails from './ProposalDetails';

interface ProposalReviewPanelProps {
  proposal: Proposal;
  onApprove: (proposalId: string) => Promise<void>;
  onReject: (proposalId: string) => Promise<void>;
  onModify: (proposalId: string, modifiedTask: Task) => Promise<void>;
}

export default function ProposalReviewPanel({ 
  proposal, 
  onApprove, 
  onReject, 
  onModify 
}: ProposalReviewPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>(proposal.task);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      await onApprove(proposal.id);
    } catch (err) {
      setError('提案の承認に失敗しました');
      console.error('Error approving proposal:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      await onReject(proposal.id);
    } catch (err) {
      setError('提案の拒否に失敗しました');
      console.error('Error rejecting proposal:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModify = () => {
    setIsEditing(true);
  };

  const handleSaveModification = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      await onModify(proposal.id, editedTask);
      setIsEditing(false);
    } catch (err) {
      setError('提案の修正に失敗しました');
      console.error('Error modifying proposal:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelModification = () => {
    setIsEditing(false);
    setEditedTask(proposal.task);
  };

  const handleTaskChange = (field: keyof Task, value: any) => {
    setEditedTask(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm mb-4 proposal-review-panel" data-testid="proposal-review-panel">
      {!isEditing ? (
        <>
          <ProposalDetails proposal={proposal} />
          
          {proposal.status === 'pending' && (
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                data-testid="approve-button"
              >
                {isProcessing ? '処理中...' : '承認'}
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                data-testid="reject-button"
              >
                {isProcessing ? '処理中...' : '拒否'}
              </button>
              <button
                onClick={handleModify}
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                data-testid="modify-button"
              >
                {isProcessing ? '処理中...' : '修正'}
              </button>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
        </>
      ) : (
        <div className="editing-form">
          <h3 className="text-lg font-semibold mb-4">タスクの修正</h3>
          
          <div className="mb-4">
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
              タイトル
            </label>
            <input
              id="task-title"
              type="text"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-white"
              value={editedTask.title}
              onChange={(e) => handleTaskChange('title', e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="task-status" className="block text-sm font-medium text-gray-700 mb-1">
              ステータス
            </label>
            <select
              id="task-status"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-white"
              value={editedTask.status}
              onChange={(e) => handleTaskChange('status', e.target.value)}
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              id="task-description"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-white"
              rows={5}
              value={editedTask.description}
              onChange={(e) => handleTaskChange('description', e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancelModification}
              disabled={isProcessing}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
              data-testid="cancel-button"
            >
              キャンセル
            </button>
            <button
              onClick={handleSaveModification}
              disabled={isProcessing}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              data-testid="save-button"
            >
              {isProcessing ? '保存中...' : '保存'}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
