import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const allowedDevOrigins = (process.env.DEV_ORIGINS || 'localhost,127.0.0.1,192.168.11.108')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  productionBrowserSourceMaps: false,
  allowedDevOrigins,
};

export default nextConfig;
