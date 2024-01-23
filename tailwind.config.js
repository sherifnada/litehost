/** @type {import('tailwindcss').Config} */
export default {
  content: ["./frontend/**/*.{html,js}"],
  theme: {
      extend: {
        scale: {
          '102': '1.02',
          '98': '0.98',
        },
        rotate: {
          '20': '20deg',
          'neg20': '-20deg',
        },
        spacing: {
          '600':'600px',
          '450': '450px',
          '300': '300px',
          '225': '225px',
          '200': '200px',
          '160': '160px',
          '150': '150px',
          '130': '130px',
          '100': '100px',
          '90': '90px',
          '80': '80px',
          '75': '75px',
          '70': '70px',
          '50': '50px',
          '45': '45px',
          '40': '40px',
          '38': '38px',
          '30': '30px',
          '25': '25px',
          '20': '20px',
          '15': '15px',
          '12': '12px',
          '10': '10px',
          '5': '5px',
          '30%': '30%',
          '25%': '25%',
          '15%': '15%',

        },
        dropShadow: {
          'pink': '0 7px 0px rgba(250, 195, 209, 1)',
          'pinkhover': '0 9px 0px rgba(250, 195, 209, 1)',
          'pinkpress': '0 3px 0px rgba(250, 195, 209, 1)',
          'blue': '0 7px 0px rgba(135, 150, 255, 1)',
          'bluehover': '0 9px 0px rgba(135, 150, 255, 1)',
          'bluepress': '0 3px 0px rgba(135, 150, 255, 1)',
        },
      },
    fontFamily: {
      'sans': ['Lexend','sans-serif'],
      'open-sans': ['Open Sans', 'sans-serif'],
    },
    fontWeight: {
      'normal': '200',
      '300': 300,
      '400': 400,
      'bold': '600',
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      'grey': '#999999',
      'white': {
        100: '#ffffff',
        50: '#F3F3F3',
      },
      'black': {
        100: "#000000",
        50:'#131313',
      },
      'blue': {
        100: '#5469FA',
        50: '#8796FF',
      },
      'pink': {
        100: '#F87697',
        50: '#FAC3D1',
      },
      'webflow': '#146EF5',
      'wix': '#FBBD71',
    },
    backgroundImage: {
      'zag-pattern': "url('images/zag-background.svg')",
    },
  plugins: [
  ],
  }
}
