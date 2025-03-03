import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { loadBacklogData, Backlog, Task } from '../../../../../utils/backlogLoader';
import { loadProposals, saveProposals, Proposal, ProposalList } from '../route';

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
    const proposalIndex = proposalList.proposals.findIndex((proposal: Proposal) => proposal.id === proposalId);
    
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

    // バックログデータを読み込む
    const backlogData = await loadBacklogData();

    // 提案タイプに応じて処理
    if (proposal.type === 'new') {
      // 新規タスクの場合はバックログに追加
      backlogData.tasks.push(proposal.task);
    } else if (proposal.type === 'update') {
      // 更新タスクの場合は既存のタスクを更新
      const taskIndex = backlogData.tasks.findIndex(task => task.id === proposal.task.id);
      
      if (taskIndex === -1) {
        return NextResponse.json(
          { error: 'Task to update not found in backlog' },
          { status: 404 }
        );
      }

      // タスクを更新
      backlogData.tasks[taskIndex] = proposal.task;
    }

    // テスト環境の場合はテストデータを使用
    let backlogPath = path.join(process.cwd(), '..', '..', 'ai_project_manager_data', 'tasks', 'backlog.json');
    if (process.env.USE_TEST_DATA === 'true') {
      backlogPath = path.join(process.cwd(), '..', 'tests', 'data', 'test_backlog.json');
    }

    // 更新されたデータをファイルに書き込む
    fs.writeFileSync(backlogPath, JSON.stringify(backlogData, null, 2), 'utf8');

    // 提案のステータスを更新
    proposalList.proposals[proposalIndex].status = 'approved';

    // 提案リストを保存
    await saveProposals(proposalList);

    return NextResponse.json({ 
      success: true, 
      message: 'Proposal approved and applied to backlog',
      proposal: proposalList.proposals[proposalIndex]
    });
  } catch (error) {
    console.error('Error approving proposal:', error);
    return NextResponse.json(
      { error: 'Failed to approve proposal' },
      { status: 500 }
    );
  }
}
