import data from "@/lib/data";
import { connectToDB } from ".";
import Product from "./models/product.model";
import { cwd } from "process";
import { loadEnvConfig } from '@next/env';

// Load environment variables from .env file
loadEnvConfig(cwd());

const main = async () => {
    try {
        const { products } = data;
        console.log("Connecting to database...");
        await connectToDB(process.env.MONGODB_URI!);

        await Product.deleteMany({});
        console.log("Cleared existing products.");

        const createdProducts = await Product.insertMany(products);
        console.log(`Inserted ${createdProducts.length} products.`, 'seeded products successfully');

        process.exit(0);
    } catch (error) {
        console.error("Error seeding products:", error);
        throw new Error("Seeding failed");
    }
}

main()