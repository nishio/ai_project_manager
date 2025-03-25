import React, { useState } from 'react';
import Link from 'next/link';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegisterSuccess = () => {
    router.push('/');
  };

  const handleRegisterError = (error: Error) => {
    setError(error.message);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">
          AIプロジェクトマネージャー
        </h1>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          新規アカウント登録
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <RegisterForm 
          onSuccess={handleRegisterSuccess} 
          onError={handleRegisterError} 
        />
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            すでにアカウントをお持ちの場合は{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              ログイン
            </Link>
            {' '}してください
          </p>
        </div>
      </div>
    </div>
  );
}
