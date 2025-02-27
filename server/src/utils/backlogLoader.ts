import fs from 'fs';
import path from 'path';

// 型定義
export interface Task {
  id: string;
  title: string;
  status: string;
  type: string;
  description: string;
  labels: string[];
  assignable_to: string[];
}

export interface Backlog {
  tasks: Task[];
}

const BACKLOG_PATH = path.join(process.cwd(), '..', '..', 'ai_project_manager_data', 'tasks', 'backlog.json');

export async function loadBacklogData(): Promise<Backlog> {
  try {
    const fileContents = fs.readFileSync(BACKLOG_PATH, 'utf8');
    const data = JSON.parse(fileContents) as Backlog;
    return data;
  } catch (error) {
    console.error('Error loading backlog data:', error);
    return { tasks: [] };
  }
}
