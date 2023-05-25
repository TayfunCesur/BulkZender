module.exports = {
  content: [
    "./screens/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    darkModek:true,
    extend:{
      colors: {
        primaryBackground: '#353759',
        primaryColor: '#1FC7D4',
        toolbar: '#27262C',
        midnight: '#121063',
        cardBg: '#27262C',
        inputBg: '#372f47'
      },
    }
  }
};