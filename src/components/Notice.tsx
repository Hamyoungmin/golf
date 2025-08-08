const Notice = () => {
  return (
    <section className="notice-section">
      <h2 className="notice-title">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display: 'inline-block', marginRight: '8px', verticalAlign: 'middle'}}>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
        </svg>
        Notice
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display: 'inline-block', marginLeft: '8px', verticalAlign: 'middle'}}>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
        </svg>
      </h2>
      <ul className="notice-list">
        <li className="notice-item">
          <strong>팬더골프 도매 전용입니다.</strong>
        </li>
        <li className="notice-item">
          <strong>제품 주문은 사업자인증이 완료된 회원만 가능합니다.</strong>
        </li>
        <li className="notice-item">
          <strong>제품 입고는 실시간으로 업데이트를 하고 있습니다.</strong>
        </li>
      </ul>
    </section>
  );
};

export default Notice;
