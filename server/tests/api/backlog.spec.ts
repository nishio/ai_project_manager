import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Backlog API', () => {
  test('should return backlog data', async ({ request }) => {
    // APIエンドポイントにリクエストを送信
    const response = await request.get('/api/backlog');
    
    // レスポンスのステータスコードが200であることを確認
    expect(response.status()).toBe(200);
    
    // レスポンスのJSONデータを取得
    const data = await response.json();
    
    // データが期待する形式であることを確認
    expect(data).toHaveProperty('tasks');
    expect(Array.isArray(data.tasks)).toBe(true);
    
    // テストデータを読み込んで比較
    const testDataPath = path.join(process.cwd(), '..', '..', 'tests', 'data', 'test_backlog.json');
    const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
    
    // テストデータと一致することを確認
    expect(data).toEqual(testData);
  });

  test('should handle errors gracefully', async ({ request }) => {
    // 環境変数を一時的に変更してエラーを発生させる
    const originalTestData = process.env.USE_TEST_DATA;
    process.env.USE_TEST_DATA = 'false';
    
    // 無効なパスを設定（エラーを発生させるため）
    // NODE_ENVは読み取り専用なので変更しない
    
    // APIエンドポイントにリクエストを送信
    const response = await request.get('/api/backlog');
    
    // 環境変数を元に戻す
    process.env.USE_TEST_DATA = originalTestData;
    
    // エラー時でもレスポンスが返ることを確認
    expect(response.status()).toBe(500);
    
    // エラーメッセージが含まれていることを確認
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
});
