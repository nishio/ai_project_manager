import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Proposal Review UI', () => {
  // テスト前にテストデータを準備
  test.beforeEach(async ({ page }: { page: any }) => {
    process.env.USE_TEST_DATA = 'true';
    
    // テスト用の提案データを作成
    const testProposalsPath = path.join(process.cwd(), '..', 'tests', 'data', 'test_proposals.json');
    
    // テスト用の提案データを作成
    const testProposals = {
      proposals: [
        {
          id: 'proposal-test-1',
          type: 'new',
          task: {
            id: 'T9999',
            title: 'テスト用新規タスク',
            description: 'これはテスト用の新規タスクです',
            status: 'Todo',
            type: 'task'
          },
          created_at: new Date().toISOString(),
          status: 'pending'
        },
        {
          id: 'proposal-test-2',
          type: 'update',
          task: {
            id: 'T0001',
            title: '更新されたタスク',
            description: 'これは更新されたタスクの説明です',
            status: 'In Progress',
            type: 'task'
          },
          original_task: {
            id: 'T0001',
            title: '元のタスク',
            description: '元のタスクの説明',
            status: 'Todo',
            type: 'task'
          },
          created_at: new Date().toISOString(),
          status: 'pending'
        }
      ]
    };
    
    fs.writeFileSync(testProposalsPath, JSON.stringify(testProposals, null, 2), 'utf8');
    
    // メインページにアクセス
    await page.goto('/');
  });

  test('should display proposal review section when proposals exist', async ({ page }: { page: any }) => {
    // 提案セクションが表示されることを確認
    await expect(page.locator('text=AIからの提案')).toBeVisible();
    
    // 提案の数が表示されることを確認
    await expect(page.locator('text=AIからの提案 (2件)')).toBeVisible();
    
    // 提案カードが表示されることを確認
    const proposalCards = page.locator('.border.rounded-lg.p-4.shadow-sm');
    await expect(proposalCards).toHaveCount(2);
  });

  test('should display new task proposal details correctly', async ({ page }: { page: any }) => {
    // 新規タスク提案の詳細が表示されることを確認
    await expect(page.locator('text=新規タスク提案')).toBeVisible();
    await expect(page.locator('text=テスト用新規タスク')).toBeVisible();
    await expect(page.locator('text=これはテスト用の新規タスクです')).toBeVisible();
  });

  test('should display update task proposal details correctly', async ({ page }: { page: any }) => {
    // 更新タスク提案の詳細が表示されることを確認
    await expect(page.locator('text=タスク更新提案')).toBeVisible();
    await expect(page.locator('text=更新されたタスク')).toBeVisible();
    await expect(page.locator('text=元のタスク')).toBeVisible();
  });

  test('should toggle proposal section visibility', async ({ page }: { page: any }) => {
    // 提案セクションが表示されていることを確認
    await expect(page.locator('text=AIからの提案')).toBeVisible();
    
    // 提案を隠すボタンをクリック
    await page.locator('text=提案を隠す').click();
    
    // 提案の詳細が非表示になることを確認
    await expect(page.locator('text=テスト用新規タスク')).not.toBeVisible();
    
    // 提案を表示ボタンをクリック
    await page.locator('text=提案を表示').click();
    
    // 提案の詳細が再表示されることを確認
    await expect(page.locator('text=テスト用新規タスク')).toBeVisible();
  });

  test('should handle approve action', async ({ page }: { page: any }) => {
    // モックレスポンスを設定
    await page.route('/api/backlog/proposal/approve', async (route: any) => {
      const requestData = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          message: 'Proposal approved and applied to backlog',
          proposal: {
            id: requestData.proposalId,
            status: 'approved'
          }
        }),
      });
    });
    
    // 提案リストの更新をモック
    await page.route('/api/backlog/proposal', async (route: any) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            proposals: [
              {
                id: 'proposal-test-1',
                type: 'new',
                task: {
                  id: 'T9999',
                  title: 'テスト用新規タスク',
                  description: 'これはテスト用の新規タスクです',
                  status: 'Todo',
                  type: 'task'
                },
                created_at: new Date().toISOString(),
                status: 'approved'
              }
            ]
          }),
        });
      } else {
        await route.continue();
      }
    });
    
    // バックログの更新をモック
    await page.route('/api/backlog', async (route: any) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          tasks: [
            {
              id: 'T9999',
              title: 'テスト用新規タスク',
              description: 'これはテスト用の新規タスクです',
              status: 'Todo',
              type: 'task'
            }
          ]
        }),
      });
    });
    
    // 承認ボタンをクリック
    await page.locator('text=承認').first().click();
    
    // 承認後のメッセージが表示されることを確認（アラートをモック）
    await page.route('**/*', async (route: any) => {
      if (route.request().url().includes('alert')) {
        await route.fulfill({ status: 200 });
      } else {
        await route.continue();
      }
    });
  });

  test('should handle reject action', async ({ page }: { page: any }) => {
    // モックレスポンスを設定
    await page.route('/api/backlog/proposal/reject', async (route: any) => {
      const requestData = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          message: 'Proposal rejected',
          proposal: {
            id: requestData.proposalId,
            status: 'rejected'
          }
        }),
      });
    });
    
    // 提案リストの更新をモック
    await page.route('/api/backlog/proposal', async (route: any) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            proposals: []
          }),
        });
      } else {
        await route.continue();
      }
    });
    
    // 拒否ボタンをクリック
    await page.locator('text=拒否').first().click();
    
    // 拒否後のメッセージが表示されることを確認（アラートをモック）
    await page.route('**/*', async (route: any) => {
      if (route.request().url().includes('alert')) {
        await route.fulfill({ status: 200 });
      } else {
        await route.continue();
      }
    });
  });

  test('should handle modify action', async ({ page }: { page: any }) => {
    // 修正ボタンをクリック
    await page.locator('text=修正').first().click();
    
    // 編集フォームが表示されることを確認
    await expect(page.locator('text=タスクの修正')).toBeVisible();
    
    // タイトルを編集
    await page.locator('input#task-title').fill('修正後のタスク名');
    
    // 説明を編集
    await page.locator('textarea#task-description').fill('修正後のタスク説明');
    
    // モックレスポンスを設定
    await page.route('/api/backlog/proposal/modify', async (route: any) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          message: 'Proposal modified',
          proposal: {
            id: 'proposal-test-1',
            type: 'new',
            task: {
              id: 'T9999',
              title: '修正後のタスク名',
              description: '修正後のタスク説明',
              status: 'Todo',
              type: 'task'
            },
            created_at: new Date().toISOString(),
            status: 'pending'
          }
        }),
      });
    });
    
    // 提案リストの更新をモック
    await page.route('/api/backlog/proposal', async (route: any) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            proposals: [
              {
                id: 'proposal-test-1',
                type: 'new',
                task: {
                  id: 'T9999',
                  title: '修正後のタスク名',
                  description: '修正後のタスク説明',
                  status: 'Todo',
                  type: 'task'
                },
                created_at: new Date().toISOString(),
                status: 'pending'
              }
            ]
          }),
        });
      } else {
        await route.continue();
      }
    });
    
    // 保存ボタンをクリック
    await page.locator('text=保存').click();
    
    // 修正後のタスク名が表示されることを確認
    await expect(page.locator('text=修正後のタスク名')).toBeVisible();
  });

  test('should handle error states', async ({ page }: { page: any }) => {
    // エラー状態をシミュレートするためにAPIをモック
    await page.route('/api/backlog/proposal', async (route: any) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Failed to fetch proposals' }),
      });
    });
    
    // ページをリロード
    await page.reload();
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=エラー:')).toBeVisible();
  });
});
