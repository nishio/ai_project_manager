'use client';

import React from 'react';
import BacklogImportForm from '../../components/import/BacklogImportForm';
import { useRouter } from 'next/navigation';

export default function ImportPage() {
  const router = useRouter();
  
  return (
    <div className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-8">JSONインポートテスト</h1>
      
      <div className="w-full max-w-5xl">
        <BacklogImportForm 
          onImportComplete={() => {
            alert('インポートが完了しました。ホームページに戻ります。');
            router.push('/');
          }}
          onCancel={() => router.push('/')}
        />
      </div>
    </div>
  );
}
