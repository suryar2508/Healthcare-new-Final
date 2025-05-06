import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

// Simple password hashing function using SHA-256 (same as in auth.ts)
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function fixAllPasswords() {
  try {
    console.log("Fetching all users...");
    
    const allUsers = await db.select().from(users);
    
    if (allUsers.length === 0) {
      console.log("No users found. Please run the seed script first.");
      return;
    }
    
    console.log(`Found ${allUsers.length} users. Fixing passwords...`);
    
    // Hash the password with SHA-256
    const hashedPassword = hashPassword("password123");
    console.log("Generated hash:", hashedPassword);
    
    // Update all user passwords
    const updatedUsers = await db.update(users)
      .set({ password: hashedPassword })
      .returning();
    
    console.log(`Successfully updated passwords for ${updatedUsers.length} users.`);
    
    // Log the usernames
    console.log("Updated users:", updatedUsers.map(user => user.username).join(", "));
    
  } catch (error) {
    console.error("Error fixing passwords:", error);
  } finally {
    // Close the database connection
    if (db && typeof db.close === 'function') {
      await db.close();
    }
    
    console.log("Done. You can now login with any user, password: password123");
  }
}

// Execute the function
fixAdminPassword();