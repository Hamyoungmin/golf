'use client';

import { useState, useCallback } from 'react';
import CustomAlert from '@/components/CustomAlert';

interface AlertState {
  isOpen: boolean;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const useCustomAlert = () => {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    message: '',
    type: 'info'
  });

  const showAlert = useCallback((
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' | 'confirm' = 'info',
    options?: {
      title?: string;
      confirmText?: string;
      cancelText?: string;
      onConfirm?: () => void;
      onCancel?: () => void;
    }
  ) => {
    setAlertState({
      isOpen: true,
      message,
      type,
      title: options?.title,
      confirmText: options?.confirmText,
      cancelText: options?.cancelText,
      onConfirm: options?.onConfirm,
      onCancel: options?.onCancel
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (alertState.onConfirm) {
      alertState.onConfirm();
    }
    hideAlert();
  }, [alertState, hideAlert]);

  const handleCancel = useCallback(() => {
    if (alertState.onCancel) {
      alertState.onCancel();
    }
    hideAlert();
  }, [alertState, hideAlert]);

  const AlertComponent = useCallback(() => (
    <CustomAlert
      isOpen={alertState.isOpen}
      title={alertState.title}
      message={alertState.message}
      type={alertState.type}
      confirmText={alertState.confirmText}
      cancelText={alertState.cancelText}
      onConfirm={handleConfirm}
      onCancel={alertState.onCancel ? handleCancel : undefined}
    />
  ), [alertState, handleConfirm, handleCancel]);

  return {
    showAlert,
    hideAlert,
    AlertComponent,
  };
};
