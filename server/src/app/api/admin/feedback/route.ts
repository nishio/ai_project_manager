import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../firebase/auth';
import { getAllFeedback } from '../../../../firebase/firestore';

// 管理者のメールアドレスリスト（実際の実装では環境変数や設定ファイルから読み込むべき）
const ADMIN_EMAILS = ['admin@example.com'];

export async function GET() {
  try {
    // 認証確認
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }

    // 管理者権限チェック
    if (!ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json(
        { error: '管理者権限がありません' },
        { status: 403 }
      );
    }

    // フィードバックデータの取得
    const feedbackSnapshot = await getAllFeedback();
    
    interface FeedbackItem {
      id: string;
      content: string;
      rating: number;
      createdAt: string;
      userEmail: string;
    }
    
    const feedbackItems: FeedbackItem[] = [];
    feedbackSnapshot.forEach(doc => {
      const data = doc.data();
      feedbackItems.push({
        id: doc.id,
        content: data.content || '',
        rating: data.rating || 0,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : '',
        userEmail: data.userEmail || '匿名'
      });
    });
    
    // 日付の新しい順にソート
    feedbackItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ feedback: feedbackItems });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'フィードバックの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
