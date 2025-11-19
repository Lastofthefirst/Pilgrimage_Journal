// Design System for Pilgrim Notes PWA
// A modern, elegant design system with beautiful colors and styles

export const colors = {
  primary: {
    50: '#E6F2F5',
    100: '#CCE5EB',
    200: '#99CBD7',
    300: '#66B1C3',
    400: '#3397AF',
    500: '#015D7C',
    600: '#014A63',
    700: '#01374A',
    800: '#012432',
    900: '#011E2B'
  },
  accent: {
    50: '#F0F9FE',
    100: '#E6F5FD',
    200: '#DCF1FA',
    300: '#C9EAF8',
    400: '#B3E3F5',
    500: '#9EDCF3',
    600: '#7BCFEF',
    700: '#58C2EB',
    800: '#35B5E7',
    900: '#12A8E3'
  },
  gradient: {
    ocean: 'linear-gradient(135deg, #015D7C 0%, #0284A8 50%, #0891B2 100%)',
    sunset: 'linear-gradient(135deg, #015D7C 0%, #014A63 100%)',
    soft: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)',
    hero: 'linear-gradient(180deg, rgba(1, 93, 124, 0.7) 0%, rgba(1, 55, 74, 0.9) 100%)',
    card: 'linear-gradient(135deg, #FFFFFF 0%, #F0F9FE 100%)',
  },
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
    accent: '#E6F2F5',
  },
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
  }
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  card: '0 2px 8px rgba(1, 93, 124, 0.08), 0 1px 3px rgba(1, 93, 124, 0.05)',
  cardHover: '0 8px 24px rgba(1, 93, 124, 0.12), 0 4px 8px rgba(1, 93, 124, 0.08)',
  float: '0 12px 28px rgba(1, 93, 124, 0.15), 0 8px 16px rgba(1, 93, 124, 0.1)',
};

export const borderRadius = {
  sm: '0.375rem',
  base: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
  full: '9999px',
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
};

export const typography = {
  fontFamily: {
    display: '"Playfair Display", Georgia, serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    handwritten: '"Caveat", cursive',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: '500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

export const animations = {
  fadeIn: 'fadeIn 0.3s ease-in',
  slideUp: 'slideUp 0.3s ease-out',
  slideInRight: 'slideInRight 0.3s ease-out',
  scaleIn: 'scaleIn 0.2s ease-out',
  ripple: 'ripple 0.6s ease-out',
  pulse: 'pulse 2s ease-in-out infinite',
  shimmer: 'shimmer 2s linear infinite',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Helper function to get gradient CSS
export const getGradient = (name: keyof typeof colors.gradient): string => {
  return colors.gradient[name];
};

// Helper function to get shadow CSS
export const getShadow = (name: keyof typeof shadows): string => {
  return shadows[name];
};

// Glassmorphism effect
export const glassmorphism = {
  light: 'rgba(255, 255, 255, 0.7)',
  medium: 'rgba(255, 255, 255, 0.5)',
  dark: 'rgba(255, 255, 255, 0.3)',
  blur: 'blur(10px)',
};
