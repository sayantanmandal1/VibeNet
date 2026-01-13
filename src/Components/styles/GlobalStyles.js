import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`

  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background-color: #000000;
    color: #ffffff;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    overflow-x: hidden;
    min-height: 100vh;
  }

  #root {
    min-height: 100vh;
    background: #000000;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    padding: 0;
    color: #ffffff;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

`;

export default GlobalStyles;
