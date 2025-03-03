import * as fs from 'fs';
import * as path from 'path';

// 型定義
export interface Task {
  id: string;
  title: string;
  status: string;
  type: string;
  description: string;
  labels: string[];
  assignable_to: string[];
  subtasks?: Task[];
  dependencies?: {
    must?: Array<{
      task_id: string;
      reason: string;
    }>;
    nice_to_have?: Array<{
      task_id: string;
      reason: string;
    }>;
    human?: Array<{
      assignee: string;
      action: string;
      status: string;
      reason: string;
    }>;
  };
}

export interface Backlog {
  tasks: Task[];
}

export async function loadBacklogData(): Promise<Backlog> {
  try {
    // デフォルトのパス
    let backlogPath = path.join(process.cwd(), '..', '..', 'ai_project_manager_data', 'tasks', 'backlog.json');
    
    // テスト環境の場合はテストデータを使用
    if (process.env.USE_TEST_DATA === 'true') {
      backlogPath = path.join(process.cwd(), '..', 'tests', 'data', 'test_backlog.json');
    }

    // ファイルの存在確認
    if (!fs.existsSync(backlogPath)) {
      console.error(`Backlog file not found at: ${backlogPath}`);
      return { tasks: [] };
    }

    const fileContents = fs.readFileSync(backlogPath, 'utf8');
    const data = JSON.parse(fileContents) as Backlog;
    return data;
  } catch (error) {
    console.error('Error loading backlog data:', error);
    return { tasks: [] };
  }
}
