import * as fs from 'fs';
import * as path from 'path';
import { getCurrentUser } from '../firebase/auth';
import { loadBacklogFromFirestore, saveBacklogToFirestore } from './firebaseBacklogLoader';

// 型定義
export interface Task {
  id: string;
  title: string;
  status: string;
  type: string;
  description: string;
  labels: string[];
  assignable_to: string[];
  created?: string; // タスク作成日時
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

/**
 * バックログデータを読み込む
 * 認証済みユーザーの場合はFirestoreから、それ以外の場合はファイルシステムから読み込む
 */
export async function loadBacklogData(): Promise<Backlog> {
  try {
    // 認証済みユーザーの確認
    const user = getCurrentUser();
    
    // 認証済みユーザーの場合はFirestoreから読み込む
    if (user) {
      try {
        return await loadBacklogFromFirestore();
      } catch (firestoreError) {
        console.error('Error loading from Firestore, falling back to file system:', firestoreError);
        // Firestoreからの読み込みに失敗した場合はファイルシステムにフォールバック
      }
    }
    
    // ファイルシステムからの読み込み（認証なしまたはFirestoreエラー時）
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

/**
 * バックログデータを保存する
 * 認証済みユーザーの場合はFirestoreに、それ以外の場合はファイルシステムに保存する
 */
export async function saveBacklogData(backlogData: Backlog): Promise<{ success: boolean }> {
  try {
    // 認証済みユーザーの確認
    const user = getCurrentUser();
    
    // 認証済みユーザーの場合はFirestoreに保存
    if (user) {
      try {
        return await saveBacklogToFirestore(backlogData);
      } catch (firestoreError) {
        console.error('Error saving to Firestore, falling back to file system:', firestoreError);
        // Firestoreへの保存に失敗した場合はファイルシステムにフォールバック
      }
    }
    
    // ファイルシステムへの保存（認証なしまたはFirestoreエラー時）
    // デフォルトのパス
    let backlogPath = path.join(process.cwd(), '..', '..', 'ai_project_manager_data', 'tasks', 'backlog.json');
    
    // テスト環境の場合はテストデータを使用
    if (process.env.USE_TEST_DATA === 'true') {
      backlogPath = path.join(process.cwd(), '..', 'tests', 'data', 'test_backlog.json');
    }

    // ファイルに書き込み
    fs.writeFileSync(backlogPath, JSON.stringify(backlogData, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Error saving backlog data:', error);
    return { success: false };
  }
}
