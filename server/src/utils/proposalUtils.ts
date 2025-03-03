import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Task } from './backlogLoader';
import { Proposal, ProposalList } from '../app/api/backlog/proposal/route';

/**
 * 提案用の一時IDを生成する
 * @returns 一意の提案ID
 */
export function generateProposalId(): string {
  return `proposal-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * タスク用の新しいIDを生成する
 * @param existingTasks 既存のタスクリスト
 * @returns 新しいタスクID (TXXXX形式)
 */
export function generateTaskId(existingTasks: Task[]): string {
  // 既存のタスクからIDを抽出
  const idPattern = /^T\d{4}$/;
  const existingIds = existingTasks
    .filter(task => idPattern.test(task.id))
    .map(task => task.id);

  // 使用されている数値を抽出してソート
  const usedNumbers = existingIds
    .map(id => parseInt(id.substring(1), 10))
    .sort((a, b) => a - b);

  // 次に利用可能な番号を見つける
  let nextNumber = 1;
  if (usedNumbers.length > 0) {
    for (let i = 0; i < usedNumbers.length; i++) {
      if (usedNumbers[i] !== i + 1) {
        nextNumber = i + 1;
        break;
      }
      nextNumber = usedNumbers[usedNumbers.length - 1] + 1;
    }
  }

  // TXXXX形式で返す
  return `T${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * 提案リストを読み込む
 * @returns 提案リスト
 */
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

/**
 * 提案リストを保存する
 * @param proposals 保存する提案リスト
 */
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

/**
 * 新しい提案を作成する
 * @param type 提案タイプ ('new' | 'update')
 * @param task 提案するタスク
 * @param originalTask 元のタスク (更新提案の場合)
 * @returns 作成された提案
 */
export function createProposal(
  type: 'new' | 'update',
  task: Task,
  originalTask?: Task
): Proposal {
  // 新規タスク提案の場合、タスクIDを生成
  if (type === 'new' && !task.id) {
    // この関数を呼び出す前に既存のタスクリストを取得して渡す必要がある
    // ここでは仮のIDを設定し、実際のIDは提案が承認されたときに生成する
    task.id = `T${Date.now().toString().substring(6)}`;
  }

  return {
    id: generateProposalId(),
    type,
    task,
    original_task: type === 'update' ? originalTask : undefined,
    created_at: new Date().toISOString(),
    status: 'pending'
  };
}

/**
 * 提案のステータスを更新する
 * @param proposalList 提案リスト
 * @param proposalId 提案ID
 * @param newStatus 新しいステータス
 * @returns 更新された提案リスト
 */
export function updateProposalStatus(
  proposalList: ProposalList,
  proposalId: string,
  newStatus: 'pending' | 'approved' | 'rejected'
): ProposalList {
  const updatedProposals = { ...proposalList };
  
  const proposalIndex = updatedProposals.proposals.findIndex(
    proposal => proposal.id === proposalId
  );
  
  if (proposalIndex !== -1) {
    updatedProposals.proposals[proposalIndex].status = newStatus;
  }
  
  return updatedProposals;
}

/**
 * 提案のタスクを更新する
 * @param proposalList 提案リスト
 * @param proposalId 提案ID
 * @param modifiedTask 修正されたタスク
 * @returns 更新された提案リスト
 */
export function updateProposalTask(
  proposalList: ProposalList,
  proposalId: string,
  modifiedTask: Task
): ProposalList {
  const updatedProposals = { ...proposalList };
  
  const proposalIndex = updatedProposals.proposals.findIndex(
    proposal => proposal.id === proposalId
  );
  
  if (proposalIndex !== -1) {
    updatedProposals.proposals[proposalIndex].task = modifiedTask;
  }
  
  return updatedProposals;
}
