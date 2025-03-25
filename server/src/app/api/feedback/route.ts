import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../firebase/auth';
import { storeFeedback } from '../../../firebase/firestore';

export async function POST(request: Request) {
  try {
    const { content, rating } = await request.json();

    // バリデーション
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'フィードバック内容は必須です' },
        { status: 400 }
      );
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: '評価は1から5の数値で指定してください' },
        { status: 400 }
      );
    }

    // 認証確認
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'フィードバックを送信するにはログインが必要です' },
        { status: 401 }
      );
    }

    // フィードバックデータの作成
    const feedbackData = {
      content: content.trim(),
      rating,
      createdAt: new Date().toISOString(),
      userEmail: user.email || '匿名'
    };

    // Firestoreに保存
    await storeFeedback(user.uid, feedbackData);

    return NextResponse.json({ 
      success: true, 
      message: 'フィードバックを送信しました。ありがとうございます！' 
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'フィードバック送信中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
