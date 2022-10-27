import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
	breakpoints: {
		values: {
			xs: 360,
			sm: 414,
			md: 768,
			lg: 1366,
			xl: 1920
		}
	},
	typography: {
		fontFamily: ['Roboto', 'sans-serif'].join(',')
	},
	palette: {
		mode: 'light',
		background: {
			default: '#f3f5f6'
		},
		primary: {
			main: '#191c32'
		},
		secondary: {
			main: '#76c3e2'
		},
		success: {
			main: '#a7e9af'
		},
		error: {
			main: '#eb6383'
		},
		info: {
			main: '#daa1a1'
		},
		warning: {
			main: '#ffeb99'
		},
		text: {
			primary: '#929799'
		},
		common: {
			white: '#fff',
			black: '#000'
		},
		grey: {
			100: '#f8f9fa',
			200: '#f0f2f5',
			300: '#dee2e6',
			400: '#ced4da',
			500: '#adb5bd',
			600: '#6c757d',
			700: '#495057',
			800: '#343a40',
			900: '#212529'
		}
	}
});
