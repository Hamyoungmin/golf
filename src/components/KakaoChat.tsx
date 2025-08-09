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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 5.805 2 10.4c0 2.97 1.937 5.568 4.826 7.051L6.5 20.75c-.22.42.257.842.654.653l3.346-1.597C11.159 19.933 11.571 20 12 20c5.523 0 10-3.805 10-8.4S17.523 2 12 2z"/>
      </svg>
      <span>문의</span>
    </button>
  );
};

export default KakaoChat;
