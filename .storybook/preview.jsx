import React from 'react';
import '../src/index.css'
import '../src/storybook.css'
import { decorators } from './decorators';

console.log('# loading preview.jsx')

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      test: "todo"
    }, 
  },
  decorators

};


export default preview;