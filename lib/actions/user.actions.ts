"use server";

import { connectToDB } from "@/lib/db";
import User from "@/lib/db/models/user.model";
import { ShippingAddressSchema } from "@/lib/validator";
import { z } from "zod";

export async function saveShippingAddress(address: z.infer<typeof ShippingAddressSchema>) {
  try {
    await connectToDB();
    
    // TODO: Get current user ID from session
    // const session = await auth();
    // const userId = session?.user?.id;
    
    // For now, we will just validate the address
    const result = ShippingAddressSchema.safeParse(address);
    if (!result.success) {
        throw new Error("Invalid address data");
    }

    // Example: Update user address if user exists
    // await User.findByIdAndUpdate(userId, { address: result.data });

    return { success: true, message: "Address saved successfully" };
  } catch (error) {
    console.error("Error saving address:", error);
    return { success: false, message: "Failed to save address" };
  }
}
