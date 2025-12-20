import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Define a light theme with neutral colours and a single primary accent. The
// typography uses the system default stack but can be customized to load
// Inter or another font family. Component border radii are increased to
// 12 px to match the design specification. Using responsiveFontSizes makes
// typography scale better on small screens.
let theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2'
    }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
      'sans-serif'
    ].join(',')
  }
});

theme = responsiveFontSizes(theme);

export default theme;