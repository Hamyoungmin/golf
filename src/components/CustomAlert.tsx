'use client';

import React from 'react';

interface CustomAlertProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm';
}

export default function CustomAlert({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '확인',
  cancelText = '취소',
  type = 'info'
}: CustomAlertProps) {
  if (!isOpen) return null;

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: '✅', color: '#28a745' };
      case 'error':
        return { icon: '❌', color: '#dc3545' };
      case 'warning':
        return { icon: '⚠️', color: '#ffc107' };
      case 'confirm':
        return { icon: '❓', color: '#17a2b8' };
      default:
        return { icon: 'ℹ️', color: '#007bff' };
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        textAlign: 'center'
      }}>
        {/* 아이콘 */}
        <div style={{
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          {icon}
        </div>

        {/* 제목 */}
        {title && (
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: '#333',
            margin: '0 0 15px 0'
          }}>
            {title}
          </h3>
        )}

        {/* 메시지 */}
        <p style={{
          fontSize: '16px',
          color: '#666',
          lineHeight: '1.5',
          marginBottom: '25px',
          margin: '0 0 25px 0'
        }}>
          {message}
        </p>

        {/* 버튼 영역 */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center'
        }}>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                padding: '12px 24px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                backgroundColor: '#fff',
                color: '#666',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              {cancelText}
            </button>
          )}
          
          <button
            onClick={onConfirm}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: color,
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '80px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
