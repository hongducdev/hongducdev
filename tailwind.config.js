module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      keyframes: {
        wiggle: {
            '0%, 100%': {
                transform: 'rotate(-3deg)'
            },
            '50%': {
                transform: 'rotate(3deg)'
            },
        },
        shake: {
            '0%, 100%': {
                transform: 'origin-bottom rotate(-12deg)'
            },
            '50%': {
                transform: 'origin-bottom rotate(0deg)'
            },
        }
      },
      animation: {
          wiggle: 'wiggle 1s ease-in-out infinite',
          shake: 'shake 1s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}