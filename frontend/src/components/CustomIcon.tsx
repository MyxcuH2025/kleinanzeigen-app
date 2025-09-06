import React from 'react';
import { SvgIcon } from '@mui/material';

// Icon-Component für deine eigenen SVG-Icons
interface CustomIconProps {
  iconName: string;
  sx?: any;
  fontSize?: any;
  color?: any;
  [key: string]: any;
}

const CustomIcon: React.FC<CustomIconProps> = ({ iconName, ...props }) => {
  const getIconPath = (name: string): string => {
    const icons: { [key: string]: string } = {
      // SettingsPage Icons
      'profile': 'M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z',
      'settings': 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M19.4 13.5c.1-.5.1-1 .1-1.5s0-1-.1-1.5l2-1.5-2-3.5-2.3 1a6.3 6.3 0 0 0-2.6-1.5l-.4-2.5h-4l-.4 2.5a6.3 6.3 0 0 0-2.6 1.5l-2.3-1-2 3.5 2 1.5c-.1.5-.1 1-.1 1.5s0 1 .1 1.5l-2 1.5 2 3.5 2.3-1a6.3 6.3 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a6.3 6.3 0 0 0 2.6-1.5l2.3 1 2-3.5-2-1.5z',
      'notification': 'M18 16c0-1.5 0-3.5 0-5a6 6 0 0 0-12 0c0 1.5 0 3.5 0 5l-2 3h16l-2-3z M10.5 20a1.5 1.5 0 0 0 3 0',
      'datenschutz': 'M3 9h6l1.5-2H18a2 2 0 0 1 2 2v3 M3 9v9a2 2 0 0 0 2 2h8 M17.5 12.5l2.2 1.1v2.6c0 2.2-1.5 4.1-3.7 4.9-2.2-0.8-3.7-2.7-3.7-4.9v-2.6l2.2-1.1h3Z M15.5 16l1.2 1.2 2.3-2.3',
      'pen': 'M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
      
      // Weitere Icons
      'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      'chat': 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
      'favorite': 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
      'search': 'M11 2a9 9 0 1 0 9 9 9 9 0 0 0-9-9z M21 21l-4.35-4.35',
      'add': 'M12 5v14 M5 12h14',
      'delete': 'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
      'share': 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13',
      'filter': 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
      'location': 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
      'phone': 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
      'website': 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
      'calendar': 'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
      'tag': 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01',
      'view': 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
      'bookmark': 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z',
      'gallery': 'M3 3h18v18H3V3z M8 8h8v8H8V8z',
      'video': 'M23 7l-7 5 7 5V7z M14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11V5z',
      'mehr': 'M12 5v.01 M12 12v.01 M12 19v.01 M12 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2z M12 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2z M12 20a1 1 0 1 1 0-2 1 1 0 0 1 0 2z',
      'back': 'M19 12H5 M12 19l-7-7 7-7',
      'logout': 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
      'hilfe': 'M9 12l2 2 4-4 M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z',
      'kategorien': 'M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2-2z M8 5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2H8V5z',
      
      // Entity Type Icons - bessere Zuordnung
      'user-type': 'M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 4-7 8-7s8 3 8 7',
      'shop-type': 'M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01',
      'provider-type': 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
      
      // Verification Icons
      'verified': 'M9 12l2 2 4-4 M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z',
      'certified': 'M9 12l2 2 4-4 M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z',
      
      // Status Icons - schlichte Linien
      'verified-seller': 'M9 12l2 2 4-4 M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z',
      'no-purchases': 'M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01',
      'no-sales': 'M1 3h15l4 7-4 7H1V3z M5 7h6 M5 11h6',
      'response-time': 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z M12 6v6l4 2',
      
      // Business Icons - schlichte Linien
      'briefcase': 'M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z M8 5V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2 M8 7h8 M10 9h4 M8 11h8 M10 13h4'
    };
    
    return icons[name] || icons['settings']; // Fallback zu settings
  };

  return (
    <SvgIcon {...props} viewBox="0 0 24 24" sx={{ color: '#1a1a1a', ...props.sx }}>
      <path 
        d={getIconPath(iconName)} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
};

export default CustomIcon;
