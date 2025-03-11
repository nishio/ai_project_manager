import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuth } from '../components/auth/AuthProvider';
import { generateSampleTasks } from '../utils/onboardingUtils';

// ステップの定義
const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'AIプロジェクトマネージャーへようこそ',
    description: 'AIを活用したプロジェクト管理ツールで、効率的にタスクを管理しましょう。'
  },
  {
    id: 'tasks',
    title: 'タスク管理',
    description: 'タスクの作成、編集、ステータス変更などの基本操作を学びましょう。'
  },
  {
    id: 'ai',
    title: 'AI支援機能',
    description: 'AIがタスクの整理や優先順位付けを支援します。提案を確認して承認または却下できます。'
  },
  {
    id: 'cloud',
    title: 'クラウド同期',
    description: 'データはFirestoreに保存され、複数のデバイスからアクセスできます。'
  }
];

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [sampleTasksGenerated, setSampleTasksGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // 次のステップに進む
  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 前のステップに戻る
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // サンプルタスクを生成
  const handleGenerateSampleTasks = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      await generateSampleTasks();
      setSampleTasksGenerated(true);
    } catch (error) {
      console.error('サンプルタスク生成エラー:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // オンボーディングを完了してアプリに移動
  const completeOnboarding = () => {
    router.push('/app');
  };

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
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* プログレスバー */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                オンボーディング進捗
              </span>
              <span className="text-sm font-medium text-gray-700">
                {currentStep + 1} / {ONBOARDING_STEPS.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* ステップコンテンツ */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {ONBOARDING_STEPS[currentStep].title}
              </h2>
              <p className="text-gray-600 mb-6">
                {ONBOARDING_STEPS[currentStep].description}
              </p>
              
              {/* ステップ固有のコンテンツ */}
              {currentStep === 0 && (
                <div className="mb-6">
                  <div className="p-4 bg-blue-50 rounded-md mb-4">
                    <p className="text-blue-700">
                      AIプロジェクトマネージャーは、AIの力を活用してプロジェクト管理を効率化するツールです。
                      タスクの整理、優先順位付け、進捗管理をAIがサポートします。
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-200 rounded-md">
                      <h3 className="font-medium text-gray-900 mb-2">主な機能</h3>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>タスクの作成と管理</li>
                        <li>AIによる提案</li>
                        <li>クラウド同期</li>
                        <li>マルチデバイス対応</li>
                      </ul>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-md">
                      <h3 className="font-medium text-gray-900 mb-2">メリット</h3>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>効率的なタスク管理</li>
                        <li>AIによる意思決定支援</li>
                        <li>どこからでもアクセス可能</li>
                        <li>チーム連携の強化</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {currentStep === 1 && (
                <div className="mb-6">
                  <div className="p-4 bg-blue-50 rounded-md mb-4">
                    <p className="text-blue-700">
                      タスク管理は、プロジェクトを成功させるための基本です。
                      タスクの作成、編集、ステータス変更などの基本操作を学びましょう。
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-md">
                      <h3 className="font-medium text-gray-900 mb-2">タスクの作成</h3>
                      <p className="text-gray-600">
                        「+タスク追加」ボタンをクリックして、新しいタスクを作成できます。
                        タイトル、説明、ラベルなどを設定しましょう。
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-md">
                      <h3 className="font-medium text-gray-900 mb-2">タスクの編集</h3>
                      <p className="text-gray-600">
                        タスクカードをクリックすると、詳細を表示・編集できます。
                        ステータスの変更や説明の追加が可能です。
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-md">
                      <h3 className="font-medium text-gray-900 mb-2">サンプルタスク</h3>
                      <p className="text-gray-600 mb-3">
                        練習用のサンプルタスクを生成できます。実際の操作を体験してみましょう。
                      </p>
                      <button
                        onClick={handleGenerateSampleTasks}
                        disabled={isGenerating || sampleTasksGenerated}
                        className={`px-4 py-2 rounded-md text-white font-medium ${
                          isGenerating ? 'bg-blue-400' : 
                          sampleTasksGenerated ? 'bg-green-500' : 
                          'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {isGenerating ? '生成中...' : 
                         sampleTasksGenerated ? '生成済み' : 
                         'サンプルタスクを生成'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="mb-6">
                  <div className="p-4 bg-blue-50 rounded-md mb-4">
                    <p className="text-blue-700">
                      AIがタスクの整理や優先順位付けを支援します。
                      AIからの提案を確認して、承認または却下することができます。
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-md">
                      <h3 className="font-medium text-gray-900 mb-2">AI提案の確認</h3>
                      <p className="text-gray-600">
                        AIは定期的にタスクの整理や優先順位付けの提案を行います。
                        提案は「提案」タブで確認できます。
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-md">
                      <h3 className="font-medium text-gray-900 mb-2">提案の承認/却下</h3>
                      <p className="text-gray-600">
                        各提案に対して「承認」または「却下」を選択できます。
                        承認した提案は自動的に適用されます。
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
                </div>
              )}
              
              {currentStep === 3 && (
                <div className="mb-6">
                  <div className="p-4 bg-blue-50 rounded-md mb-4">
                    <p className="text-blue-700">
                      データはFirestoreに保存され、複数のデバイスからアクセスできます。
                      クラウド同期により、いつでもどこでも最新のデータにアクセスできます。
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-md">
                      <h3 className="font-medium text-gray-900 mb-2">データの同期</h3>
                      <p className="text-gray-600">
                        変更はリアルタイムでクラウドに同期されます。
                        複数のデバイスで同じアカウントにログインすれば、常に最新のデータにアクセスできます。
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-md">
                      <h3 className="font-medium text-gray-900 mb-2">データのエクスポート</h3>
                      <p className="text-gray-600">
                        必要に応じて、データをJSONファイルとしてエクスポートすることもできます。
                        プロフィールページから「データ移行」を選択してください。
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-md">
                      <h3 className="font-medium text-gray-900 mb-2">準備完了！</h3>
                      <p className="text-gray-600 mb-3">
                        これでオンボーディングは完了です。AIプロジェクトマネージャーを使い始めましょう！
                      </p>
                      <button
                        onClick={completeOnboarding}
                        className="px-4 py-2 rounded-md text-white font-medium bg-green-600 hover:bg-green-700"
                      >
                        アプリを開始する
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* ナビゲーションボタン */}
            <div className="px-6 py-4 bg-gray-50 flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded-md font-medium ${
                  currentStep === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                前へ
              </button>
              
              {currentStep < ONBOARDING_STEPS.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="px-4 py-2 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700"
                >
                  次へ
                </button>
              ) : (
                <button
                  onClick={completeOnboarding}
                  className="px-4 py-2 rounded-md text-white font-medium bg-green-600 hover:bg-green-700"
                >
                  完了
                </button>
              )}
            </div>
          </div>
          
          {/* ヘルプリンク */}
          <div className="mt-8 text-center">
            <Link href="/help" className="text-blue-600 hover:text-blue-800">
              ヘルプドキュメントを表示
            </Link>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
