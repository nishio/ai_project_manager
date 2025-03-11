import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { loadBacklogData, Task } from '../../../../utils/backlogLoader';
import { loadBacklogFromFirestore, saveBacklogToFirestore, addTaskToFirestore } from '../../../../utils/firebaseBacklogLoader';
import { getCurrentUser } from '../../../../firebase/auth';

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

export async function POST(request: Request) {
  try {
    const { title, description = '' } = await request.json();

    // タイトルは必須
    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'タイトルは必須です' },
        { status: 400 }
      );
    }

    // Check if user is authenticated
    const user = getCurrentUser();
    let backlogData;
    
    if (user) {
      // User is authenticated, load from Firestore
      backlogData = await loadBacklogFromFirestore();
    } else {
      // User is not authenticated, load from local file
      backlogData = await loadBacklogData();
    }
    
    // 新しいタスクを作成
    const newTask: Task = {
      id: findNextAvailableId(backlogData.tasks),
      status: 'Open',
      title: title.trim(),
      description: description || '',
      type: 'task',
      labels: [],
      assignable_to: [],
      created: new Date().toISOString(), // タスク作成日時を追加
    };

    // タスクをバックログに追加
    backlogData.tasks.push(newTask);

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

    return NextResponse.json({ success: true, task: newTask });
  } catch (error) {
    console.error('Error adding task:', error);
    return NextResponse.json(
      { error: 'タスクの追加に失敗しました' },
      { status: 500 }
    );
  }
}
