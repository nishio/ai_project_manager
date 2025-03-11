import React, { useState } from 'react';
import { getCurrentUser } from '../../firebase/auth';
import { storeFeedback } from '../../firebase/firestore';

interface FeedbackFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSuccess, onError }) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      setMessage({ text: 'フィードバックを入力してください', type: 'error' });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    try {
      const user = getCurrentUser();
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }

      const feedbackData = {
        content: feedback,
        rating,
        createdAt: new Date().toISOString(),
        userEmail: user.email
      };

      await storeFeedback(user.uid, feedbackData);
      
      setMessage({ text: 'フィードバックを送信しました。ありがとうございます！', type: 'success' });
      setFeedback('');
      
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'フィードバック送信中にエラーが発生しました';
      setMessage({ text: errorMessage, type: 'error' });
      if (onError && err instanceof Error) onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">フィードバック</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
            評価
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={`w-10 h-10 rounded-full ${
                  rating >= value ? 'bg-yellow-400' : 'bg-gray-200'
                } flex items-center justify-center focus:outline-none`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
            フィードバック
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="AIプロジェクトマネージャーについてのご意見をお聞かせください"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? '送信中...' : 'フィードバックを送信'}
        </button>
      </form>
    </div>
  );
};
