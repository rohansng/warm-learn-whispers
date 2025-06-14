
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
				'orbitron': ['Orbitron', 'monospace'],
				'poppins': ['Poppins', 'sans-serif'],
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
				// White & Red Cherry Cream theme colors
				'cherry-red': '#ff4b5c',
				'cherry-light': '#ff6b7a',
				'cherry-dark': '#e63946',
				'cream-white': '#ffffff',
				'cream-light': '#fef7f7',
				'cream-pink': '#ffe0e3',
				'soft-gray': '#f8f9fa',
			},
			backgroundImage: {
				'gradient-primary': 'linear-gradient(135deg, #ffffff, #ff4b5c)',
				'gradient-radial': 'radial-gradient(circle at top left, #ff4b5c, #ffffff)',
				'gradient-diagonal': 'linear-gradient(to bottom right, #fef7f7, #ff4b5c, #ffffff)',
				'gradient-footer': 'linear-gradient(to right, #ffffff, #ff4b5c)',
				'gradient-animated': 'linear-gradient(-45deg, #ffffff, #ff4b5c, #ff6b7a, #fef7f7)',
				'gradient-soft': 'linear-gradient(135deg, #fef7f7, #ffe0e3)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'bounce-gentle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'pulse-cherry': {
					'0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 75, 92, 0.7)' },
					'70%': { boxShadow: '0 0 0 10px rgba(255, 75, 92, 0)' }
				},
				'gradient-shift': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'fade-in-up': 'fade-in-up 0.8s ease-out',
				'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
				'scale-in': 'scale-in 0.4s ease-out',
				'pulse-cherry': 'pulse-cherry 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'gradient-shift': 'gradient-shift 8s ease infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
