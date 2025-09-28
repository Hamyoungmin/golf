'use client';

import React from 'react';
import { PaymentMethod } from '@/types';

interface Props {
	methods: {
		transfer: boolean;
		phone: boolean;
		naverpay: boolean;
	};
	value: PaymentMethod;
	onChange: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({ methods, value, onChange }: Props) {
	return (
		<div style={{ 
			backgroundColor: '#fff', 
			border: '1px solid #e0e0e0', 
			borderRadius: '8px', 
			padding: '25px',
			boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
		}}>
			<h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>결제 방법</h2>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
				{methods.transfer && (
					<label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
						<input
							type="radio"
							name="paymentMethod"
							value="bank_transfer"
							checked={value === 'bank_transfer'}
							onChange={(e) => onChange(e.target.value as PaymentMethod)}
							style={{ marginRight: '12px', transform: 'scale(1.2)' }}
						/>
						<span style={{ fontSize: '14px', color: '#333' }}>무통장 입금</span>
					</label>
				)}

				<label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
					<input
						type="radio"
						name="paymentMethod"
						value="toss_payments"
						checked={value === 'toss_payments'}
						onChange={(e) => onChange(e.target.value as PaymentMethod)}
						style={{ marginRight: '12px', transform: 'scale(1.2)' }}
					/>
					<span style={{ fontSize: '14px', color: '#333' }}>토스페이먼츠</span>
				</label>

				{methods.phone && (
					<label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
						<input
							type="radio"
							name="paymentMethod"
							value="phone"
							checked={value === 'phone'}
							onChange={(e) => onChange(e.target.value as PaymentMethod)}
							style={{ marginRight: '12px', transform: 'scale(1.2)' }}
						/>
						<span style={{ fontSize: '14px', color: '#333' }}>휴대폰 결제</span>
					</label>
				)}

				{methods.naverpay && (
					<label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
						<input
							type="radio"
							name="paymentMethod"
							value="naverpay"
							checked={value === 'naverpay'}
							onChange={(e) => onChange(e.target.value as PaymentMethod)}
							style={{ marginRight: '12px', transform: 'scale(1.2)' }}
						/>
						<span style={{ fontSize: '14px', color: '#333' }}>네이버페이</span>
					</label>
				)}
			</div>
		</div>
	);
}


