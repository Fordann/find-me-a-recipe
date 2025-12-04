import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/SearchBarIngredients.css";

interface SearchBarIngredientsProps {
  addIngredient: (ingredient: string) => void;
  apiCall?: () => void;
  onType?: (current: string) => void;
  isLoading?: boolean;
}

const SearchBarIngredients: React.FC<SearchBarIngredientsProps> = ({addIngredient, apiCall, onType, isLoading = false }) => {
  const { t } = useLanguage();
  const [ingredient, setIngredient] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState<number>(0);

  const rotatingPlaceholders = [
    // Ingredients
    t('search.placeholder.tomato'),
    t('search.placeholder.tuna'),
    t('search.placeholder.feta'),
    t('search.placeholder.chicken'),
    t('search.placeholder.avocado'),
    t('search.placeholder.pepper'),
    t('search.placeholder.zucchini'),
    t('search.placeholder.parmesan'),
    t('search.placeholder.basil'),
    t('search.placeholder.salmon'),
    t('search.placeholder.lemon'),
    t('search.placeholder.dill'),
    t('search.placeholder.pasta'),
    t('search.placeholder.tiramisu'),
    t('search.placeholder.ramen'),
    t('search.placeholder.dahl'),
    t('search.placeholder.tacos'),
    t('search.placeholder.curry'),
  ];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();
    const value = event.target.value;
    setIngredient(value);
    onType && onType(value);
    
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 150);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % rotatingPlaceholders.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`searchBar ${isLoading ? 'hidden' : ''}`}>
      <div className="hero-cta">
        <span className="hero-text">{t('search.hero')}</span>
      </div>
      <form>
        <span className="arrow-indicator">↳</span>
        <input
          ref={inputRef}
          type="text"
          id="search-bar"
          className={`input input-hero ${isTyping ? 'typing' : ''}`}
          name="ingredient"
          onChange={handleChange}
          autoComplete="off"
          placeholder={rotatingPlaceholders[placeholderIndex]}
          value={ingredient}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const trimmed = ingredient.trim();
              if (trimmed && apiCall) {
                apiCall();
              }
            }
          }}
        />
      </form>
    </div>
  );
};

export default React.memo(SearchBarIngredients);
