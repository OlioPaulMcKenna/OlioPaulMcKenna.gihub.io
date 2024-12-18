// src/components/CalendarWindow.tsx

import React from 'react';
import { CalendarWindow as CalendarWindowType } from '../types';
import { BACKGROUND_IMAGE_URL } from '../constants';
import { useModal } from '../contexts/ModalContext';
import { useWindowInteractions } from '../hooks/useWindowInteractions';
import { trackDoorOpen } from '../utils/analytics';

interface Props {
  window: CalendarWindowType;
  onWindowClick: (day: number) => void;
  onWindowClose: (day: number) => void;
  day: string | null;
}

export const CalendarWindow: React.FC<Props> = ({
  window,
  onWindowClick,
  onWindowClose,
  day: activeDay,
}) => {
  const { openModal, closeModal } = useModal();
  const { day: windowDay, isOpen } = window;
  const [showClickMessage, setShowClickMessage] =
    React.useState(false);

  const {
    showMessage,
    isShaking,
    isFadingOut,
    showContent,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleBackClick,
    handleDoorFrontClick,
    canOpenDoor,
    openingDateMessage,
  } = useWindowInteractions({
    day: windowDay,
    isOpen,
    activeDay,
    onWindowClick,
    onWindowClose,
  });

  const backgroundStyle = {
    backgroundImage: `url("${BACKGROUND_IMAGE_URL}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transform: `translate(${-window.x}px, ${-window.y}px)`,
    width: '100dvw',
    height: '100dvh',
    position: 'absolute' as const,
    top: '0',
    left: '0',
    transformOrigin: '0 0',
  };

  const thumbnailStyle = {
    backgroundImage: `url("/content/day${windowDay}-thumb.jpeg")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    width: '100%',
    height: '100%',
  };

  const fullImageStyle = {
    backgroundImage: `url("/content/day${windowDay}.jpg")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    width: '100%',
    height: '100%',
  };

  // Show click message when zoomed in to door 1
  React.useEffect(() => {
    if (windowDay === 1 && activeDay === '1') {
      // Small delay to let the zoom animation complete
      const timer = setTimeout(() => {
        setShowClickMessage(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShowClickMessage(false);
    }
  }, [windowDay, activeDay, isOpen]);

  // Handle modal opening when window is opened
  React.useEffect(() => {
    if (isOpen && activeDay === String(windowDay)) {
      const timer = setTimeout(() => {
        openModal(windowDay);
      }, 700); // Match the door opening animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeDay, windowDay, openModal]);

  // Close modal when navigating away
  React.useEffect(() => {
    if (!activeDay) {
      closeModal();
    }
  }, [activeDay, closeModal]);

  return (
    <div
      className="calendar-window absolute pointer-events-auto"
      style={{
        perspective: '2000px',
        left: `${window.x}px`,
        top: `${window.y}px`,
        width: window.width,
        height: window.height,
        willChange: 'transform',
      }}
      onTouchStart={(e) => handleTouchStart(e)}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        e.stopPropagation();
        // When zoomed out and door is open, zoom in on tap
        if (!activeDay && isOpen) {
          onWindowClick(windowDay);
          trackDoorOpen(windowDay);
        }
      }}
    >
      <div
        className={`door ${isOpen ? 'open' : ''} ${
          !canOpenDoor ? 'locked' : ''
        } ${isShaking ? 'shake' : ''}`}
        style={{
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        <div className="door-front" onClick={handleDoorFrontClick}>
          <div className="door-front-image" style={backgroundStyle} />
          <div className="door-number">{windowDay}</div>
          {windowDay === 1 && !isOpen && !activeDay && (
            <div className={`start-label `}>Start here</div>
          )}

          {showMessage && !canOpenDoor && (
            <div
              className={`date-message ${
                isFadingOut ? 'fade-out' : ''
              }`}
            >
              {openingDateMessage}
            </div>
          )}
          {showClickMessage && (
            <div className="click-message">Click to open</div>
          )}
        </div>
        <div
          className="door-back"
          onClick={handleBackClick}
          onTouchStart={(e) => {
            e.stopPropagation();
            handleTouchStart(e, true);
          }}
          style={{
            position: 'absolute',
            inset: '0',
            cursor: 'pointer',
            zIndex: 10,
            backfaceVisibility: 'hidden',
          }}
        />
      </div>
      <div
        className="content-behind rounded-lg"
        onClick={(e) => {
          e.stopPropagation();
          // When zoomed out and door is open, zoom in on tap
          if (!activeDay && isOpen) {
            onWindowClick(windowDay);
            trackDoorOpen(windowDay);
          }
        }}
        style={{
          cursor: isOpen ? 'pointer' : 'default',
        }}
      >
        {showContent && (
          <div className="relative w-full h-full">
            <div
              style={thumbnailStyle}
              className={`absolute inset-0 rounded-lg transition-all duration-500 ${
                activeDay === String(windowDay) &&
                'md:opacity-0 md:transition-delay-0'
              } sm:opacity-100`}
            />
            <div
              style={fullImageStyle}
              className={`absolute inset-0 rounded-lg transition-all duration-500 hidden md:block ${
                activeDay === String(windowDay)
                  ? 'md:opacity-100 md:transition-delay-0'
                  : 'md:opacity-0 md:transition-delay-300'
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );
};
