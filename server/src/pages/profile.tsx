import React, { useState } from 'react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuth } from '../components/auth/AuthProvider';
import Link from 'next/link';
// No need for Header component as it's included inline

export default function ProfilePage() {
  const { user } = useAuth();
  const [showMigration, setShowMigration] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                AIプロジェクトマネージャー
              </Link>
            </div>
            
            <nav className="flex space-x-4 items-center">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                ホーム
              </Link>
              <Link href="/app" className="text-gray-600 hover:text-gray-900">
                アプリ
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-gray-900 font-medium">
                プロフィール
              </Link>
            </nav>
          </div>
        </div>
      </header>
        
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">ユーザープロフィール</h1>
            
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium text-gray-700">アカウント情報</h2>
                <div className="mt-2 p-4 bg-gray-50 rounded-md">
                  <p><span className="font-medium">メールアドレス:</span> {user?.email}</p>
                  <p><span className="font-medium">ユーザーID:</span> {user?.uid}</p>
                  <p><span className="font-medium">作成日:</span> {user?.metadata.creationTime}</p>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-medium text-gray-700">データ管理</h2>
                <div className="mt-2 space-y-2">
                  <button
                    onClick={() => setShowMigration(!showMigration)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {showMigration ? 'データ移行オプションを隠す' : 'データ移行オプションを表示'}
                  </button>
                  
                  {showMigration && (
                    <div className="p-4 bg-blue-50 rounded-md">
                      <p className="mb-2">ローカルのJSONファイルとFirestoreデータベース間でデータを移行できます。</p>
                      <Link 
                        href="/migrate" 
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        データ移行ツールへ
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-medium text-gray-700">フィードバック</h2>
                <div className="mt-2">
                  <p className="mb-2">AIプロジェクトマネージャーの改善にご協力ください。</p>
                  <Link 
                    href="/feedback" 
                    className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    フィードバックを送信
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
