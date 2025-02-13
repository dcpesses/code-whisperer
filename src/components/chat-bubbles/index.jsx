import PropTypes from 'prop-types';

import './chat-bubbles.css';

function ChatBubbles({ count=48, size=36, maxHeight=75, maxWidth=100 }) {

  const chats = Array.from({ length: count }, (_, i) => {

    const randBlink = Math.floor(Math.random() * 5) + 1;
    const randSize = Math.max(12, Math.floor(Math.random() * size) - 1);

    return (
      <div
        className={`chat-bubble blink_${randBlink}`}
        key={`chat-bubble_${i}_${randBlink}`} style={{
          fontSize: `${randSize}px`,
          top: `calc(${Math.random() * maxHeight - 1}vh - ${randSize}px - 125px)`,
          left: `calc(${Math.random() * maxWidth}vw - ${randSize}px)`,
          opacity: Math.max(randSize / size, 0.5),
        }}>
        <i className="bi bi-chat-square" />
      </div>
    );
  });

  return (
    <div className="chat-bubbles" style={{height: `calc(${maxHeight}vh - 125px)`}}>
      {chats}
    </div>
  );
}
ChatBubbles.propTypes = {
  count: PropTypes.number,
  maxHeight: PropTypes.number,
  maxWidth: PropTypes.number,
  size: PropTypes.number,
};
ChatBubbles.defaultProps = {
  count: 16,
  maxHeight: 75,
  maxWidth: 100,
  size: 64,
};
export default ChatBubbles;
