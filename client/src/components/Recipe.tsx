import React, { useEffect, useMemo, useRef } from "react";
import anime from "animejs";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/Recipe.css";

// Define recipe properties types
interface RecipeProps {
  value: {
    name: string;
    image: string | string[];
    budget: string;
    cook_time: string;
    difficulty: string;
    ingredients: (string | [string, string, string])[];
    nb_comments: number;
    prep_time: string;
    rate: number | string;
    recipe_quantity: string;
    steps: string[];
    total_time: string;
  };
  onBack?: () => void;
}

const RecipeComponent: React.FC<RecipeProps> = ({ value: recipe, onBack }) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [currentView, setCurrentView] = React.useState<'hero' | 'steps'>('hero');
  const [checkedIngredients, setCheckedIngredients] = React.useState<Set<number>>(new Set());
  const [showScrollHint, setShowScrollHint] = React.useState(false);
  const [hiddenSteps, setHiddenSteps] = React.useState<Set<number>>(new Set());
  const [showHiddenSteps, setShowHiddenSteps] = React.useState(false);
  const [showSparkles, setShowSparkles] = React.useState(false);
  const baseServings = useMemo(() => {
    const txt = (recipe.recipe_quantity || '').toString();
    const m = txt.match(/(\d+)/);
    const n = m ? parseInt(m[1], 10) : 1;
    return isNaN(n) || n <= 0 ? 1 : n;
  }, [recipe.recipe_quantity]);
  const [servings, setServings] = React.useState<number>(1);

  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current.children,
        opacity: [0, 1],
        translateY: [12, 0],
        easing: "easeOutQuad",
        delay: anime.stagger(80),
        duration: 400,
      });
    }
  }, [currentView]);

  // Check if all steps are hidden and trigger sparkles animation
  useEffect(() => {
    const totalSteps = recipe.steps?.length || 0;
    if (totalSteps > 0 && hiddenSteps.size === totalSteps && hiddenSteps.size > 0) {
      setShowSparkles(true);
      
      // Create sparkles animation
      const sparklesContainer = document.createElement('div');
      sparklesContainer.className = 'sparkles-explosion';
      document.body.appendChild(sparklesContainer);
      
      // Create multiple sparkle particles
      const particleCount = 50;
      const particles: HTMLElement[] = [];
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'sparkle-particle';
        particle.style.left = '50%';
        particle.style.top = '50%';
        sparklesContainer.appendChild(particle);
        particles.push(particle);
      }
      
      // Animate particles
      anime({
        targets: particles,
        translateX: () => anime.random(-400, 400),
        translateY: () => anime.random(-400, 400),
        scale: [
          { value: [0, 1], duration: 200, easing: 'easeOutQuad' },
          { value: 0, duration: 600, delay: 400, easing: 'easeInQuad' }
        ],
        rotate: () => anime.random(0, 360),
        opacity: [
          { value: 1, duration: 200 },
          { value: 0, duration: 600, delay: 400 }
        ],
        easing: 'easeOutExpo',
        duration: 1200,
        delay: anime.stagger(20),
        complete: () => {
          sparklesContainer.remove();
          setShowSparkles(false);
        }
      });
    }
  }, [hiddenSteps, recipe.steps]);

  // Reset checked ingredients when recipe changes
  useEffect(() => {
    setCheckedIngredients(new Set());
    setServings(baseServings);
    setHiddenSteps(new Set());
    setShowHiddenSteps(false);
  }, [recipe, baseServings]);

  // Update scroll hint visibility based on sidebar scroll state
  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;

    const update = () => {
      const canScroll = el.scrollHeight > el.clientHeight + 1;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
      setShowScrollHint(canScroll && !atBottom);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const id = window.setInterval(update, 400); // in case content size changes

    return () => {
      el.removeEventListener('scroll', update as EventListener);
      window.removeEventListener('resize', update);
      window.clearInterval(id);
    };
  }, [currentView]);

  // Process image for display
  const firstImage = Array.isArray(recipe.image) ? recipe.image[0] : recipe.image;

  const handleSwipe = () => {
    setCurrentView(currentView === 'hero' ? 'steps' : 'hero');
  };

  const toggleIngredient = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const decServings = (e: React.MouseEvent) => {
    e.stopPropagation();
    setServings((s) => Math.max(1, s - 1));
  };
  const incServings = (e: React.MouseEvent) => {
    e.stopPropagation();
    setServings((s) => s + 1);
  };

  const toggleStep = (idx: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setHiddenSteps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleShowHiddenSteps = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowHiddenSteps((prev) => !prev);
  };

  const parseQuantity = (q: string | number): number | null => {
    if (typeof q === 'number') return q;
    if (!q) return null;
    let s = q.toString().toLowerCase().trim();
    s = s.replace(/,/g, '.');
    const fracMap: Record<string, string> = { '½': '1/2', '¼': '1/4', '¾': '3/4', '⅓': '1/3', '⅔': '2/3', '⅛': '1/8', '⅜': '3/8', '⅝': '5/8', '⅞': '7/8' };
    s = s.replace(/[½¼¾⅓⅔⅛⅜⅝⅞]/g, (m) => fracMap[m] || m);
    // Take first part before range separators
    s = s.split(/-|à|to/)[0].trim();
    const parts = s.split(/\s+/);
    let total = 0;
    let found = false;
    for (const p of parts) {
      const frac = p.match(/^(\d+)\/(\d+)$/);
      if (frac) {
        const a = parseFloat(frac[1]);
        const b = parseFloat(frac[2]);
        if (b !== 0) {
          total += a / b;
          found = true;
          continue;
        }
      }
      const num = Number(p);
      if (!isNaN(num)) {
        total += num;
        found = true;
      }
    }
    return found ? total : null;
  };

  const formatQuantity = (n: number): string => {
    const rounded = Math.round(n * 100) / 100;
    return (Math.abs(rounded - Math.round(rounded)) < 0.01)
      ? String(Math.round(rounded))
      : rounded.toString();
  };

  const scaleFactor = useMemo(() => {
    return baseServings > 0 ? servings / baseServings : 1;
  }, [servings, baseServings]);

  // Build a map of ingredient name -> quantity text for tooltips
  const ingredientQtyMap = useMemo(() => {
    const map = new Map<string, string>();
    if (recipe.ingredients) {
      recipe.ingredients.forEach((ing) => {
        if (Array.isArray(ing)) {
          const [q, u, n] = ing;
          const base = parseQuantity(q);
          const scaled = base != null ? formatQuantity(base * scaleFactor) : (q?.toString() || '');
          const qtyText = [scaled, u].filter(Boolean).join(' ');
          const key = String(n).toLowerCase().trim();
          if (key && qtyText) map.set(key, qtyText);
        }
      });
    }
    return map;
  }, [recipe.ingredients, scaleFactor]);

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Factory to highlight with a shared set to show tooltip only on first mention overall
  const makeHighlighter = () => {
    const alreadyShown = new Set<string>();
    const names = Array.from(ingredientQtyMap.keys());
    // Prefer longest matches first
    names.sort((a, b) => b.length - a.length);
    const pattern = names.length ? new RegExp(`(${names.map(escapeRegExp).join("|")})`, "gi") : null;

    return (text: string) => {
      if (!pattern) return text;
      const elements: React.ReactNode[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      // Reset lastIndex because this regex is reused across calls
      pattern.lastIndex = 0;
      while ((match = pattern.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        if (start > lastIndex) {
          elements.push(text.slice(lastIndex, start));
        }
        const matchedText = match[0];
        const key = matchedText.toLowerCase();
        const qty = ingredientQtyMap.get(key);
        if (qty && !alreadyShown.has(key)) {
          alreadyShown.add(key);
          elements.push(
            <span key={`${start}-${end}`} className="step-ingredient" data-qty={qty} aria-label={`${matchedText}: ${qty}`}>
              {matchedText}
            </span>
          );
        } else {
          elements.push(matchedText);
        }
        lastIndex = end;
      }
      if (lastIndex < text.length) elements.push(text.slice(lastIndex));
      return elements;
    };
  };

  return (
    <>
      {currentView === 'hero' ? (
        <div className="recipe-hero-view" onClick={handleSwipe}>
          <div className="recipe-hero-image" style={{ backgroundImage: `url(${firstImage})` }}>
            <div className="recipe-hero-overlay" />
            {onBack && (
              <button className="recipe-hero-back btn_search_with_ingredients" onClick={(e) => { e.stopPropagation(); onBack(); }}>← {t('recipe.back')}</button>
            )}
            <div className="recipe-hero-content">
              <h1 className="recipe-hero-title">{recipe.name}</h1>
              <div className="recipe-hero-meta">
                <div className="hero-meta-item">
                  <span className="meta-label">{t('recipe.quantity')}</span>
                  <span className="meta-value">{recipe.recipe_quantity || "-"}</span>
                </div>
                <div className="hero-meta-item">
                  <span className="meta-label">{t('recipe.totalTime')}</span>
                  <span className="meta-value">{recipe.total_time || "-"}</span>
                </div>
                <div className="hero-meta-item">
                  <span className="meta-label">{t('recipe.rating')}</span>
                  <span className="meta-value">{recipe.rate || "-"}</span>
                </div>
              </div>
              <div className="recipe-hero-times">
                {recipe.prep_time && <span><strong>{t('recipe.prep')}:</strong> {recipe.prep_time}</span>}
                {recipe.cook_time && <span><strong>{t('recipe.cook')}:</strong> {recipe.cook_time}</span>}
              </div>
              <div className="swipe-hint">↓ {t('recipe.swipeSteps')}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="recipe-steps-view">
          <div className="recipe-steps-header">
            <div className="recipe-steps-banner-peek" style={{ backgroundImage: `url(${firstImage})` }} onClick={handleSwipe}>
              <div className="recipe-steps-banner-overlay" />
              {onBack && (
                <button className="recipe-steps-back btn_search_with_ingredients" onClick={(e) => { e.stopPropagation(); onBack(); }}>← {t('recipe.back')}</button>
              )}
              <div className="swipe-hint-bottom">↑ {t('recipe.swipeBack')}</div>
              <div className="recipe-steps-header-content">
                <h2 className="recipe-steps-title">{recipe.name}</h2>
                <div className="recipe-steps-meta">
                  {recipe.prep_time && <span>{t('recipe.prep')}: {recipe.prep_time}</span>}
                  {recipe.cook_time && <span>{t('recipe.cook')}: {recipe.cook_time}</span>}
                </div>
              </div>
            </div>
          </div>
              <div className="recipe-layout">
            <aside className="recipe-sidebar" ref={sidebarRef} onClick={(e) => e.stopPropagation()}>
              <div className="recipe-sidebar-sticky">
                <div className="ingredients-header">
                  <h3 className="ingredients-title">{t('recipe.ingredients')}</h3>
                  <div className="servings-controls" aria-label="Number of servings">
                    <button className="servings-btn" onClick={decServings} aria-label={t('recipe.decrease')}>−</button>
                    <span className="servings-label">{servings} {t('recipe.servings')}</span>
                    <button className="servings-btn" onClick={incServings} aria-label={t('recipe.increase')}>+</button>
                  </div>
                </div>
                <ul className="ingredients-list">
                  {recipe.ingredients &&
                    (() => {
                      const items = recipe.ingredients.map((ing, idx) => ({ ing, idx }));
                      items.sort((a, b) => {
                        const aChecked = checkedIngredients.has(a.idx);
                        const bChecked = checkedIngredients.has(b.idx);
                        if (aChecked === bChecked) return a.idx - b.idx;
                        return aChecked ? 1 : -1; // checked go to end
                      });
                      return items.map(({ ing, idx }) => {
                        const checkboxId = `ing-${idx}`;
                        if (Array.isArray(ing)) {
                          const [q, u, n] = ing;
                          const base = parseQuantity(q);
                          const scaled = base != null ? formatQuantity(base * scaleFactor) : (q?.toString() || '');
                          return (
                            <li key={idx} className={checkedIngredients.has(idx) ? 'checked' : ''} onClick={(e) => e.stopPropagation()}>
                              <label className="ing-row" htmlFor={checkboxId}>
                                <input
                                  id={checkboxId}
                                  type="checkbox"
                                  className="ing-checkbox"
                                  checked={checkedIngredients.has(idx)}
                                  onChange={toggleIngredient(idx)}
                                  aria-label={t('recipe.checkIngredient')}
                                />
                                <span className="ing-qty">{scaled} {u}</span>
                                <span className="ing-name">{n}</span>
                              </label>
                            </li>
                          );
                        }
                        return (
                          <li key={idx} className={checkedIngredients.has(idx) ? 'checked' : ''} onClick={(e) => e.stopPropagation()}>
                            <label className="ing-row" htmlFor={checkboxId}>
                              <input
                                id={checkboxId}
                                type="checkbox"
                                className="ing-checkbox"
                                checked={checkedIngredients.has(idx)}
                                onChange={toggleIngredient(idx)}
                                aria-label={t('recipe.checkIngredient')}
                              />
                              <span className="ing-name">{ing}</span>
                            </label>
                          </li>
                        );
                      });
                    })()
                  }
                </ul>
              </div>
              {showScrollHint && (
                <button
                  className="ingredients-scroll-indicator"
                  onClick={(e) => {
                    e.stopPropagation();
                    const el = sidebarRef.current;
                    if (el) {
                      el.scrollBy({ top: 300, behavior: 'smooth' });
                    }
                  }}
                  aria-label={t('recipe.scrollDown')}
                >
                  ↓
                </button>
              )}
            </aside>
            <main className="recipe-main" ref={containerRef}>
              <section className="recipe-steps-section">
                <div className="steps-header">
                  <h3>{t('recipe.preparationSteps')}</h3>
                  {hiddenSteps.size > 0 && (
                    <button className="toggle-hidden-btn" onClick={toggleShowHiddenSteps}>
                      {showHiddenSteps ? `✓ ${t('recipe.hideCompleted')}` : `↻ ${t('recipe.showCompleted').replace('{count}', hiddenSteps.size.toString())}`}
                    </button>
                  )}
                </div>
                <ol className="steps-list">
                  {recipe.steps && (() => {
                    const highlight = makeHighlighter();
                    return recipe.steps.map((s, idx) => {
                      const isHidden = hiddenSteps.has(idx);
                      const shouldShow = !isHidden || showHiddenSteps;
                      if (!shouldShow) return null;
                      return (
                        <li
                          key={idx}
                          className={`step-item ${isHidden ? 'step-hidden' : ''}`}
                          onClick={toggleStep(idx)}
                        >
                          <span className="step-number">{idx + 1}</span>
                          <div className="step-content">{highlight(s)}</div>
                        </li>
                      );
                    });
                  })()}
                </ol>
              </section>
            </main>
          </div>
        </div>
      )}
    </>
  );
};

// Memoize to prevent unnecessary re-renders
const Recipe = React.memo(RecipeComponent);
export default Recipe;
