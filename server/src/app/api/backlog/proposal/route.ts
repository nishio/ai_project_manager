import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { loadBacklogData, Task } from '../../../../utils/backlogLoader';

// 提案タイプの定義
export type ProposalType = 'new' | 'update';

// 提案の型定義
export interface Proposal {
  id: string;
  type: ProposalType;
  task: Task;
  original_task?: Task;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

// 提案リストの型定義
export interface ProposalList {
  proposals: Proposal[];
}

// 提案リストを読み込む関数
export async function loadProposals(): Promise<ProposalList> {
  try {
    // デフォルトのパス
    let proposalsPath = path.join(process.cwd(), '..', '..', 'ai_project_manager_data', 'tasks', 'pending_proposals.json');
    
    // テスト環境の場合はテストデータを使用
    if (process.env.USE_TEST_DATA === 'true') {
      proposalsPath = path.join(process.cwd(), '..', 'tests', 'data', 'test_proposals.json');
      
      // テスト環境では、テストデータが存在しない場合にデフォルトのテストデータを提供
      // ただし、環境変数 SKIP_DEFAULT_PROPOSALS が設定されている場合はデフォルトデータを提供しない
      if (process.env.SKIP_DEFAULT_PROPOSALS !== 'true' && 
          (!fs.existsSync(proposalsPath) || fs.readFileSync(proposalsPath, 'utf8').trim() === '{}' || fs.readFileSync(proposalsPath, 'utf8').includes('"proposals": []'))) {
        console.log('Creating default test proposals data');
        const testProposals: ProposalList = {
          proposals: [
            {
              id: 'proposal-test-1',
              type: 'new',
              task: {
                id: 'T9999',
                title: 'テスト用新規タスク',
                description: 'これはテスト用の新規タスクです',
                status: 'Todo',
                type: 'task',
                labels: [],
                assignable_to: []
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
                type: 'task',
                labels: [],
                assignable_to: []
              },
              original_task: {
                id: 'T0001',
                title: '元のタスク',
                description: '元のタスクの説明',
                status: 'Todo',
                type: 'task',
                labels: [],
                assignable_to: []
              },
              created_at: new Date().toISOString(),
              status: 'pending'
            }
          ]
        };
        
        try {
          // ディレクトリが存在しない場合は作成
          const dir = path.dirname(proposalsPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          fs.writeFileSync(proposalsPath, JSON.stringify(testProposals, null, 2), 'utf8');
          return testProposals;
        } catch (writeError) {
          console.error('Error writing default test proposals:', writeError);
          // 書き込みに失敗した場合でもデフォルトデータを返す
          return testProposals;
        }
      }
    }

    // ファイルの存在確認
    if (!fs.existsSync(proposalsPath)) {
      // ファイルが存在しない場合は空のリストを作成
      const emptyList: ProposalList = { proposals: [] };
      
      try {
        // ディレクトリが存在しない場合は作成
        const dir = path.dirname(proposalsPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(proposalsPath, JSON.stringify(emptyList, null, 2), 'utf8');
      } catch (writeError) {
        console.error('Error creating empty proposals file:', writeError);
      }
      
      return emptyList;
    }

    const fileContents = fs.readFileSync(proposalsPath, 'utf8');
    const data = JSON.parse(fileContents) as ProposalList;
    return data;
  } catch (error) {
    console.error('Error loading proposals data:', error);
    return { proposals: [] };
  }
}

// 提案リストを保存する関数
export async function saveProposals(proposals: ProposalList): Promise<void> {
  try {
    // デフォルトのパス
    let proposalsPath = path.join(process.cwd(), '..', '..', 'ai_project_manager_data', 'tasks', 'pending_proposals.json');
    
    // テスト環境の場合はテストデータを使用
    if (process.env.USE_TEST_DATA === 'true') {
      proposalsPath = path.join(process.cwd(), '..', 'tests', 'data', 'test_proposals.json');
    }

    // ディレクトリが存在しない場合は作成
    const dir = path.dirname(proposalsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 提案リストを保存
    fs.writeFileSync(proposalsPath, JSON.stringify(proposals, null, 2), 'utf8');
    console.log(`Saved proposals to ${proposalsPath}`);
  } catch (error) {
    console.error('Error saving proposals data:', error);
    throw error;
  }
}

// 新しい提案IDを生成する関数
function generateProposalId(): string {
  return `proposal-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// GET: 提案リストを取得
export async function GET() {
  try {
    const proposalList = await loadProposals();
    return NextResponse.json(proposalList);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    );
  }
}

// POST: 新しい提案を追加
export async function POST(request: Request) {
  try {
    const { type, task, original_task } = await request.json();

    if (!type || !task) {
      return NextResponse.json(
        { error: 'Type and task are required' },
        { status: 400 }
      );
    }

    // 提案タイプの検証
    if (type !== 'new' && type !== 'update') {
      return NextResponse.json(
        { error: 'Invalid proposal type' },
        { status: 400 }
      );
    }

    // 更新提案の場合は元のタスクが必要
    if (type === 'update' && !original_task) {
      return NextResponse.json(
        { error: 'Original task is required for update proposals' },
        { status: 400 }
      );
    }

    // 提案リストを読み込む
    const proposalList = await loadProposals();

    // 新しい提案を作成
    const newProposal: Proposal = {
      id: generateProposalId(),
      type,
      task,
      original_task: type === 'update' ? original_task : undefined,
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    // 提案リストに追加
    proposalList.proposals.push(newProposal);

    // 提案リストを保存
    await saveProposals(proposalList);

    return NextResponse.json({ success: true, proposal: newProposal });
  } catch (error) {
    console.error('Error creating proposal:', error);
    return NextResponse.json(
      { error: 'Failed to create proposal' },
      { status: 500 }
    );
  }
}
