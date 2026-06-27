/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hackathon: don't let lint warnings/errors block production deploys
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
