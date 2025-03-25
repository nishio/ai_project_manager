import { NextResponse } from 'next/server';
import { loadProposals, saveProposals, Proposal } from '../../../../../utils/proposalUtils';

export async function POST(request: Request) {
  try {
    const { proposalId, modifiedTask } = await request.json();

    if (!proposalId || !modifiedTask) {
      return NextResponse.json(
        { error: 'Proposal ID and modified task are required' },
        { status: 400 }
      );
    }

    // 提案リストを読み込む
    const proposalList = await loadProposals();
    
    // 指定されたIDの提案を検索
    const proposalIndex = proposalList.proposals.findIndex(proposal => proposal.id === proposalId);
    
    if (proposalIndex === -1) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    // 提案を取得
    const proposal = proposalList.proposals[proposalIndex];

    // 提案のステータスを確認
    if (proposal.status !== 'pending') {
      return NextResponse.json(
        { error: 'Proposal is not pending' },
        { status: 400 }
      );
    }

    // 提案のタスクを更新
    proposalList.proposals[proposalIndex].task = modifiedTask;

    // 提案リストを保存
    await saveProposals(proposalList);

    return NextResponse.json({ 
      success: true, 
      message: 'Proposal modified',
      proposal: proposalList.proposals[proposalIndex]
    });
  } catch (error) {
    console.error('Error modifying proposal:', error);
    return NextResponse.json(
      { error: 'Failed to modify proposal' },
      { status: 500 }
    );
  }
}
