import { useRef, useState, useEffect, type ReactNode } from 'react';

interface SwipeableRowProps {
  children: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SwipeableRow({ children, onEdit, onDelete }: SwipeableRowProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const rowRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 75;
  const MAX_SWIPE = 160;

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) {
        setTranslateX(0);
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - startX.current;

    // Allow swipe in both directions when closed, and reverse when open
    if (isOpen) {
      // When open, swipe in opposite direction to close
      const currentDirection = translateX > 0 ? 1 : -1;
      if (deltaX * currentDirection < 0) {
        // Swiping in opposite direction
        setTranslateX(translateX + deltaX * 0.5);
      }
    } else {
      // When closed, allow both directions
      const clampedDelta = Math.max(-MAX_SWIPE, Math.min(deltaX, MAX_SWIPE));
      setTranslateX(clampedDelta);
    }

    currentX.current = deltaX;
  };

  const handleTouchEnd = () => {
    const threshold = SWIPE_THRESHOLD;

    if (isOpen) {
      // If already open, close if swiped enough in any direction
      if (Math.abs(currentX.current) > threshold) {
        setTranslateX(0);
        setIsOpen(false);
      } else {
        // Keep current position
        setTranslateX(translateX > 0 ? MAX_SWIPE : -MAX_SWIPE);
      }
    } else {
      // Not open yet
      if (currentX.current > threshold) {
        // Swipe right = Edit
        setTranslateX(MAX_SWIPE);
        setIsOpen(true);
      } else if (currentX.current < -threshold) {
        // Swipe left = Delete
        setTranslateX(-MAX_SWIPE);
        setIsOpen(true);
      } else {
        // Didn't swipe enough, snap back
        setTranslateX(0);
      }
    }

    currentX.current = 0;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if clicking on interactive elements
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;

    startX.current = e.clientX;
    currentX.current = 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX.current;

      if (isOpen) {
        const currentDirection = translateX > 0 ? 1 : -1;
        if (deltaX * currentDirection < 0) {
          setTranslateX(translateX + deltaX * 0.5);
        }
      } else {
        const clampedDelta = Math.max(-MAX_SWIPE, Math.min(deltaX, MAX_SWIPE));
        setTranslateX(clampedDelta);
      }

      currentX.current = deltaX;
    };

    const handleMouseUp = () => {
      const threshold = SWIPE_THRESHOLD;

      if (isOpen) {
        if (Math.abs(currentX.current) > threshold) {
          setTranslateX(0);
          setIsOpen(false);
        } else {
          setTranslateX(translateX > 0 ? MAX_SWIPE : -MAX_SWIPE);
        }
      } else {
        if (currentX.current > threshold) {
          setTranslateX(MAX_SWIPE);
          setIsOpen(true);
        } else if (currentX.current < -threshold) {
          setTranslateX(-MAX_SWIPE);
          setIsOpen(true);
        } else {
          setTranslateX(0);
        }
      }

      currentX.current = 0;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Calculate button visibility based on translateX
  const editButtonVisible = translateX > 10;
  const deleteButtonVisible = translateX < -10;

  return (
    <div ref={rowRef} className='relative overflow-hidden rounded-[20px]'>
      {/* Left side - Edit button (shows on swipe right) */}
      {onEdit && (
        <div
          className='flex absolute inset-y-0 left-0 items-center justify-end w-[80px] pr-2'
          style={{
            opacity: editButtonVisible ? 1 : 0,
            transition: 'opacity 0.2s',
            pointerEvents: editButtonVisible ? 'auto' : 'none',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
              close();
            }}
            className='bg-[#3A3A3A] px-3 py-2 rounded-lg active:scale-95 transition-transform'
          >
            <span className='text-sm font-semibold text-brand-text'>Edit</span>
          </button>
        </div>
      )}

      {/* Right side - Delete button (shows on swipe left) */}
      {onDelete && (
        <div
          className='flex absolute inset-y-0 right-0 items-center justify-start w-[80px] pl-2'
          style={{
            opacity: deleteButtonVisible ? 1 : 0,
            transition: 'opacity 0.2s',
            pointerEvents: deleteButtonVisible ? 'auto' : 'none',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              close();
            }}
            className='bg-brand-primary px-3 py-2 rounded-lg active:scale-95 transition-transform'
          >
            <span className='text-sm font-semibold text-brand-text-primary'>Delete</span>
          </button>
        </div>
      )}

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={{ transform: `translateX(${translateX}px)` }}
        className={`transition-transform duration-200 ${!isOpen && translateX === 0 ? '' : 'duration-0'}`}
      >
        {children}
      </div>
    </div>
  );
}
