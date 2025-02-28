import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { loadBacklogData, Backlog, Task } from '../../../../utils/backlogLoader';

const BACKLOG_PATH = path.join(process.cwd(), '..', '..', 'ai_project_manager_data', 'tasks', 'backlog.json');

export async function POST(request: Request) {
  try {
    const { taskId, updates } = await request.json();

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // バックログデータを読み込む
    const backlogData = await loadBacklogData();
    
    // 指定されたIDのタスクを検索
    const taskIndex = backlogData.tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // タスクを更新
    const updatedTask = {
      ...backlogData.tasks[taskIndex],
      ...updates
    };

    // ステータスが 'Done' に変更された場合、完了時間を追加
    if (updates.status === 'Done' && backlogData.tasks[taskIndex].status !== 'Done') {
      updatedTask.completion_time = new Date().toISOString();
    }

    // 更新されたタスクをバックログに反映
    backlogData.tasks[taskIndex] = updatedTask;

    // 更新されたデータをファイルに書き込む
    fs.writeFileSync(BACKLOG_PATH, JSON.stringify(backlogData, null, 2), 'utf8');

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}
