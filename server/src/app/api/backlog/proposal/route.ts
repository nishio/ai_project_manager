import { NextResponse } from 'next/server';
import { 
  loadProposals, 
  saveProposals, 
  Proposal, 
  ProposalType, 
  ProposalList,
  generateProposalId
} from '../../../../utils/proposalUtils';
import { loadBacklogData, Task } from '../../../../utils/backlogLoader';
import { getCurrentUser } from '../../../../firebase/auth';
import { 
  getUserProposals, 
  storeTaskProposal, 
  updateProposalStatus 
} from '../../../../firebase/firestore';

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

    // 認証済みユーザーの確認
    const user = getCurrentUser();
    let newProposal: Proposal;
    
    // 新しい提案を作成
    newProposal = {
      id: generateProposalId(),
      type,
      task,
      original_task: type === 'update' ? original_task : undefined,
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    if (user) {
      // 認証済みユーザーの場合はFirestoreに保存
      try {
        await storeTaskProposal(user.uid, task.id, {
          type,
          task,
          original_task: type === 'update' ? original_task : undefined,
          status: 'pending'
        });
        
        return NextResponse.json({ success: true, proposal: newProposal });
      } catch (firestoreError) {
        console.error('Error storing proposal in Firestore:', firestoreError);
        // Firestoreへの保存に失敗した場合はファイルシステムにフォールバック
      }
    }
    
    // ファイルシステムへの保存（認証なしまたはFirestoreエラー時）
    // 提案リストを読み込む
    const proposalList = await loadProposals();

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
