import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Proposal API', () => {
  // テスト前にテストデータを準備
  test.beforeEach(async () => {
    process.env.USE_TEST_DATA = 'true';
    
    // テスト用の提案データを作成
    const testProposalsPath = path.join(process.cwd(), '..', 'tests', 'data', 'test_proposals.json');
    
    // ディレクトリが存在しない場合は作成
    const dir = path.dirname(testProposalsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // 提案リストを空にする
    const emptyProposals = { proposals: [] };
    fs.writeFileSync(testProposalsPath, JSON.stringify(emptyProposals, null, 2), 'utf8');
    console.log(`Empty proposals written to ${testProposalsPath}`);
    
    // テスト用のバックログデータを確認
    const testBacklogPath = path.join(process.cwd(), '..', 'tests', 'data', 'test_backlog.json');
    if (!fs.existsSync(testBacklogPath)) {
      const emptyBacklog = { tasks: [] };
      fs.writeFileSync(testBacklogPath, JSON.stringify(emptyBacklog, null, 2), 'utf8');
    }
  });
  
  // テスト後にテストデータをクリーンアップ
  test.afterEach(async () => {
    // テスト用の提案データをクリーンアップ
    const testProposalsPath = path.join(process.cwd(), '..', 'tests', 'data', 'test_proposals.json');
    if (fs.existsSync(testProposalsPath)) {
      const emptyProposals = { proposals: [] };
      fs.writeFileSync(testProposalsPath, JSON.stringify(emptyProposals, null, 2), 'utf8');
      console.log(`Test proposals cleaned up at ${testProposalsPath}`);
    }
    
    process.env.USE_TEST_DATA = undefined;
  });

  test('should return empty proposals list initially', async ({ request }: { request: any }) => {
    // APIエンドポイントにリクエストを送信
    const response = await request.get('/api/backlog/proposal');
    
    // レスポンスのステータスコードが200であることを確認
    expect(response.status()).toBe(200);
    
    // レスポンスのJSONデータを取得
    const data = await response.json();
    
    // データが期待する形式であることを確認
    expect(data).toHaveProperty('proposals');
    expect(Array.isArray(data.proposals)).toBe(true);
    expect(data.proposals.length).toBe(0);
  });

  test('should create a new proposal', async ({ request }: { request: any }) => {
    // 新しい提案を作成
    const newProposal = {
      type: 'new',
      task: {
        id: 'T9999',
        title: 'テスト用タスク',
        description: 'これはテスト用のタスクです',
        status: 'Todo',
        type: 'task'
      }
    };
    
    // APIエンドポイントにPOSTリクエストを送信
    const response = await request.post('/api/backlog/proposal', {
      data: newProposal
    });
    
    // レスポンスのステータスコードが200であることを確認
    expect(response.status()).toBe(200);
    
    // レスポンスのJSONデータを取得
    const data = await response.json();
    
    // データが期待する形式であることを確認
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('proposal');
    expect(data.proposal).toHaveProperty('id');
    expect(data.proposal).toHaveProperty('type', 'new');
    expect(data.proposal).toHaveProperty('task');
    expect(data.proposal).toHaveProperty('created_at');
    expect(data.proposal).toHaveProperty('status', 'pending');
    
    // 提案リストを取得して確認
    const listResponse = await request.get('/api/backlog/proposal');
    const listData = await listResponse.json();
    
    expect(listData.proposals.length).toBe(1);
    expect(listData.proposals[0].task.title).toBe('テスト用タスク');
  });

  test('should create an update proposal', async ({ request }: { request: any }) => {
    // 更新提案を作成
    const updateProposal = {
      type: 'update',
      task: {
        id: 'T0001',
        title: '更新されたタスク',
        description: 'これは更新されたタスクです',
        status: 'In Progress',
        type: 'task'
      },
      original_task: {
        id: 'T0001',
        title: '元のタスク',
        description: '元のタスクの説明',
        status: 'Todo',
        type: 'task'
      }
    };
    
    // APIエンドポイントにPOSTリクエストを送信
    const response = await request.post('/api/backlog/proposal', {
      data: updateProposal
    });
    
    // レスポンスのステータスコードが200であることを確認
    expect(response.status()).toBe(200);
    
    // レスポンスのJSONデータを取得
    const data = await response.json();
    
    // データが期待する形式であることを確認
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('proposal');
    expect(data.proposal).toHaveProperty('id');
    expect(data.proposal).toHaveProperty('type', 'update');
    expect(data.proposal).toHaveProperty('task');
    expect(data.proposal).toHaveProperty('original_task');
    expect(data.proposal).toHaveProperty('created_at');
    expect(data.proposal).toHaveProperty('status', 'pending');
  });

  test('should approve a proposal', async ({ request }: { request: any }) => {
    // 新しい提案を作成
    const newProposal = {
      type: 'new',
      task: {
        id: 'T9998',
        title: '承認テスト用タスク',
        description: 'これは承認テスト用のタスクです',
        status: 'Todo',
        type: 'task'
      }
    };
    
    // 提案を作成
    const createResponse = await request.post('/api/backlog/proposal', {
      data: newProposal
    });
    const createData = await createResponse.json();
    const proposalId = createData.proposal.id;
    
    // 提案を承認
    const approveResponse = await request.post('/api/backlog/proposal/approve', {
      data: { proposalId }
    });
    
    // レスポンスのステータスコードが200であることを確認
    expect(approveResponse.status()).toBe(200);
    
    // レスポンスのJSONデータを取得
    const approveData = await approveResponse.json();
    
    // データが期待する形式であることを確認
    expect(approveData).toHaveProperty('success', true);
    expect(approveData).toHaveProperty('message', 'Proposal approved and applied to backlog');
    expect(approveData).toHaveProperty('proposal');
    expect(approveData.proposal).toHaveProperty('status', 'approved');
    
    // 提案リストを取得して確認
    const listResponse = await request.get('/api/backlog/proposal');
    const listData = await listResponse.json();
    
    // 提案のステータスが承認済みになっていることを確認
    const updatedProposal = listData.proposals.find((p: any) => p.id === proposalId);
    expect(updatedProposal).toBeDefined();
    expect(updatedProposal.status).toBe('approved');
    
    // バックログを取得して確認
    const backlogResponse = await request.get('/api/backlog');
    const backlogData = await backlogResponse.json();
    
    // バックログにタスクが追加されていることを確認
    const addedTask = backlogData.tasks.find((t: any) => t.title === '承認テスト用タスク');
    expect(addedTask).toBeDefined();
  });

  test('should reject a proposal', async ({ request }: { request: any }) => {
    // 新しい提案を作成
    const newProposal = {
      type: 'new',
      task: {
        id: 'T9997',
        title: '拒否テスト用タスク',
        description: 'これは拒否テスト用のタスクです',
        status: 'Todo',
        type: 'task'
      }
    };
    
    // 提案を作成
    const createResponse = await request.post('/api/backlog/proposal', {
      data: newProposal
    });
    const createData = await createResponse.json();
    const proposalId = createData.proposal.id;
    
    // 提案を拒否
    const rejectResponse = await request.post('/api/backlog/proposal/reject', {
      data: { proposalId }
    });
    
    // レスポンスのステータスコードが200であることを確認
    expect(rejectResponse.status()).toBe(200);
    
    // レスポンスのJSONデータを取得
    const rejectData = await rejectResponse.json();
    
    // データが期待する形式であることを確認
    expect(rejectData).toHaveProperty('success', true);
    expect(rejectData).toHaveProperty('message', 'Proposal rejected');
    expect(rejectData).toHaveProperty('proposal');
    expect(rejectData.proposal).toHaveProperty('status', 'rejected');
    
    // 提案リストを取得して確認
    const listResponse = await request.get('/api/backlog/proposal');
    const listData = await listResponse.json();
    
    // 提案のステータスが拒否済みになっていることを確認
    const updatedProposal = listData.proposals.find((p: any) => p.id === proposalId);
    expect(updatedProposal).toBeDefined();
    expect(updatedProposal.status).toBe('rejected');
  });

  test('should modify a proposal', async ({ request }: { request: any }) => {
    // 新しい提案を作成
    const newProposal = {
      type: 'new',
      task: {
        id: 'T9996',
        title: '修正テスト用タスク',
        description: 'これは修正テスト用のタスクです',
        status: 'Todo',
        type: 'task'
      }
    };
    
    // 提案を作成
    const createResponse = await request.post('/api/backlog/proposal', {
      data: newProposal
    });
    const createData = await createResponse.json();
    const proposalId = createData.proposal.id;
    
    // 修正するタスク
    const modifiedTask = {
      id: 'T9996',
      title: '修正後のタスク',
      description: 'これは修正後のタスクです',
      status: 'In Progress',
      type: 'task'
    };
    
    // 提案を修正
    const modifyResponse = await request.post('/api/backlog/proposal/modify', {
      data: { proposalId, modifiedTask }
    });
    
    // レスポンスのステータスコードが200であることを確認
    expect(modifyResponse.status()).toBe(200);
    
    // レスポンスのJSONデータを取得
    const modifyData = await modifyResponse.json();
    
    // データが期待する形式であることを確認
    expect(modifyData).toHaveProperty('success', true);
    expect(modifyData).toHaveProperty('message', 'Proposal modified');
    expect(modifyData).toHaveProperty('proposal');
    
    // 提案リストを取得して確認
    const listResponse = await request.get('/api/backlog/proposal');
    const listData = await listResponse.json();
    
    // 提案のタスクが修正されていることを確認
    const updatedProposal = listData.proposals.find((p: any) => p.id === proposalId);
    expect(updatedProposal).toBeDefined();
    expect(updatedProposal.task.title).toBe('修正後のタスク');
    expect(updatedProposal.task.description).toBe('これは修正後のタスクです');
    expect(updatedProposal.task.status).toBe('In Progress');
  });
});
