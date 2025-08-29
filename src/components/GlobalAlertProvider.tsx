'use client';

import { useEffect, useState } from 'react';
import CustomAlert from './CustomAlert';
import { overrideAlert } from '@/utils/alertUtils';

interface AlertState {
  isOpen: boolean;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm' | 'prompt';
  onConfirm?: (value?: string) => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  placeholder?: string;
  defaultValue?: string;
}

export default function GlobalAlertProvider({ children }: { children: React.ReactNode }) {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    message: '',
    type: 'info'
  });

  useEffect(() => {
    // alert() 함수 오버라이드
    overrideAlert();

    // 커스텀 이벤트 리스너 등록
    const handleCustomAlert = (event: CustomEvent) => {
      const { message, type, options } = event.detail;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🚨 GlobalAlertProvider: CustomAlert 이벤트 수신', { message, type, options });
      }
      
      setAlertState({
        isOpen: true,
        message,
        type,
        title: options?.title,
        confirmText: options?.confirmText,
        cancelText: options?.cancelText,
        placeholder: options?.placeholder,
        defaultValue: options?.defaultValue,
        onConfirm: options?.onConfirm,
        onCancel: options?.onCancel
      });
    };

    window.addEventListener('showCustomAlert', handleCustomAlert as EventListener);
    
    return () => {
      window.removeEventListener('showCustomAlert', handleCustomAlert as EventListener);
    };
  }, []);

  const handleConfirm = (value?: string) => {
    if (alertState.onConfirm) {
      alertState.onConfirm(value);
    }
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (alertState.onCancel) {
      alertState.onCancel();
    }
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  const handleClose = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <>
      {children}
      <CustomAlert
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        placeholder={alertState.placeholder}
        defaultValue={alertState.defaultValue}
        onConfirm={handleConfirm}
        onCancel={alertState.onCancel ? handleCancel : undefined}
      />
    </>
  );
}
