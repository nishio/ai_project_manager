import { NextResponse } from 'next/server';
import { loadBacklogData, Backlog } from '../../../utils/backlogLoader';
import { loadBacklogFromFirestore } from '../../../utils/firebaseBacklogLoader';
import { ensureUser, getCurrentUser } from '../../../firebase/auth';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // テストモードの場合はテストデータを使用
    if (process.env.NEXT_PUBLIC_USE_TEST_MODE === 'true') {
      console.log('Using test data for backlog API');
      const testDataPath = path.join(process.cwd(), '..', 'test_data', 'sample_tasks.json');
      
      if (fs.existsSync(testDataPath)) {
        const fileContents = fs.readFileSync(testDataPath, 'utf8');
        const data = JSON.parse(fileContents);
        return NextResponse.json(data);
      } else {
        console.warn('Test data file not found, returning empty backlog');
        return NextResponse.json({ tasks: [] });
      }
    }
    
    // 通常のFirebaseロジック（既存のコード）
    const user = await ensureUser();
    
    if (user) {
      // User is authenticated (could be anonymous), load from Firestore
      const backlogData = await loadBacklogFromFirestore();
      return NextResponse.json(backlogData);
    } else {
      // Fallback to local file (should not happen with ensureUser)
      console.warn('Failed to ensure user authentication, falling back to local file');
      const backlogData = await loadBacklogData();
      return NextResponse.json(backlogData);
    }
  } catch (error) {
    console.error('Error fetching backlog data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backlog data' },
      { status: 500 }
    );
  }
}
