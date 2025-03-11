import React from 'react';
import Link from 'next/link';
import { AuthNav } from './AuthNav';

export const Header: React.FC = () => {
  return (
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
            <AuthNav />
          </nav>
        </div>
      </div>
    </header>
  );
};
