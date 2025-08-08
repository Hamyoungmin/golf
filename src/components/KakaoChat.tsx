'use client';

const KakaoChat = () => {
  const handleChatClick = () => {
    // 실제 카카오톡 채널 연동 시 사용될 코드
    // Kakao.Channel.chat({channelPublicId: '_xdxaxdKn'});
    alert('카카오톡 채팅 기능입니다. 실제 서비스에서는 카카오톡 채널로 연결됩니다.');
  };

  return (
    <button 
      className="kakao-chat" 
      onClick={handleChatClick}
      title="카카오톡 채팅하기"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
      </svg>
      <span>문의</span>
    </button>
  );
};

export default KakaoChat;
