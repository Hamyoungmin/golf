'use client';

import React from 'react';

interface Props {
	loading?: boolean;
	disabled?: boolean;
	text?: string;
	onClick: () => void;
}

export default function PayButton({ loading = false, disabled = false, text = '결제하기', onClick }: Props) {
	return (
		<button
			onClick={onClick}
			disabled={loading || disabled}
			style={{
				width: '100%',
				backgroundColor: (loading || disabled) ? '#ced4da' : '#007bff',
				color: '#fff',
				padding: '15px 0',
				borderRadius: '8px',
				fontSize: '16px',
				fontWeight: '600',
				border: 'none',
				cursor: (loading || disabled) ? 'not-allowed' : 'pointer',
				transition: 'background-color 0.2s',
				marginBottom: '12px'
			}}
		>
			{loading ? '주문 처리 중...' : text}
		</button>
	);
}


