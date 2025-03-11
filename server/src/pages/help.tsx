import React from 'react';
import Link from 'next/link';

export default function HelpPage() {
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
              <Link href="/app" className="text-gray-600 hover:text-gray-900">
                アプリ
              </Link>
              <Link href="/help" className="text-gray-600 hover:text-gray-900 font-medium">
                ヘルプ
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              AIプロジェクトマネージャー ヘルプドキュメント
            </h1>
            
            <div className="space-y-8">
              {/* 基本操作 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4" id="basics">
                  基本操作
                </h2>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">タスクの作成</h3>
                    <p className="text-gray-600">
                      1. アプリ画面の「+タスク追加」ボタンをクリックします。<br />
                      2. タイトル（必須）と説明（任意）を入力します。<br />
                      3. 必要に応じてラベルを追加します。<br />
                      4. 「保存」ボタンをクリックして、タスクを作成します。
                    </p>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">タスクの編集</h3>
                    <p className="text-gray-600">
                      1. 編集したいタスクカードをクリックします。<br />
                      2. タスク詳細画面で情報を編集します。<br />
                      3. 「保存」ボタンをクリックして、変更を保存します。
                    </p>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">タスクのステータス変更</h3>
                    <p className="text-gray-600">
                      1. タスクカードの「ステータス」ドロップダウンをクリックします。<br />
                      2. 新しいステータス（Open、In Progress、Done）を選択します。<br />
                      3. 変更は自動的に保存されます。
                    </p>
                  </div>
                </div>
              </section>
              
              {/* AI機能 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4" id="ai">
                  AI機能
                </h2>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">AI提案の確認</h3>
                    <p className="text-gray-600">
                      1. 「提案」タブをクリックします。<br />
                      2. AIからの提案一覧が表示されます。<br />
                      3. 各提案の詳細を確認できます。
                    </p>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">提案の承認/却下</h3>
                    <p className="text-gray-600">
                      1. 提案の詳細を確認します。<br />
                      2. 「承認」または「却下」ボタンをクリックします。<br />
                      3. 承認した提案は自動的に適用されます。
                    </p>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">AIの学習</h3>
                    <p className="text-gray-600">
                      AIはあなたの決定から学習し、より良い提案を行うようになります。
                      使い続けるほど、あなたの好みに合った提案が増えていきます。
                    </p>
                  </div>
                </div>
              </section>
              
              {/* データ管理 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4" id="data">
                  データ管理
                </h2>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">データのインポート</h3>
                    <p className="text-gray-600">
                      1. プロフィールページから「データ移行」を選択します。<br />
                      2. 「インポート」タブを選択します。<br />
                      3. JSONファイルを選択し、「インポート開始」ボタンをクリックします。
                    </p>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">データのエクスポート</h3>
                    <p className="text-gray-600">
                      1. プロフィールページから「データ移行」を選択します。<br />
                      2. 「エクスポート」タブを選択します。<br />
                      3. 「エクスポート開始」ボタンをクリックします。<br />
                      4. JSONファイルがダウンロードされます。
                    </p>
                  </div>
                </div>
              </section>
              
              {/* アカウント管理 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4" id="account">
                  アカウント管理
                </h2>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">プロフィール編集</h3>
                    <p className="text-gray-600">
                      1. プロフィールページにアクセスします。<br />
                      2. 「編集」ボタンをクリックします。<br />
                      3. 情報を更新し、「保存」ボタンをクリックします。
                    </p>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">パスワード変更</h3>
                    <p className="text-gray-600">
                      1. プロフィールページにアクセスします。<br />
                      2. 「パスワード変更」ボタンをクリックします。<br />
                      3. 現在のパスワードと新しいパスワードを入力します。<br />
                      4. 「変更」ボタンをクリックします。
                    </p>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">ログアウト</h3>
                    <p className="text-gray-600">
                      1. 画面右上のユーザーメニューをクリックします。<br />
                      2. 「ログアウト」を選択します。
                    </p>
                  </div>
                </div>
              </section>
              
              {/* トラブルシューティング */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4" id="troubleshooting">
                  トラブルシューティング
                </h2>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">データが同期されない</h3>
                    <p className="text-gray-600">
                      1. インターネット接続を確認します。<br />
                      2. ページをリロードします。<br />
                      3. ログアウトして再度ログインします。<br />
                      4. 問題が解決しない場合は、フィードバックページからお問い合わせください。
                    </p>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">ログインできない</h3>
                    <p className="text-gray-600">
                      1. メールアドレスとパスワードが正しいか確認します。<br />
                      2. パスワードをリセットします。<br />
                      3. 問題が解決しない場合は、サポートにお問い合わせください。
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
          
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              お問い合わせ
            </h2>
            <p className="text-gray-600 mb-4">
              ご質問やご不明点がございましたら、以下の方法でお問い合わせください。
            </p>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">フィードバック:</span> アプリ内の「フィードバック」ページからご連絡ください。
              </p>
              <p className="text-gray-600">
                <span className="font-medium">GitHub:</span> <a href="https://github.com/nishio/ai_project_manager" className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">GitHub リポジトリ</a>で問題を報告することもできます。
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← ホームに戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
