import React from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Typography,
  useTheme,
  Fade,
  Slide,
  Zoom,
  Grow,
  Collapse
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';

// Smooth Transition Komponenten
export const SlideTransition: React.FC<{
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  in?: boolean;
  timeout?: number;
}> = ({ children, direction = 'up', in: inProp = true, timeout = 300 }) => (
  <Slide direction={direction} in={inProp} timeout={timeout}>
    <Box>{children}</Box>
  </Slide>
);

export const FadeTransition: React.FC<{
  children: React.ReactNode;
  in?: boolean;
  timeout?: number;
}> = ({ children, in: inProp = true, timeout = 300 }) => (
  <Fade in={inProp} timeout={timeout}>
    <Box>{children}</Box>
  </Fade>
);

export const ZoomTransition: React.FC<{
  children: React.ReactNode;
  in?: boolean;
  timeout?: number;
}> = ({ children, in: inProp = true, timeout = 300 }) => (
  <Zoom in={inProp} timeout={timeout}>
    <Box>{children}</Box>
  </Zoom>
);

// Animated Search Bar
export const AnimatedSearchBar: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: () => void;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}> = ({ 
  value, 
  onChange, 
  placeholder = "Suchen...", 
  onSearch,
  suggestions = [],
  onSuggestionClick
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          border: '2px solid',
          borderColor: isFocused ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 1,
          transition: 'all 0.3s ease',
          backgroundColor: '#ffffff',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }
        }}
      >
        <SearchIcon 
          sx={{ 
            mr: 1, 
            color: isFocused ? 'primary.main' : 'text.secondary',
            transition: 'color 0.3s ease'
          }} 
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            // Verzögerung für Klick-Events
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
          style={{
            border: 'none',
            outline: 'none',
            flex: 1,
            fontSize: '16px',
            backgroundColor: 'transparent'
          }}
        />
        {value && (
          <FadeTransition in={!!value}>
            <IconButton
              size="small"
              onClick={() => onChange('')}
              sx={{ ml: 1 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </FadeTransition>
        )}
        {onSearch && (
          <Button
            variant="contained"
            onClick={onSearch}
            sx={{ ml: 1, borderRadius: 1 }}
          >
            Suchen
          </Button>
        )}
      </Box>
      
      {/* Animated Suggestions */}
      <Collapse in={showSuggestions && suggestions.length > 0}>
        <Box
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            mt: 1,
            bgcolor: '#ffffff',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          {suggestions.map((suggestion, index) => (
            <Grow in={showSuggestions} timeout={index * 100} key={suggestion}>
              <Box
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  },
                  borderBottom: index < suggestions.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider'
                }}
                onClick={() => onSuggestionClick?.(suggestion)}
              >
                <Typography variant="body2">{suggestion}</Typography>
              </Box>
            </Grow>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

// Animated Filter Chips
export const AnimatedFilterChip: React.FC<{
  label: string;
  onDelete?: () => void;
  color?: 'default' | 'primary' | 'secondary';
  variant?: 'filled' | 'outlined';
}> = ({ label, onDelete, color = 'primary', variant = 'filled' }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <ZoomTransition in={true} timeout={300}>
      <Chip
        label={label}
        onDelete={onDelete}
        color={color}
        variant={variant}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          m: 0.5,
          transition: 'all 0.3s ease',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }
        }}
      />
    </ZoomTransition>
  );
};

// Animated Accordion
export const AnimatedAccordion: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
}> = ({ title, children, defaultExpanded = false, icon }) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        mb: 2
      }}
    >
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          p: 2,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: expanded ? 'primary.main' : '#ffffff',
          color: expanded ? 'white' : 'text.primary',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: expanded ? 'primary.dark' : 'action.hover'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
        </Box>
        <SlideTransition direction="up" in={expanded}>
          <ArrowUpIcon />
        </SlideTransition>
        <SlideTransition direction="down" in={!expanded}>
          <ArrowDownIcon />
        </SlideTransition>
      </Box>
      
      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
};

// Loading Skeleton mit Animation
export const AnimatedSkeleton: React.FC<{
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave';
}> = ({ 
  variant = 'rectangular', 
  width = '100%', 
  height = 20, 
  animation = 'pulse' 
}) => {
  return (
    <Box
      sx={{
        width,
        height,
        backgroundColor: 'grey.300',
        borderRadius: variant === 'circular' ? '50%' : 1,
        animation: `${animation} 1.5s ease-in-out infinite`,
        '@keyframes pulse': {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.4 },
          '100%': { opacity: 1 }
        },
        '@keyframes wave': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      }}
    />
  );
};

// Animated Counter
export const AnimatedCounter: React.FC<{
  value: number;
  duration?: number;
  format?: (value: number) => string;
}> = ({ value, duration = 1000, format = (v) => v.toString() }) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const difference = value - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + difference * easeOut;
      
      setDisplayValue(Math.round(currentValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [value, duration]);

  return <span>{format(displayValue)}</span>;
};

// Haptic Feedback Hook
export const useHapticFeedback = () => {
  const triggerHaptic = React.useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 50,
        heavy: 100
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  return { triggerHaptic };
};

// Swipe Gesture Hook
export const useSwipeGesture = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold = 50
) => {
  const [touchStart, setTouchStart] = React.useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe) {
      if (Math.abs(distanceX) > threshold) {
        if (distanceX > 0 && onSwipeLeft) {
          onSwipeLeft();
        } else if (distanceX < 0 && onSwipeRight) {
          onSwipeRight();
        }
      }
    } else {
      if (Math.abs(distanceY) > threshold) {
        if (distanceY > 0 && onSwipeUp) {
          onSwipeUp();
        } else if (distanceY < 0 && onSwipeDown) {
          onSwipeDown();
        }
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
}; 