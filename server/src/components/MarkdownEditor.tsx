'use client';

import React, { useState } from 'react';
import TaskMarkdown from './markdown/TaskMarkdown';
import { Task } from '../utils/backlogLoader';

interface MarkdownEditorProps {
  tasks: Task[];
}

export default function MarkdownEditor({ tasks }: MarkdownEditorProps) {
  const [markdown, setMarkdown] = useState<string>('');

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Markdownエディタ</h2>
        <textarea
          className="w-full h-40 p-2 border rounded"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          placeholder="Markdownテキストを入力してください。タスクID（例：T0001）は自動的にハイライトされます。"
        />
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">プレビュー</h2>
        <div className="border rounded p-4 min-h-40">
          <TaskMarkdown markdown={markdown} tasks={tasks} />
        </div>
      </div>
    </div>
  );
}
