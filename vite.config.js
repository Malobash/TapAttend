import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
export default defineConfig(function (_a) {
    var command = _a.command;
    return ({
        base: command === 'build' ? './' : '/',
        plugins: [react()],
        server: {
            proxy: {
                '/api': 'http://localhost:8080',
            },
        },
    });
});
