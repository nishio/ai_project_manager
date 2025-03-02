import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// テスト用のバックログデータのパス
const testBacklogPath = path.join(process.cwd(), '..', 'tests', 'data', 'test_backlog.json');

// テスト用のバックログデータのバックアップを作成
function backupTestData() {
  const backupPath = `${testBacklogPath}.backup`;
  if (fs.existsSync(testBacklogPath)) {
    fs.copyFileSync(testBacklogPath, backupPath);
  }
}

// テスト用のバックログデータを復元
function restoreTestData() {
  const backupPath = `${testBacklogPath}.backup`;
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, testBacklogPath);
    fs.unlinkSync(backupPath);
  }
}

test.describe('Add Task API', () => {
  test.beforeEach(() => {
    // テスト前にデータをバックアップ
    backupTestData();
    
    // 環境変数を設定
    process.env.USE_TEST_DATA = 'true';
  });
  
  test.afterEach(() => {
    // テスト後にデータを復元
    restoreTestData();
    
    // 環境変数をリセット
    process.env.USE_TEST_DATA = undefined;
  });
  
  test('should add a new task with title and description', async ({ request }) => {
    // タスクを追加
    const addResponse = await request.post('/api/backlog/add', {
      data: {
        title: 'テストタスク',
        description: 'これはテスト用のタスクです。',
      },
    });
    
    // レスポンスを確認
    expect(addResponse.ok()).toBeTruthy();
    const addData = await addResponse.json();
    expect(addData.success).toBeTruthy();
    expect(addData.task).toBeDefined();
    expect(addData.task.title).toBe('テストタスク');
    expect(addData.task.description).toBe('これはテスト用のタスクです。');
    expect(addData.task.status).toBe('Open');
    
    // バックログを取得して、タスクが追加されていることを確認
    const backlogResponse = await request.get('/api/backlog');
    expect(backlogResponse.ok()).toBeTruthy();
    const backlogData = await backlogResponse.json();
    
    // 追加したタスクを検索
    const addedTask = backlogData.tasks.find((task: any) => task.title === 'テストタスク');
    expect(addedTask).toBeDefined();
    expect(addedTask.description).toBe('これはテスト用のタスクです。');
  });
  
  test('should add a task with title only', async ({ request }) => {
    // タイトルのみでタスクを追加
    const addResponse = await request.post('/api/backlog/add', {
      data: {
        title: 'タイトルのみのタスク',
      },
    });
    
    // レスポンスを確認
    expect(addResponse.ok()).toBeTruthy();
    const addData = await addResponse.json();
    expect(addData.success).toBeTruthy();
    expect(addData.task).toBeDefined();
    expect(addData.task.title).toBe('タイトルのみのタスク');
    expect(addData.task.description).toBe('');
    
    // バックログを取得して、タスクが追加されていることを確認
    const backlogResponse = await request.get('/api/backlog');
    expect(backlogResponse.ok()).toBeTruthy();
    const backlogData = await backlogResponse.json();
    
    // 追加したタスクを検索
    const addedTask = backlogData.tasks.find((task: any) => task.title === 'タイトルのみのタスク');
    expect(addedTask).toBeDefined();
    expect(addedTask.description).toBe('');
  });
  
  test('should return error when title is missing', async ({ request }) => {
    // タイトルなしでタスクを追加しようとする
    const addResponse = await request.post('/api/backlog/add', {
      data: {
        description: 'タイトルなしのタスク',
      },
    });
    
    // エラーレスポンスを確認
    expect(addResponse.status()).toBe(400);
    const errorData = await addResponse.json();
    expect(errorData.error).toBe('タイトルは必須です');
  });
});
