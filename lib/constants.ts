export const App_NAME = process.env.NEXT_PUBLIC_APP_NAME || "GMQG E-Commerce";
export const APP_SLOGAN = 
    process.env.NEXT_PUBLIC_APP_SLOGAN || "Your one-stop shop for everything!";
export const APP_DESCRIPTION = 
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    "Discover a wide range of products at unbeatable prices. Shop now and experience the best in online shopping!";

export const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;

// Admin emails - users with these emails can access the admin dashboard
export const ADMIN_EMAILS = ['admin@globaledge.ae'];