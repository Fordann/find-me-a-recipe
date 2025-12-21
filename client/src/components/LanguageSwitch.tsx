import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { switched } from '../store/slices/language/LanguageSlice';
import { RootState } from '../store/store';
import '../styles/LanguageSwitch.css';

const LanguageSwitch: React.FC = () => {
  const dispatch = useDispatch();
  const language = useSelector((state: RootState) => state.language.value)

  return (
    <div className="language-switch">
      <button 
        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
        onClick={() => dispatch(switched())}
      >
        EN
      </button>
      <button 
        className={`lang-btn ${language === 'fr' ? 'active' : ''}`}
        onClick={() => dispatch(switched())}
      >
        FR
      </button>
    </div>
  );
};

export default LanguageSwitch;
