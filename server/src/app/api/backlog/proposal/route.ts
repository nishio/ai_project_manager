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
    }

    // ファイルの存在確認
    if (!fs.existsSync(proposalsPath)) {
      // ファイルが存在しない場合は空のリストを作成
      const emptyList: ProposalList = { proposals: [] };
      fs.writeFileSync(proposalsPath, JSON.stringify(emptyList, null, 2), 'utf8');
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

    // 提案リストを保存
    fs.writeFileSync(proposalsPath, JSON.stringify(proposals, null, 2), 'utf8');
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
