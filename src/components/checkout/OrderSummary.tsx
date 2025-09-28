'use client';

import React from 'react';
import Image from 'next/image';

interface Props {
	title?: string;
	items: { id: string; name: string; quantity: number; price: number; imageUrl?: string }[];
	itemsTotal: number;
	shippingFee: number;
	finalTotal: number;
	onSubmit?: () => void;
	submitText?: string;
	submitDisabled?: boolean;
}

const formatPrice = (price: number) => new Intl.NumberFormat('ko-KR').format(price) + '원';

export default function OrderSummary({
	title = '주문 상품',
	items,
	itemsTotal,
	shippingFee,
	finalTotal,
	onSubmit,
	submitText = '결제하기',
	submitDisabled = false,
}: Props) {
	return (
		<div style={{ flex: '1', minWidth: '300px' }}>
			<div style={{ 
				backgroundColor: '#f8f9fa', 
				borderRadius: '8px', 
				padding: '25px', 
				position: 'sticky', 
				top: '20px',
				border: '1px solid #e0e0e0',
				boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
			}}>
				<h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>{title}</h3>

				<div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
					{items.map((item) => (
						<div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
							<div style={{ 
								width: '50px', 
								height: '50px', 
								backgroundColor: '#e9ecef', 
								borderRadius: '6px', 
								overflow: 'hidden',
								flexShrink: 0
							}}>
							{item.imageUrl ? (
								<Image src={item.imageUrl} alt={item.name} width={50} height={50} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
							) : (
									<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#adb5bd', fontSize: '11px' }}>이미지</div>
								)}
							</div>
							<div style={{ flex: 1, minWidth: 0 }}>
								<p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
								<p style={{ fontSize: '12px', color: '#666' }}>{formatPrice(item.price)} × {item.quantity}</p>
							</div>
							<div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>{formatPrice(item.price * item.quantity)}</div>
						</div>
					))}
				</div>

				<div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
					<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
						<span style={{ color: '#666' }}>상품 총액</span>
						<span style={{ color: '#333', fontWeight: '500' }}>{formatPrice(itemsTotal)}</span>
					</div>
					<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
						<span style={{ color: '#666' }}>배송비</span>
						<span style={{ color: '#333', fontWeight: '500' }}>{shippingFee === 0 ? '무료' : formatPrice(shippingFee)}</span>
					</div>
					<hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '8px 0' }} />
					<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '600' }}>
						<span style={{ color: '#333' }}>총 결제금액</span>
						<span style={{ color: '#007bff' }}>{formatPrice(finalTotal)}</span>
					</div>
				</div>

				{onSubmit && (
					<button
						onClick={onSubmit}
						disabled={submitDisabled}
						style={{
							width: '100%',
							backgroundColor: submitDisabled ? '#ced4da' : '#007bff',
							color: '#fff',
							padding: '15px 0',
							borderRadius: '8px',
							fontSize: '16px',
							fontWeight: '600',
							border: 'none',
							cursor: submitDisabled ? 'not-allowed' : 'pointer',
							transition: 'background-color 0.2s',
							marginBottom: '12px'
						}}
					>
						{submitText}
					</button>
				)}
			</div>
		</div>
	);
}


