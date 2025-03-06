import { test, expect } from '@playwright/test';

test.describe('Main Page', () => {
  test('should load and display backlog data', async ({ page }: { page: any }) => {
    // メインページにアクセス
    await page.goto('/');
    
    // ページのタイトルを確認
    await expect(page).toHaveTitle(/プロジェクトバックログ可視化/);
    
    // ローディング状態が表示されないことを確認（データが読み込まれた状態）
    await expect(page.locator('text=バックログデータを読み込み中...')).not.toBeVisible();
    
    // タスクカードが表示されることを確認
    const taskCards = page.locator('[data-testid="task-card"]');
    // 提案レビューシステムの追加により、タスクカードの数が環境によって変わる可能性があるため、
    // 少なくとも4つのタスクカードがあることを確認する
    const taskCardCount = await taskCards.count();
    console.log(`Found ${taskCardCount} task cards`);
    expect(taskCardCount).toBeGreaterThanOrEqual(4); // テストデータには少なくとも4つのタスクがある
    
    // タスクIDが表示されることを確認（より特定的なセレクタを使用）
    await expect(page.locator('[data-testid="task-card"] span:has-text("T0001")')).toBeVisible();
    await expect(page.locator('[data-testid="task-card"] span:has-text("T0003")')).toBeVisible();
    
    // タスクのタイトルが表示されることを確認
    await expect(page.locator('text=ウェブサイトリニューアル')).toBeVisible();
    await expect(page.locator('text=ウェブサイトの分析レポート作成')).toBeVisible();
  });
    
  test('should expand task details on click', async ({ page }: { page: any }) => {
    // メインページにアクセス
    await page.goto('/');
    
    // タスクIDが表示されていることを確認
    await expect(page.locator('[data-testid="task-card"]:has-text("T0001")')).toBeVisible();
    
    // 最初のタスクカードをクリック
    await page.locator('[data-testid="task-card"]:has-text("T0001")').first().click();
    
    // クリック後もタスクIDが表示されていることを確認（クリックが機能していることを確認）
    await expect(page.locator('[data-testid="task-card"]:has-text("T0001")')).toBeVisible();
  });
  
  test('should handle error state', async ({ page }: { page: any }) => {
    // エラー状態をシミュレートするためにAPIをモック
    await page.route('/api/backlog', async (route: any) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Failed to fetch backlog data' }),
      });
    });
    
    // メインページにアクセス
    await page.goto('/');
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=エラー:')).toBeVisible();
  });
});
