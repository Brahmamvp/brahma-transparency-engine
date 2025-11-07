/** @type {import('tailwindcss').Config} */
export default {
  content: [
  "./index.html",
  "./apps/**/*.{js,ts,jsx,tsx}",
  "./src/**/*.{js,ts,jsx,tsx}",
],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      colors: {
        'brahma': {
          'dark': '#1a1625',
          'purple': '#2d1b69',
          'medium': '#4c2885',
          'light': '#6b46c1',
          'accent': '#8b5cf6'
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'recording-pulse': 'recordingPulse 1.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'glow-pulse': 'glowPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)', opacity: '0.3' },
          '25%': { transform: 'translateY(-20px) translateX(10px)', opacity: '0.6' },
          '50%': { transform: 'translateY(-10px) translateX(-5px)', opacity: '0.4' },
          '75%': { transform: 'translateY(-30px) translateX(15px)', opacity: '0.7' }
        },
        recordingPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        glowPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-strong': '0 12px 40px 0 rgba(31, 38, 135, 0.5)',
        'glow': '0 4px 15px 0 rgba(168, 85, 247, 0.4)',
        'glow-strong': '0 8px 25px 0 rgba(168, 85, 247, 0.6)'
      }
    },
  },
  plugins: [],
}
