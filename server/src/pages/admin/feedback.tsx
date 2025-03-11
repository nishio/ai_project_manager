import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { getAllFeedback } from '../../firebase/firestore';
import { useAuth } from '../../components/auth/AuthProvider';
import Link from 'next/link';

// 管理者のメールアドレスリスト（実際の実装では環境変数や設定ファイルから読み込むべき）
const ADMIN_EMAILS = ['admin@example.com'];

interface FeedbackItem {
  id: string;
  content: string;
  rating: number;
  createdAt: string;
  userEmail?: string;
}

export default function AdminFeedbackPage() {
  const { user } = useAuth();
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 管理者権限チェック
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!user || !isAdmin) return;

      try {
        setLoading(true);
        const feedbackSnapshot = await getAllFeedback();
        
        const feedbackItems: FeedbackItem[] = [];
        feedbackSnapshot.forEach(doc => {
          const data = doc.data();
          feedbackItems.push({
            id: doc.id,
            content: data.content || '',
            rating: data.rating || 0,
            createdAt: data.createdAt ? new Date(data.createdAt.toDate()).toISOString() : '',
            userEmail: data.userEmail || '匿名'
          });
        });
        
        // 日付の新しい順にソート
        feedbackItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setFeedbackList(feedbackItems);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError('フィードバックの取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [user, isAdmin]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-center text-red-600">ログインしてください</p>
            <div className="mt-4 text-center">
              <Link href="/login" className="text-blue-600 hover:text-blue-800">
                ログインページへ
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-center text-red-600">このページにアクセスする権限がありません</p>
            <div className="mt-4 text-center">
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                ホームに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">
              管理者ページ - フィードバック一覧
            </h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">フィードバックを読み込み中...</p>
            </div>
          ) : feedbackList.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-600">フィードバックはまだありません</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日時
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ユーザー
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      評価
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      フィードバック
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feedbackList.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.userEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`h-5 w-5 ${
                                i < item.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.content}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
