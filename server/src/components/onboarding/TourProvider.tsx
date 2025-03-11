import React, { createContext, useContext, useState, useEffect } from 'react';
import { GuidedTour, DEFAULT_TOUR_STEPS, injectGuidedTourStyles } from './GuidedTour';
import { getCurrentUser } from '../../firebase/auth';

interface TourContextType {
  startTour: () => void;
  isTourCompleted: boolean;
  resetTour: () => void;
}

const TourContext = createContext<TourContextType>({
  startTour: () => {},
  isTourCompleted: false,
  resetTour: () => {}
});

export const useTour = () => useContext(TourContext);

interface TourProviderProps {
  children: React.ReactNode;
}

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTourCompleted, setIsTourCompleted] = useState(false);
  
  // ツアーの完了状態を確認
  useEffect(() => {
    const checkTourStatus = () => {
      const user = getCurrentUser();
      if (!user) return;
      
      const tourKey = `guided_tour_completed_${user.uid}`;
      const completed = localStorage.getItem(tourKey) === 'true';
      setIsTourCompleted(completed);
    };
    
    checkTourStatus();
    
    // CSSスタイルを注入
    injectGuidedTourStyles();
  }, []);
  
  // ツアーを開始
  const startTour = () => {
    setIsOpen(true);
  };
  
  // ツアーを閉じる
  const closeTour = () => {
    setIsOpen(false);
  };
  
  // ツアーを完了
  const completeTour = () => {
    const user = getCurrentUser();
    if (!user) return;
    
    const tourKey = `guided_tour_completed_${user.uid}`;
    localStorage.setItem(tourKey, 'true');
    setIsTourCompleted(true);
    setIsOpen(false);
  };
  
  // ツアーをリセット
  const resetTour = () => {
    const user = getCurrentUser();
    if (!user) return;
    
    const tourKey = `guided_tour_completed_${user.uid}`;
    localStorage.removeItem(tourKey);
    setIsTourCompleted(false);
  };
  
  return (
    <TourContext.Provider
      value={{
        startTour,
        isTourCompleted,
        resetTour
      }}
    >
      {children}
      <GuidedTour
        steps={DEFAULT_TOUR_STEPS}
        isOpen={isOpen}
        onClose={closeTour}
        onComplete={completeTour}
      />
    </TourContext.Provider>
  );
};
