import { useRef, useState, type ReactNode } from 'react';

interface SwipeableRowProps {
  children: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SwipeableRow({
  children,
  onEdit,
  onDelete
}: SwipeableRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const startX = useRef(0);
  const currentX = useRef(0);

  const SWIPE_THRESHOLD = 80;
  const MAX_SWIPE = 160;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - startX.current;

    if (isOpen) {
      // Already open, can swipe back to close
      if (deltaX < 0) {
        setTranslateX(Math.max(deltaX, -MAX_SWIPE));
      }
    } else {
      // Not open, swipe right to open edit, left to open delete
      if (deltaX > 0) {
        setTranslateX(Math.min(deltaX, MAX_SWIPE));
      }
    }

    currentX.current = deltaX;
  };

  const handleTouchEnd = () => {
    if (currentX.current > SWIPE_THRESHOLD) {
      // Swipe right = Edit
      setTranslateX(MAX_SWIPE);
      setIsOpen(true);
    } else if (currentX.current < -SWIPE_THRESHOLD) {
      // Swipe left = Delete
      setTranslateX(-MAX_SWIPE);
      setIsOpen(true);
    } else if (isOpen) {
      // Keep open
      if (translateX > 0) {
        setTranslateX(MAX_SWIPE);
      } else {
        setTranslateX(-MAX_SWIPE);
      }
    } else {
      setTranslateX(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    currentX.current = 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX.current;

      if (isOpen) {
        if (deltaX < 0) {
          setTranslateX(Math.max(deltaX, -MAX_SWIPE));
        }
      } else {
        if (deltaX > 0) {
          setTranslateX(Math.min(deltaX, MAX_SWIPE));
        }
      }

      currentX.current = deltaX;
    };

    const handleMouseUp = () => {
      if (currentX.current > SWIPE_THRESHOLD) {
        setTranslateX(MAX_SWIPE);
        setIsOpen(true);
      } else if (currentX.current < -SWIPE_THRESHOLD) {
        setTranslateX(-MAX_SWIPE);
        setIsOpen(true);
      } else if (isOpen) {
        if (translateX > 0) {
          setTranslateX(MAX_SWIPE);
        } else {
          setTranslateX(-MAX_SWIPE);
        }
      } else {
        setTranslateX(0);
      }

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const close = () => {
    setTranslateX(0);
    setIsOpen(false);
  };

  return (
    <div className="relative overflow-hidden rounded-[20px]">
      {/* Left side - Edit button (shows on swipe right) */}
      {onEdit && (
        <div
          className="flex absolute inset-y-0 left-0 w-[80px]"
          style={{ transform: `translateX(${translateX - MAX_SWIPE}px)` }}
        >
          <button
            onClick={() => {
              onEdit();
              close();
            }}
            className="flex-1 flex items-center justify-center bg-[#3A3A3A]"
          >
            <span className="text-sm font-semibold text-brand-text">Edit</span>
          </button>
        </div>
      )}

      {/* Right side - Delete button (shows on swipe left) */}
      {onDelete && (
        <div
          className="flex absolute inset-y-0 right-0 w-[80px]"
          style={{ transform: `translateX(${translateX + MAX_SWIPE}px)` }}
        >
          <button
            onClick={() => {
              onDelete();
              close();
            }}
            className="flex-1 flex items-center justify-center bg-brand-primary"
          >
            <span className="text-sm font-semibold text-brand-text-primary">Delete</span>
          </button>
        </div>
      )}

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={{ transform: `translateX(${translateX}px)` }}
        className="transition-transform duration-200 ease-out"
      >
        {children}
      </div>
    </div>
  );
}