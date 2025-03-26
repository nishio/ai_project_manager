import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// テストデータのパス
const TEST_DATA_PATH = path.join(process.cwd(), '..', 'test_data', 'sample_tasks.json');

// GET: テストデータを取得
export async function GET() {
  try {
    // ファイルが存在するか確認
    if (!fs.existsSync(TEST_DATA_PATH)) {
      return NextResponse.json(
        { tasks: [] },
        { status: 200 }
      );
    }

    // ファイルを読み込む
    const fileContents = fs.readFileSync(TEST_DATA_PATH, 'utf8');
    const data = JSON.parse(fileContents);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading test data:', error);
    return NextResponse.json(
      { error: 'Failed to load test data' },
      { status: 500 }
    );
  }
}

// POST: テストデータを保存
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // ディレクトリが存在するか確認
    const dir = path.dirname(TEST_DATA_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // ファイルに書き込む
    fs.writeFileSync(TEST_DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving test data:', error);
    return NextResponse.json(
      { error: 'Failed to save test data' },
      { status: 500 }
    );
  }
}
