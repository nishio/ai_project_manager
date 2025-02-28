import { Task } from '../../utils/backlogLoader';

// タスクIDの正規表現パターン
export const TASK_ID_PATTERN = /T\d{4}/g;

/**
 * テキスト内のタスクIDを検出する
 * @param text 検索対象のテキスト
 * @returns 検出されたタスクIDの配列
 */
export function detectTaskIds(text: string): string[] {
  const matches = text.match(TASK_ID_PATTERN);
  return matches ? [...new Set(matches)] : [];
}

/**
 * タスクIDからタスクを検索する
 * @param taskId 検索対象のタスクID
 * @param tasks タスクの配列
 * @returns 見つかったタスク、または undefined
 */
export function findTaskById(taskId: string, tasks: Task[]): Task | undefined {
  return tasks.find(task => task.id === taskId);
}
