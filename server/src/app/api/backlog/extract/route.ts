import { NextResponse } from 'next/server';
import { loadBacklogData, Task } from '../../../../utils/backlogLoader';
import { loadBacklogFromFirestore, saveBacklogToFirestore } from '../../../../utils/firebaseBacklogLoader';
import { ensureUser } from '../../../../firebase/auth';
import fs from 'fs';
import path from 'path';

// タスクIDの生成関数
function findNextAvailableId(tasks: Task[]): string {
  // タスクIDの形式はTXXXXで、Xは数字
  const idPattern = /^T\d{4}$/;
  const validIds = tasks
    .map(task => task.id)
    .filter(id => idPattern.test(id));
  
  const usedNumbers = validIds.map(id => parseInt(id.substring(1), 10)).sort((a, b) => a - b);
  
  // 使用されていない最小の番号を見つける
  for (let i = 1; i <= (usedNumbers.length > 0 ? usedNumbers[usedNumbers.length - 1] + 1 : 1); i++) {
    if (!usedNumbers.includes(i)) {
      return `T${i.toString().padStart(4, '0')}`;
    }
  }
  
  // 万が一見つからない場合は、最大値+1を返す
  return `T${(usedNumbers.length > 0 ? usedNumbers[usedNumbers.length - 1] + 1 : 1).toString().padStart(4, '0')}`;
}

// テキストからタスクを抽出する関数
async function extractTasksFromText(text: string): Promise<Task[]> {
  // 簡易的なタスク抽出ロジック
  // 実際のプロダクションでは、より高度なAIベースの抽出ロジックを使用することを推奨
  const tasks: Task[] = [];
  
  // 行ごとに分割
  const lines = text.split('\n');
  
  // 各行を処理
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 空行はスキップ
    if (!trimmedLine) continue;
    
    // タスクとして扱う基本的な条件（例：「- 」や「* 」で始まる行）
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      const taskTitle = trimmedLine.substring(2).trim();
      
      // タイトルが空でなければタスクとして追加
      if (taskTitle) {
        tasks.push({
          id: 'TEMP_ID', // 後で実際のIDに置き換える
          title: taskTitle,
          description: `【概要】\n${taskTitle}\n\n【詳細】\n${taskTitle}\n\n【出典】\nテキスト抽出: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`,
          status: 'Open',
          type: 'task',
          labels: ['from_text'],
          assignable_to: ['human', 'ai'],
          created: new Date().toISOString(),
        });
      }
    }
  }
  
  return tasks;
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    // テキストは必須
    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: 'テキストは必須です' },
        { status: 400 }
      );
    }

    // Ensure user is authenticated (anonymously if needed)
    const user = await ensureUser();
    let backlogData;
    
    if (user) {
      // User is authenticated (could be anonymous), load from Firestore
      backlogData = await loadBacklogFromFirestore();
    } else {
      // Fallback to local file (should not happen with ensureUser)
      console.warn('Failed to ensure user authentication, falling back to local file');
      backlogData = await loadBacklogData();
    }
    
    // テキストからタスクを抽出
    const extractedTasks = await extractTasksFromText(text);
    
    // 抽出されたタスクがない場合
    if (extractedTasks.length === 0) {
      return NextResponse.json(
        { error: 'テキストからタスクを抽出できませんでした' },
        { status: 400 }
      );
    }
    
    // 各タスクに一意のIDを割り当て
    const tasksWithIds = extractedTasks.map(task => {
      const newId = findNextAvailableId(backlogData.tasks);
      backlogData.tasks.push({ ...task, id: newId });
      return { ...task, id: newId };
    });

    if (user) {
      // User is authenticated, save to Firestore
      await saveBacklogToFirestore(backlogData);
    } else {
      // User is not authenticated, save to local file
      // テスト環境の場合はテストデータを使用
      let backlogPath = path.join(process.cwd(), '..', '..', 'ai_project_manager_data', 'tasks', 'backlog.json');
      if (process.env.USE_TEST_DATA === 'true') {
        backlogPath = path.join(process.cwd(), '..', 'tests', 'data', 'test_backlog.json');
      }

      // 更新されたデータをファイルに書き込む
      fs.writeFileSync(backlogPath, JSON.stringify(backlogData, null, 2), 'utf8');
    }

    return NextResponse.json({ 
      success: true, 
      tasks: tasksWithIds,
      count: tasksWithIds.length
    });
  } catch (error) {
    console.error('Error extracting tasks:', error);
    return NextResponse.json(
      { error: 'タスクの抽出に失敗しました' },
      { status: 500 }
    );
  }
}
