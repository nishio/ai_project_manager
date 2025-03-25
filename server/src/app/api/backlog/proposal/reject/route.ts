import { NextResponse } from 'next/server';
import { loadProposals, saveProposals } from '../../../../../utils/proposalUtils';

export async function POST(request: Request) {
  try {
    const { proposalId } = await request.json();

    if (!proposalId) {
      return NextResponse.json(
        { error: 'Proposal ID is required' },
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

    // 提案のステータスを更新
    proposalList.proposals[proposalIndex].status = 'rejected';

    // 提案リストを保存
    await saveProposals(proposalList);

    return NextResponse.json({ 
      success: true, 
      message: 'Proposal rejected',
      proposal: proposalList.proposals[proposalIndex]
    });
  } catch (error) {
    console.error('Error rejecting proposal:', error);
    return NextResponse.json(
      { error: 'Failed to reject proposal' },
      { status: 500 }
    );
  }
}
