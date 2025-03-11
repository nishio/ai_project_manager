import React from 'react';
import { DataMigrationPanel } from '../components/migration/DataMigrationPanel';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import Link from 'next/link';

export default function MigratePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">
              AIプロジェクトマネージャー
            </h1>
            <h2 className="mt-2 text-xl text-gray-600">
              データ移行ツール
            </h2>
          </div>

          <DataMigrationPanel />

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
