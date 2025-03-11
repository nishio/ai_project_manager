import React from 'react';
import Link from 'next/link';
import { useAuth } from '../components/auth/AuthProvider';

export default function LandingPage() {
  const { user, loading } = useAuth();

  return (
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
              <Link href="/tasks" className="text-gray-600 hover:text-gray-900">
                タスク
              </Link>
              <Link href="/feedback" className="text-gray-600 hover:text-gray-900">
                フィードバック
              </Link>
              
              {/* 認証状態に基づいたナビゲーション */}
              {loading ? (
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {user.email?.split('@')[0] || 'ユーザー'}
                  </span>
                  <div className="flex space-x-2">
                    <Link 
                      href="/profile" 
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      プロフィール
                    </Link>
                    <Link
                      href="/app"
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      アプリへ
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link 
                    href="/login" 
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    ログイン
                  </Link>
                  <Link 
                    href="/register" 
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    登録
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            AIプロジェクトマネージャー
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            AIを活用したプロジェクト管理ツール
          </p>
          
          {!loading && !user && (
            <div className="mt-6">
              <Link
                href="/register"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-700"
              >
                今すぐ始める
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="block bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900">タスク管理</h3>
              <p className="mt-2 text-gray-600">
                プロジェクトのタスクを作成、編集、管理します
              </p>
            </div>
          </div>

          <div className="block bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900">AI支援</h3>
              <p className="mt-2 text-gray-600">
                AIからの提案をレビューして承認または却下します
              </p>
            </div>
          </div>

          <div className="block bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900">マルチユーザー対応</h3>
              <p className="mt-2 text-gray-600">
                複数ユーザーでのプロジェクト管理が可能になりました
              </p>
            </div>
          </div>
        </div>
        
        {/* 特徴セクション */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">主な特徴</h2>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">クラウド同期</h3>
              <p>Firebaseを使用したデータの同期により、どこからでもアクセス可能です。</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">AIによる提案</h3>
              <p>AIがタスクの整理や優先順位付けを支援し、効率的なプロジェクト管理をサポートします。</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">セキュアな認証</h3>
              <p>Firebase認証によるセキュアなアクセス制御で、データを安全に保護します。</p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white mt-16 pt-8 pb-6 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} AIプロジェクトマネージャー</p>
            <p className="mt-2">
              <Link href="/feedback" className="text-blue-600 hover:text-blue-800">
                フィードバック
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
