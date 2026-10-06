/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // Retain an exact-host allow-list for the image optimiser's legacy
        // matcher, alongside the scoped pattern used by current Next builds.
        domains: ["xpvnrbllqdhzmockmkmx.supabase.co"],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "xpvnrbllqdhzmockmkmx.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
};

module.exports = nextConfig;
