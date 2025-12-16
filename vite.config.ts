import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Expose env vars to the client. Default to empty string if undefined.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || "")
  }
});