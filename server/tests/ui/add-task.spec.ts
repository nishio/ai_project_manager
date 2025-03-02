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

test.describe('Add Task UI', () => {
  test.beforeEach(async ({ page }) => {
    // テスト前にデータをバックアップ
    backupTestData();
    
    // 環境変数を設定
    process.env.USE_TEST_DATA = 'true';
    
    // メインページにアクセス
    await page.goto('/');
    
    // ローディング状態が表示されないことを確認（データが読み込まれた状態）
    await expect(page.locator('text=バックログデータを読み込み中...')).not.toBeVisible();
  });
  
  test.afterEach(() => {
    // テスト後にデータを復元
    restoreTestData();
    
    // 環境変数をリセット
    process.env.USE_TEST_DATA = undefined;
  });
  
  test('should display add task form when button is clicked', async ({ page }) => {
    // タスク追加ボタンが表示されていることを確認
    const addTaskButton = page.locator('text=タスクを追加');
    await expect(addTaskButton).toBeVisible();
    
    // タスク追加ボタンをクリック
    await addTaskButton.click();
    
    // タスク追加フォームが表示されることを確認
    await expect(page.locator('text=新しいタスクを追加')).toBeVisible();
    await expect(page.locator('text=タイトル')).toBeVisible();
    await expect(page.locator('text=説明')).toBeVisible();
  });
  
  test('should add a new task with title and description', async ({ page }) => {
    // タスク追加ボタンをクリック
    await page.locator('text=タスクを追加').click();
    
    // フォームが表示されることを確認
    await expect(page.locator('text=新しいタスクを追加')).toBeVisible();
    
    // タイトルと説明を入力
    await page.locator('input#task-title').fill('UIテストタスク');
    await page.locator('textarea#task-description').fill('これはUIテスト用のタスクです。');
    
    // 追加ボタンをクリック
    await page.locator('button:has-text("追加")').click();
    
    // タスクが追加されたことを確認（フォームが閉じられ、タスクが表示される）
    await expect(page.locator('text=UIテストタスク')).toBeVisible();
    
    // タスクをクリックして詳細を表示
    await page.locator('text=UIテストタスク').click();
    
    // 説明が表示されることを確認
    await expect(page.locator('text=これはUIテスト用のタスクです。')).toBeVisible();
  });
  
  test('should show error when submitting without title', async ({ page }) => {
    // タスク追加ボタンをクリック
    await page.locator('text=タスクを追加').click();
    
    // 説明のみを入力
    await page.locator('textarea#task-description').fill('タイトルなしのタスク');
    
    // 追加ボタンをクリック
    await page.locator('button:has-text("追加")').click();
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=タイトルは必須です')).toBeVisible();
  });
  
  test('should close form when cancel button is clicked', async ({ page }) => {
    // タスク追加ボタンをクリック
    await page.locator('text=タスクを追加').click();
    
    // フォームが表示されることを確認
    await expect(page.locator('text=新しいタスクを追加')).toBeVisible();
    
    // キャンセルボタンをクリック
    await page.locator('button:has-text("キャンセル")').click();
    
    // フォームが閉じられることを確認
    await expect(page.locator('text=新しいタスクを追加')).not.toBeVisible();
  });
});
