/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
          {
            source: '/',
            destination: '/home',
            permanent: true,
          },
        ];
      },
      images: {
        domains: ['courses-online-api.devsriwararak.com'],
      },
};

export default nextConfig;
