import React, { useEffect, useRef } from "react";
import anime from "animejs";
import "../styles/HistorySidebar.css";

interface HistorySidebarProps {
  history: string[];
  onSelect: (query: string) => void;
  onClear: () => void;
  onClose?: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, onClear, onClose }) => {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      anime({
        targets: listRef.current.querySelectorAll('.history-item'),
        opacity: [0, 1],
        translateX: [-12, 0],
        easing: 'easeOutQuad',
        delay: anime.stagger(60),
        duration: 350
      });
    }
  }, [history]);

  return (
    <aside className="history-sidebar">
      <div className="history-header">
        <h3>Search History</h3>
        {onClose && (
          <button className="history-btn tertiary" onClick={onClose}>×</button>
        )}
      </div>
      <div className="history-actions">
        <button className="history-btn" onClick={onClear} disabled={!history.length}>Clear</button>
      </div>
      <div className="history-list" ref={listRef}>
        {history.length === 0 && <div className="history-empty">No searches yet.</div>}
        {history.map((h) => (
          <div key={h} className="history-item" onClick={() => onSelect(h)}>
            <span className="history-text" title={h}>{h}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default HistorySidebar;
