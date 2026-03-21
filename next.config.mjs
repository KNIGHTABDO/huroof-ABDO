import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  productionBrowserSourceMaps: false,
  allowedDevOrigins: ['192.168.11.108'],
};

export default nextConfig;
