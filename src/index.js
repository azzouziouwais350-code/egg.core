import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/pixelify-sans/latin-400.css';
import '@fontsource/pixelify-sans/latin-700.css';
import '@fontsource/silkscreen/latin-400.css';
import './styles/variables.css';
import './styles/global.css';
import './styles/scene.css';
import './styles/components.css';
import App from './App';

createRoot(document.getElementById('root')).render(<App />);
