import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TourStep {
  target: string;
  content: string;
  title: string;
  placement: 'top' | 'right' | 'bottom' | 'left';
}

interface GuidedTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [tooltipSize, setTooltipSize] = useState({ width: 0, height: 0 });
  const [tooltipRef, setTooltipRef] = useState<HTMLDivElement | null>(null);

  // ツアーステップの位置を計算
  useEffect(() => {
    if (!isOpen || !steps.length) return;

    const calculatePosition = () => {
      const step = steps[currentStep];
      const targetElement = document.querySelector(step.target);
      
      if (!targetElement || !tooltipRef) return;
      
      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.getBoundingClientRect();
      
      setTooltipSize({
        width: tooltipRect.width,
        height: tooltipRect.height
      });
      
      let top = 0;
      let left = 0;
      
      switch (step.placement) {
        case 'top':
          top = targetRect.top - tooltipRect.height - 10;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.right + 10;
          break;
        case 'bottom':
          top = targetRect.bottom + 10;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.left - tooltipRect.width - 10;
          break;
      }
      
      // 画面外にはみ出さないように調整
      if (left < 0) left = 10;
      if (top < 0) top = 10;
      if (left + tooltipRect.width > window.innerWidth) {
        left = window.innerWidth - tooltipRect.width - 10;
      }
      if (top + tooltipRect.height > window.innerHeight) {
        top = window.innerHeight - tooltipRect.height - 10;
      }
      
      setPosition({ top, left });
      
      // ターゲット要素をハイライト
      targetElement.classList.add('guided-tour-highlight');
    };
    
    calculatePosition();
    
    // リサイズ時に位置を再計算
    window.addEventListener('resize', calculatePosition);
    
    return () => {
      window.removeEventListener('resize', calculatePosition);
      // ハイライトを削除
      const targetElement = document.querySelector(steps[currentStep].target);
      if (targetElement) {
        targetElement.classList.remove('guided-tour-highlight');
      }
    };
  }, [currentStep, isOpen, steps, tooltipRef]);
  
  // 次のステップに進む
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  // 前のステップに戻る
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // ツアーをスキップ
  const skipTour = () => {
    onClose();
  };
  
  if (!isOpen || !steps.length) return null;
  
  // ポータルを使用してツールチップをbody直下に配置
  return createPortal(
    <div 
      className="guided-tour-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9998,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        pointerEvents: 'none'
      }}
    >
      <div
        ref={setTooltipRef}
        className="guided-tour-tooltip"
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          zIndex: 9999,
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          padding: '16px',
          maxWidth: '300px',
          pointerEvents: 'auto'
        }}
      >
        <div className="guided-tour-tooltip-header">
          <h3 className="text-lg font-medium text-gray-900">
            {steps[currentStep].title}
          </h3>
        </div>
        
        <div className="guided-tour-tooltip-content my-3">
          <p className="text-gray-600">
            {steps[currentStep].content}
          </p>
        </div>
        
        <div className="guided-tour-tooltip-footer flex justify-between items-center">
          <div>
            <button
              onClick={skipTour}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              スキップ
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`px-3 py-1 text-sm rounded ${
                currentStep === 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              前へ
            </button>
            
            <button
              onClick={nextStep}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {currentStep === steps.length - 1 ? '完了' : '次へ'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// デフォルトのツアーステップ
export const DEFAULT_TOUR_STEPS: TourStep[] = [
  {
    target: '#task-list',
    title: 'タスク一覧',
    content: 'ここにタスク一覧が表示されます。タスクをクリックすると詳細を確認できます。',
    placement: 'right'
  },
  {
    target: '#add-task-button',
    title: 'タスク追加',
    content: 'このボタンをクリックして新しいタスクを追加できます。',
    placement: 'bottom'
  },
  {
    target: '#task-filter',
    title: 'タスクフィルター',
    content: 'タスクをステータスやラベルでフィルタリングできます。',
    placement: 'bottom'
  },
  {
    target: '#proposal-tab',
    title: 'AI提案',
    content: 'AIからの提案を確認できます。提案を承認または却下できます。',
    placement: 'bottom'
  }
];

// ツアーを開始するためのボタンコンポーネント
interface StartTourButtonProps {
  onStart: () => void;
  className?: string;
}

export const StartTourButton: React.FC<StartTourButtonProps> = ({
  onStart,
  className = ''
}) => {
  return (
    <button
      onClick={onStart}
      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${className}`}
    >
      ガイドツアーを開始
    </button>
  );
};

// ツアーを使用するためのカスタムフック
export const useGuidedTour = (steps = DEFAULT_TOUR_STEPS) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const startTour = () => setIsOpen(true);
  const closeTour = () => setIsOpen(false);
  const completeTour = () => {
    setIsOpen(false);
    // ローカルストレージにツアー完了を記録
    localStorage.setItem('guided_tour_completed', 'true');
  };
  
  return {
    isOpen,
    startTour,
    closeTour,
    completeTour,
    steps
  };
};

// CSSスタイル
export const injectGuidedTourStyles = () => {
  if (typeof document === 'undefined') return;
  
  const styleId = 'guided-tour-styles';
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    .guided-tour-highlight {
      position: relative;
      z-index: 9999;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
      border-radius: 4px;
    }
  `;
  
  document.head.appendChild(style);
};
