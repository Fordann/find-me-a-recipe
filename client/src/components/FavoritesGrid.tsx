import React, { useState } from 'react';
import anime from 'animejs';
import '../styles/FavoritesGrid.css';
import { recipeCache } from '../utils/recipeCache';

interface FavoritesGridProps {
  favorites: string[];
  onRecipeClick: (recipeName: string, preloadedRecipe?: any) => void;
  onClose: () => void;
  onRemove?: (recipeName: string) => void;
}

const FavoritesGrid: React.FC<FavoritesGridProps> = ({ favorites, onRecipeClick, onClose, onRemove }) => {
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: string }>(() => {
    // Initialize from localStorage cache
    const cache = localStorage.getItem('recipe_images_cache');
    return cache ? JSON.parse(cache) : {};
  });
  const loadingRef = React.useRef<Set<string>>(new Set());

  // Batch load all favorite images with cache
  React.useEffect(() => {
    const toLoad = favorites.filter(name => !loadedImages[name] && !loadingRef.current.has(name));
    if (toLoad.length === 0) return;

    // Mark as loading
    toLoad.forEach(name => loadingRef.current.add(name));

    // Batch request - send all recipe names at once
    const loadBatch = async () => {
      try {
        const responses = await Promise.all(
          toLoad.map(recipeName =>
            fetch('/recipe_image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: recipeName, language: (localStorage.getItem('app_language') === 'fr') ? 'fr' : 'en' })
            }).then(r => r.ok ? r.json() : null)
              .then(data => ({ name: recipeName, image: data?.image }))
              .catch(() => ({ name: recipeName, image: null }))
          )
        );

        const newImages: { [key: string]: string } = {};
        responses.forEach(({ name, image }) => {
          if (image) newImages[name] = image;
          loadingRef.current.delete(name);
        });

        if (Object.keys(newImages).length > 0) {
          setLoadedImages(prev => {
            const updated = { ...prev, ...newImages };
            // Cache to localStorage
            localStorage.setItem('recipe_images_cache', JSON.stringify(updated));
            return updated;
          });
        }
      } catch (error) {
        console.error('Batch image load failed:', error);
        toLoad.forEach(name => loadingRef.current.delete(name));
      }
    };

    loadBatch();
  }, [favorites, loadedImages]);

  return (
    <div className="favorites-grid-overlay">
      <div className="favorites-grid-header">
        <button className="favorites-close-btn" onClick={onClose}>✕</button>
      </div>
      
      <div className="favorites-grid-container">
        {favorites.length === 0 ? (
          <div className="favorites-empty">
            <p>No favorites yet</p>
            <p className="favorites-empty-hint">Swipe right to add recipes!</p>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((recipeName) => (
              <div 
                key={recipeName} 
                className="favorite-card"
              >
                {onRemove && (
                  <button 
                    className="favorite-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(recipeName);
                    }}
                    aria-label="Remove from favorites"
                  >
                    ✕
                  </button>
                )}
                <div className="favorite-card-image-wrapper" onClick={async (e) => {
                  const target = e.currentTarget;
                  const img = target.querySelector('img');
                  
                  if (img) {
                    // Get the position of the clicked image
                    const rect = target.getBoundingClientRect();
                    
                    // Create a div with background image instead of img clone for better control
                    const clone = document.createElement('div');
                    clone.style.position = 'fixed';
                    clone.style.top = `${rect.top}px`;
                    clone.style.left = `${rect.left}px`;
                    clone.style.width = `${rect.width}px`;
                    clone.style.height = `${rect.height}px`;
                    clone.style.zIndex = '3000';
                    clone.style.borderRadius = '16px';
                    clone.style.backgroundImage = `url(${img.src})`;
                    clone.style.backgroundSize = 'cover';
                    clone.style.backgroundPosition = 'center';
                    clone.style.overflow = 'hidden';
                    
                    // Add overlay that will fade in
                    const overlay = document.createElement('div');
                    overlay.style.position = 'absolute';
                    overlay.style.inset = '0';
                    overlay.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)';
                    overlay.style.opacity = '0';
                    clone.appendChild(overlay);
                    
                    document.body.appendChild(clone);
                    
                    // Check cache first
                    const cached = recipeCache.get(recipeName);
                    let recipePromise: Promise<any>;
                    
                    if (cached) {
                      console.log('Using cached recipe for animation:', recipeName);
                      recipePromise = Promise.resolve(cached);
                    } else {
                      // Start loading the recipe in parallel with the animation
                      recipePromise = fetch('/detailed_recipe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ language: (localStorage.getItem('app_language') === 'fr') ? 'fr' : 'en', ingredients: { aqt: recipeName } })
                      }).then(res => res.json());
                    }
                    
                    // Animate the clone to full screen with the same styling as recipe-hero-image
                    anime({
                      targets: clone,
                      top: 0,
                      left: 0,
                      width: '100vw',
                      height: '100vh',
                      borderRadius: 0,
                      duration: 400,
                      easing: 'easeOutCubic',
                      complete: async () => {
                        // Wait for recipe to be loaded
                        const preloadedRecipe = await recipePromise;
                        onRecipeClick(recipeName, preloadedRecipe);
                        // Remove clone after navigation
                        setTimeout(() => clone.remove(), 100);
                      }
                    });
                    
                    // Fade in the overlay during animation
                    anime({
                      targets: overlay,
                      opacity: [0, 1],
                      duration: 400,
                      easing: 'easeOutCubic'
                    });
                    
                    // Fade out the grid overlay
                    anime({
                      targets: '.favorites-grid-overlay',
                      opacity: 0,
                      duration: 300,
                      easing: 'easeOutQuad'
                    });
                  } else {
                    // No image loaded, just trigger click
                    onRecipeClick(recipeName);
                  }
                }}>
                  {loadedImages[recipeName] ? (
                    <img 
                      src={loadedImages[recipeName]} 
                      alt={recipeName}
                      className="favorite-card-image"
                    />
                  ) : (
                    <div className="favorite-card-placeholder">
                      <div className="favorite-loading-spinner"></div>
                    </div>
                  )}
                </div>
                <h3 className="favorite-card-title">{recipeName}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesGrid;
