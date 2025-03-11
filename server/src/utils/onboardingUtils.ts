/**
 * オンボーディング用ユーティリティ関数
 */
import { getCurrentUser } from '../firebase/auth';
import { storeUserBacklog } from '../firebase/firestore';

/**
 * サンプルタスクを生成する
 * @returns 生成結果
 */
export async function generateSampleTasks() {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('ユーザーが認証されていません');
    }

    // サンプルタスクデータ
    const sampleTasks = {
      tasks: [
        {
          id: 'T0001',
          status: 'Open',
          title: 'プロジェクト計画の作成',
          description: 'プロジェクトの目標、スコープ、タイムラインを定義した計画書を作成する。',
          type: 'task',
          labels: ['計画', '重要'],
          assignable_to: [],
          created: new Date().toISOString(),
        },
        {
          id: 'T0002',
          status: 'In Progress',
          title: 'デザインモックアップの作成',
          description: 'ユーザーインターフェースのモックアップを作成し、チームでレビューする。',
          type: 'task',
          labels: ['デザイン'],
          assignable_to: [],
          created: new Date().toISOString(),
        },
        {
          id: 'T0003',
          status: 'Open',
          title: 'データベース設計',
          description: 'アプリケーションのデータモデルとデータベーススキーマを設計する。',
          type: 'task',
          labels: ['技術', '設計'],
          assignable_to: [],
          created: new Date().toISOString(),
        },
        {
          id: 'T0004',
          status: 'Open',
          title: 'APIエンドポイントの実装',
          description: 'フロントエンドとバックエンドの通信に必要なAPIエンドポイントを実装する。',
          type: 'task',
          labels: ['技術', '実装'],
          assignable_to: [],
          created: new Date().toISOString(),
        },
        {
          id: 'T0005',
          status: 'Open',
          title: 'ユーザーテストの実施',
          description: '実際のユーザーにアプリケーションを使ってもらい、フィードバックを収集する。',
          type: 'task',
          labels: ['テスト', 'UX'],
          assignable_to: [],
          created: new Date().toISOString(),
        }
      ]
    };

    // Firestoreに保存
    await storeUserBacklog(user.uid, sampleTasks);
    
    return { success: true, message: 'サンプルタスクを生成しました' };
  } catch (error) {
    console.error('Error generating sample tasks:', error);
    return { 
      success: false, 
      message: `サンプルタスク生成中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

/**
 * ユーザーがオンボーディングを完了したかどうかを確認する
 * @returns オンボーディング完了状態
 */
export async function checkOnboardingStatus() {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { completed: false };
    }

    // ここでユーザーのオンボーディング状態を確認するロジックを実装
    // 例: Firestoreからユーザーのプロファイル情報を取得して確認
    
    // 仮の実装（実際にはFirestoreからデータを取得する）
    const completed = localStorage.getItem(`onboarding_completed_${user.uid}`) === 'true';
    
    return { completed };
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return { completed: false };
  }
}

/**
 * オンボーディング完了状態を設定する
 * @param completed 完了状態
 * @returns 設定結果
 */
export async function setOnboardingCompleted(completed: boolean = true) {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('ユーザーが認証されていません');
    }

    // ここでユーザーのオンボーディング状態を保存するロジックを実装
    // 例: Firestoreにユーザーのプロファイル情報を更新
    
    // 仮の実装（実際にはFirestoreにデータを保存する）
    localStorage.setItem(`onboarding_completed_${user.uid}`, completed ? 'true' : 'false');
    
    return { success: true };
  } catch (error) {
    console.error('Error setting onboarding status:', error);
    return { 
      success: false, 
      message: `オンボーディング状態の設定中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}
