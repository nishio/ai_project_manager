import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Backlog API', () => {
  test('should return backlog data', async ({ request }) => {

    process.env.USE_TEST_DATA = 'true';

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
    const testDataPath = path.join(process.cwd(), '..', 'tests', 'data', 'test_backlog.json');
    const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
    
    // テストデータと一致することを確認
    expect(data).toEqual(testData);
  });
});
