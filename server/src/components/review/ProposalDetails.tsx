'use client';

import React from 'react';
import { Task } from '../../utils/backlogLoader';
import { Proposal } from '../../app/api/backlog/proposal/route';

interface ProposalDetailsProps {
  proposal: Proposal;
}

export default function ProposalDetails({ proposal }: ProposalDetailsProps) {
  // 提案タイプに基づいて表示を変更
  const isNewTask = proposal.type === 'new';
  
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">
          {isNewTask ? '新規タスク提案' : 'タスク更新提案'}
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          提案ID: {proposal.id}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          作成日時: {new Date(proposal.created_at).toLocaleString('ja-JP')}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          ステータス: {
            proposal.status === 'pending' ? '保留中' :
            proposal.status === 'approved' ? '承認済み' :
            proposal.status === 'rejected' ? '拒否済み' : proposal.status
          }
        </div>
      </div>

      {isNewTask ? (
        // 新規タスク提案の表示
        <div>
          <h4 className="font-semibold mb-2">提案内容:</h4>
          <div className="bg-white dark:bg-gray-700 rounded p-3 mb-4">
            <div className="mb-2">
              <span className="font-semibold">ID:</span> {proposal.task.id}
            </div>
            <div className="mb-2">
              <span className="font-semibold">タイトル:</span> {proposal.task.title}
            </div>
            <div className="mb-2">
              <span className="font-semibold">ステータス:</span> {proposal.task.status}
            </div>
            <div className="mb-2">
              <span className="font-semibold">タイプ:</span> {proposal.task.type}
            </div>
            <div className="mb-4">
              <span className="font-semibold">説明:</span>
              <div className="mt-1 whitespace-pre-line">{proposal.task.description}</div>
            </div>
            {proposal.task.labels && proposal.task.labels.length > 0 && (
              <div className="mb-2">
                <span className="font-semibold">ラベル:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {proposal.task.labels.map((label, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs rounded-full">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {proposal.task.assignable_to && proposal.task.assignable_to.length > 0 && (
              <div className="mb-2">
                <span className="font-semibold">担当可能:</span> {proposal.task.assignable_to.join(', ')}
              </div>
            )}
          </div>
        </div>
      ) : (
        // タスク更新提案の表示
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">現在のタスク:</h4>
              {proposal.original_task ? (
                <div className="bg-white dark:bg-gray-700 rounded p-3">
                  <div className="mb-2">
                    <span className="font-semibold">ID:</span> {proposal.original_task.id}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">タイトル:</span> {proposal.original_task.title}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">ステータス:</span> {proposal.original_task.status}
                  </div>
                  <div className="mb-4">
                    <span className="font-semibold">説明:</span>
                    <div className="mt-1 whitespace-pre-line">{proposal.original_task.description}</div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 dark:text-gray-400">元のタスク情報がありません</div>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">更新後のタスク:</h4>
              <div className="bg-white dark:bg-gray-700 rounded p-3">
                <div className="mb-2">
                  <span className="font-semibold">ID:</span> {proposal.task.id}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">タイトル:</span> {proposal.task.title}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">ステータス:</span> {proposal.task.status}
                </div>
                <div className="mb-4">
                  <span className="font-semibold">説明:</span>
                  <div className="mt-1 whitespace-pre-line">{proposal.task.description}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-semibold mb-2">変更点:</h4>
            <div className="bg-white dark:bg-gray-700 rounded p-3">
              {proposal.original_task && (
                <>
                  {proposal.original_task.title !== proposal.task.title && (
                    <div className="mb-2">
                      <span className="font-semibold">タイトル:</span> 
                      <span className="line-through text-red-500 dark:text-red-400 mr-2">{proposal.original_task.title}</span>
                      <span className="text-green-500 dark:text-green-400">{proposal.task.title}</span>
                    </div>
                  )}
                  
                  {proposal.original_task.status !== proposal.task.status && (
                    <div className="mb-2">
                      <span className="font-semibold">ステータス:</span> 
                      <span className="line-through text-red-500 dark:text-red-400 mr-2">{proposal.original_task.status}</span>
                      <span className="text-green-500 dark:text-green-400">{proposal.task.status}</span>
                    </div>
                  )}
                  
                  {proposal.original_task.description !== proposal.task.description && (
                    <div className="mb-2">
                      <span className="font-semibold">説明:</span> 
                      <div className="mt-1">
                        <div className="bg-red-100 dark:bg-red-900 p-2 rounded mb-2 whitespace-pre-line">
                          {proposal.original_task.description}
                        </div>
                        <div className="bg-green-100 dark:bg-green-900 p-2 rounded whitespace-pre-line">
                          {proposal.task.description}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* ラベルの変更を表示 */}
                  {JSON.stringify(proposal.original_task.labels) !== JSON.stringify(proposal.task.labels) && (
                    <div className="mb-2">
                      <span className="font-semibold">ラベル:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {proposal.original_task.labels && proposal.original_task.labels.map((label, index) => (
                          <span key={`old-${index}`} className="px-2 py-1 bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200 text-xs rounded-full">
                            {label}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {proposal.task.labels && proposal.task.labels.map((label, index) => (
                          <span key={`new-${index}`} className="px-2 py-1 bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-200 text-xs rounded-full">
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {!proposal.original_task && (
                <div className="text-gray-500 dark:text-gray-400">元のタスク情報がないため、変更点を表示できません</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
