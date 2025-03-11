import React from 'react';
import Link from 'next/link';
import { useAuth } from '../auth/AuthProvider';
import { signOutUser } from '../../firebase/auth';
import { useRouter } from 'next/navigation';

export const AuthNav: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (user) {
    return (
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
          <button
            onClick={handleSignOut}
            className="text-sm text-red-600 hover:text-red-800"
          >
            ログアウト
          </button>
        </div>
      </div>
    );
  }

  return (
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
  );
};
