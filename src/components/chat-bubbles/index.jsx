import PropTypes from 'prop-types';

import './chat-bubbles.css';

function ChatBubbles({ count=24, size=16, maxHeight=80, maxWidth=100 }) {

  const stars = Array.from({ length: count }, (_, i) => {

    const randBlink = Math.floor(Math.random() * 5) + 1;
    const randSize = Math.max(2, Math.floor(Math.random() * size) - 1);

    return (
      <div
        className={`chat-bubble blink_${randBlink}`}
        key={`chat-bubble_${i}_${randBlink}`} style={{
          fontSize: `${randSize}px`,
          top: `calc(${Math.random() * maxHeight - 1}vh - ${randSize}px)`,
          left: `calc(${Math.random() * maxWidth}vw - ${randSize}px)`,
        }}>
        <i className="bi bi-chat-square" />
      </div>
    );
  });

  return (
    <div className="chat-bubbles" style={{height: `${maxHeight}vh`}}>

      {stars}

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
  count: 24,
  maxHeight: 80,
  maxWidth: 100,
  size: 16,
};
export default ChatBubbles;
