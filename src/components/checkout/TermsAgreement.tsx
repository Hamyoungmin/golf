'use client';

import React from 'react';

interface Agreements {
	terms: boolean;
	privacy: boolean;
	age: boolean;
}

interface Props {
	agreements: Agreements;
	allAgreed: boolean;
	onToggle: (key: keyof Agreements) => void;
	onToggleAll: () => void;
}

export default function TermsAgreement({ agreements, allAgreed, onToggle, onToggleAll }: Props) {
	return (
		<div style={{ 
			backgroundColor: '#fff', 
			border: '1px solid #e0e0e0', 
			borderRadius: '8px', 
			padding: '25px',
			boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
		}}>
			<h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>약관 동의</h2>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
				<label style={{ 
					display: 'flex', 
					alignItems: 'center', 
					cursor: 'pointer',
					padding: '12px',
					backgroundColor: '#f8f9fa',
					borderRadius: '6px',
					border: '1px solid #e9ecef'
				}}>
					<input
						type="checkbox"
						checked={allAgreed}
						onChange={onToggleAll}
						style={{ marginRight: '12px', transform: 'scale(1.3)' }}
					/>
					<span style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>모든 약관에 동의합니다</span>
				</label>
				<hr style={{ border: 'none', borderTop: '1px solid #e9ecef', margin: '8px 0' }} />
				<label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', paddingLeft: '12px' }}>
					<input
						type="checkbox"
						checked={agreements.terms}
						onChange={() => onToggle('terms')}
						style={{ marginRight: '12px', transform: 'scale(1.2)' }}
					/>
					<span style={{ fontSize: '14px', color: '#333' }}>이용약관에 동의합니다 (필수)</span>
				</label>
				<label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', paddingLeft: '12px' }}>
					<input
						type="checkbox"
						checked={agreements.privacy}
						onChange={() => onToggle('privacy')}
						style={{ marginRight: '12px', transform: 'scale(1.2)' }}
					/>
					<span style={{ fontSize: '14px', color: '#333' }}>개인정보 처리방침에 동의합니다 (필수)</span>
				</label>
				<label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', paddingLeft: '12px' }}>
					<input
						type="checkbox"
						checked={agreements.age}
						onChange={() => onToggle('age')}
						style={{ marginRight: '12px', transform: 'scale(1.2)' }}
					/>
					<span style={{ fontSize: '14px', color: '#333' }}>만 14세 이상입니다 (필수)</span>
				</label>
			</div>
		</div>
	);
}


