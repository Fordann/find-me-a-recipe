import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import anime from 'animejs';
import '../styles/SwipeCard.css';

interface SwipeCardProps {
  recipe: {
    title: string;
    img: string;
    id: string;
  };
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  zIndex: number;
  isTop: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  recipe,
  onSwipeLeft,
  onSwipeRight,
  zIndex,
  isTop,
}) => {
  const { t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ startX: 0, startY: 0, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    // Reset position when card changes
    if (cardRef.current) {
      cardRef.current.style.transform = '';
      dragState.current = { startX: 0, startY: 0, offsetX: 0, offsetY: 0 };
      
      // Apply stacked transform for non-top cards
      if (!isTop && cardRef.current) {
        const stackedTransform = zIndex === 1 
          ? 'scale(0.95) translateY(10px)' 
          : 'scale(0.9) translateY(20px)';
        cardRef.current.style.transform = stackedTransform;
      }
    }
  }, [recipe.id, isTop, zIndex]);

  // Maintain stacked card transforms even during drag
  useEffect(() => {
    if (!isTop && cardRef.current && !isDragging) {
      const stackedTransform = zIndex === 1 
        ? 'scale(0.95) translateY(10px)' 
        : 'scale(0.9) translateY(20px)';
      cardRef.current.style.transform = stackedTransform;
    }
  }, [isTop, zIndex, isDragging]);

  const animateSwipeOut = useCallback((direction: 'left' | 'right') => {
    if (!cardRef.current) return;
    
    const distance = window.innerWidth * 1.5;
    
    // Create sparkles effect on right swipe (like)
    if (direction === 'right' && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Create multiple sparkles around the card
      for (let i = 0; i < 25; i++) {
        const sparkle = document.createElement('div');
        
        // Position sparkles around the card edges
        const side = i % 4; // 0: top, 1: right, 2: bottom, 3: left
        let startX = centerX;
        let startY = centerY;
        
        if (side === 0) { // top
          startX = rect.left + (rect.width * (i / 25)) * 4;
          startY = rect.top;
        } else if (side === 1) { // right
          startX = rect.right;
          startY = rect.top + (rect.height * ((i - 6) / 25)) * 4;
        } else if (side === 2) { // bottom
          startX = rect.left + (rect.width * ((i - 12) / 25)) * 4;
          startY = rect.bottom;
        } else { // left
          startX = rect.left;
          startY = rect.top + (rect.height * ((i - 18) / 25)) * 4;
        }
        
        sparkle.style.position = 'fixed';
        sparkle.style.left = `${startX}px`;
        sparkle.style.top = `${startY}px`;
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '4000';
        sparkle.innerHTML = '✨';
        sparkle.style.fontSize = '32px';
        sparkle.style.filter = 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))';
        document.body.appendChild(sparkle);
        
        // Random outward direction from card edge
        const angle = Math.atan2(startY - centerY, startX - centerX) + (Math.random() - 0.5) * 0.8;
        const distance = 120 + Math.random() * 80;
        const targetX = startX + Math.cos(angle) * distance;
        const targetY = startY + Math.sin(angle) * distance;
        
        anime({
          targets: sparkle,
          translateX: targetX - startX,
          translateY: targetY - startY,
          scale: [1.2, 0],
          opacity: [1, 0],
          rotate: Math.random() * 720 - 360,
          duration: 800 + Math.random() * 400,
          easing: 'easeOutCubic',
          delay: Math.random() * 100,
          complete: () => sparkle.remove()
        });
      }
    }
    
    anime({
      targets: cardRef.current,
      translateX: direction === 'right' ? distance : -distance,
      translateY: dragState.current.offsetY,
      rotate: direction === 'right' ? 20 : -20,
      opacity: 0,
      duration: 400,
      easing: 'easeInOutQuad',
      complete: () => {
        dragState.current = { startX: 0, startY: 0, offsetX: 0, offsetY: 0 };
        if (direction === 'right') {
          onSwipeRight();
        } else {
          onSwipeLeft();
        }
      },
    });
  }, [onSwipeLeft, onSwipeRight]);



  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isTop || !cardRef.current) return;
    
    const deltaX = clientX - dragState.current.startX;
    const deltaY = clientY - dragState.current.startY;
    dragState.current.offsetX = deltaX;
    dragState.current.offsetY = deltaY;
    
    const rotation = deltaX / 20;
    cardRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;
    
    // Calculate swipe progress (0 to 1) - very progressive
    const swipeProgress = Math.min(1, Math.abs(deltaX) / 400);
    
    // Fade out image container very progressively
    const imageContainer = cardRef.current.querySelector('.swipe-card-image-container') as HTMLElement;
    if (imageContainer) {
      imageContainer.style.opacity = String(1 - swipeProgress * 0.9);
    }
    
    // Show gradient background on card very progressively
    const gradientOverlay = cardRef.current.querySelector('.swipe-card-gradient-overlay') as HTMLElement;
    if (gradientOverlay) {
      gradientOverlay.style.opacity = String(swipeProgress * 0.85);
    }
    
    // Update indicator opacity while maintaining rotation
    const likeIndicator = cardRef.current.querySelector('.swipe-like') as HTMLElement;
    const nopeIndicator = cardRef.current.querySelector('.swipe-nope') as HTMLElement;
    
    if (likeIndicator) {
      const opacity = Math.max(0, Math.min(1, deltaX / 300));
      likeIndicator.style.opacity = String(opacity);
      likeIndicator.style.transform = `translate(-50%, -50%) rotate(-15deg) scale(${1 + opacity * 0.2})`;
    }
    
    if (nopeIndicator) {
      const opacity = Math.max(0, Math.min(1, -deltaX / 300));
      nopeIndicator.style.opacity = String(opacity);
      nopeIndicator.style.transform = `translate(-50%, -50%) rotate(15deg) scale(${1 + opacity * 0.2})`;
    }
  }, [isTop]);

  const handleDragEnd = useCallback(() => {
    if (!isTop || !cardRef.current) return;
    console.log('Drag end', dragState.current.offsetX);
    setIsDragging(false);

    const threshold = 120;
    const offsetX = dragState.current.offsetX;
    
    if (Math.abs(offsetX) > threshold) {
      // Swipe detected
      const direction = offsetX > 0 ? 'right' : 'left';
      console.log('Swipe detected:', direction);
      animateSwipeOut(direction);
    } else {
      console.log('Returning to center');
      // Return to center with animation
      anime({
        targets: cardRef.current,
        translateX: 0,
        translateY: 0,
        rotate: 0,
        duration: 300,
        easing: 'easeOutElastic(1, .6)',
        begin: () => {
          // Reset transform immediately to prevent glitch
          if (cardRef.current) {
            cardRef.current.style.transition = 'none';
          }
        },
        complete: () => {
          if (cardRef.current) {
            cardRef.current.style.transition = '';
          }
        }
      });
      
      // Reset indicators with animation
      const likeIndicator = cardRef.current.querySelector('.swipe-like') as HTMLElement;
      const nopeIndicator = cardRef.current.querySelector('.swipe-nope') as HTMLElement;
      const imageContainer = cardRef.current.querySelector('.swipe-card-image-container') as HTMLElement;
      const gradientOverlay = cardRef.current.querySelector('.swipe-card-gradient-overlay') as HTMLElement;
      
      if (imageContainer) {
        anime({
          targets: imageContainer,
          opacity: 1,
          duration: 300,
          easing: 'easeOutQuad'
        });
      }
      
      if (gradientOverlay) {
        anime({
          targets: gradientOverlay,
          opacity: 0,
          duration: 300,
          easing: 'easeOutQuad'
        });
      }
      
      if (likeIndicator) {
        anime({
          targets: likeIndicator,
          opacity: 0,
          duration: 200,
          easing: 'easeOutQuad',
          complete: () => {
            if (likeIndicator) {
              likeIndicator.style.transform = 'translate(-50%, -50%) rotate(-15deg) scale(1)';
            }
          }
        });
      }
      if (nopeIndicator) {
        anime({
          targets: nopeIndicator,
          opacity: 0,
          duration: 200,
          easing: 'easeOutQuad',
          complete: () => {
            if (nopeIndicator) {
              nopeIndicator.style.transform = 'translate(-50%, -50%) rotate(15deg) scale(1)';
            }
          }
        });
      }
      
      dragState.current.offsetX = 0;
      dragState.current.offsetY = 0;
    }
  }, [isTop, animateSwipeOut]);

  useEffect(() => {
    // Global mouse events for better drag handling
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && isTop) {
        handleDragMove(e.clientX, e.clientY);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging && isTop) {
        handleDragEnd();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isTop, handleDragMove, handleDragEnd]);

  const handleDragStart = (clientX: number, clientY: number) => {
    if (!isTop) return;
    console.log('Drag start', recipe.title);
    setIsDragging(true);
    dragState.current.startX = clientX;
    dragState.current.startY = clientY;
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isTop) return;
    e.preventDefault();
    e.stopPropagation();
    handleDragStart(e.clientX, e.clientY);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTop) return;
    e.stopPropagation();
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTop) return;
    e.stopPropagation();
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    if (!isTop) return;
    handleDragEnd();
  };

  return (
    <div
      ref={cardRef}
      className={`swipe-card ${isDragging ? 'dragging' : ''} ${!isTop ? 'stacked' : ''}`}
      style={{
        zIndex,
        cursor: isTop ? 'grab' : 'default',
        pointerEvents: isTop ? 'auto' : 'none',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {!isTop && <div className="swipe-card-overlay" style={{ opacity: zIndex === 1 ? 0.2 : 0.5 }} />}
      <div className="swipe-card-gradient-overlay"></div>
      <div className="swipe-card-image-container">
        {recipe.img ? (
          <img 
            src={recipe.img} 
            alt={recipe.title} 
            className="swipe-card-image"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = '<div class="swipe-card-image-placeholder">🍽️</div>';
            }}
          />
        ) : (
          <div className="swipe-card-image-placeholder">🍽️</div>
        )}
      </div>
      <div className="swipe-card-content">
        <h3 className="swipe-card-title">{recipe.title}</h3>
      </div>
      
      {/* Indicators */}
      <div className="swipe-indicator swipe-like">
        <div className="indicator-content">
          <span className="indicator-icon">💖</span>
          <span className="indicator-text">{t('swipe.like')}</span>
        </div>
      </div>
      <div className="swipe-indicator swipe-nope">
        <div className="indicator-content">
          <span className="indicator-icon">💩</span>
          <span className="indicator-text">{t('swipe.pass')}</span>
        </div>
      </div>
    </div>
  );
};

export default SwipeCard;
