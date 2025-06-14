
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'poppins': ['Poppins', 'sans-serif'],
				'inter': ['Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Custom red and black theme colors
				crimson: {
					50: '#fff1f2',
					100: '#ffe4e6',
					200: '#fecdd3',
					300: '#fda4af',
					400: '#fb7185',
					500: '#DC143C',
					600: '#be123c',
					700: '#9f1239',
					800: '#881337',
					900: '#7c2d12',
				},
				cherry: {
					50: '#fff1f1',
					100: '#ffe1e1',
					200: '#ffc7c7',
					300: '#ffa0a0',
					400: '#ff6b6b',
					500: '#FF1744',
					600: '#e60026',
					700: '#cc001f',
					800: '#b30019',
					900: '#800012',
				},
				scarlet: {
					50: '#fff2f0',
					100: '#ffe3e0',
					200: '#ffcdc6',
					300: '#ffaa9f',
					400: '#ff7a6b',
					500: '#FF2400',
					600: '#e60800',
					700: '#cc0700',
					800: '#b30600',
					900: '#800400',
				},
				dark: {
					50: '#f8f8f8',
					100: '#f0f0f0',
					200: '#e0e0e0',
					300: '#c0c0c0',
					400: '#808080',
					500: '#404040',
					600: '#303030',
					700: '#202020',
					800: '#121212',
					900: '#0d0d0d',
				}
			},
			backgroundImage: {
				'gradient-hero': 'radial-gradient(circle at top left, #FF1744, #0d0d0d)',
				'gradient-card': 'linear-gradient(135deg, rgba(18, 18, 18, 0.9) 0%, rgba(30, 30, 30, 0.8) 100%)',
				'gradient-button': 'linear-gradient(135deg, #DC143C 0%, #FF1744 100%)',
				'gradient-accent': 'linear-gradient(to bottom right, #121212, #FF2400, #0d0d0d)',
				'gradient-warm': 'linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 50%, #0d0d0d 100%)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(30px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'pulse-glow': {
					'0%': {
						opacity: '0.7',
						transform: 'scale(1)'
					},
					'50%': {
						opacity: '1',
						transform: 'scale(1.02)'
					},
					'100%': {
						opacity: '0.7',
						transform: 'scale(1)'
					}
				},
				'bounce-gentle': {
					'0%, 100%': {
						transform: 'translateY(0)',
					},
					'50%': {
						transform: 'translateY(-8px)',
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'fade-in-up': 'fade-in-up 0.8s ease-out',
				'scale-in': 'scale-in 0.5s ease-out',
				'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
				'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
