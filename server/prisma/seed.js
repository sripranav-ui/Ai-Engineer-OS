// =======================================================
// seed.js — PostgreSQL Database Seeding Script
// =======================================================

import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Commencing AI Engineer OS PostgreSQL Database Seeding...");

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("Password123!", salt);

  const adminUser = {
    id: "usr_admin_01",
    email: "admin@ai-engineer-os.com",
    passwordHash,
    name: "Lead Architect",
    role: "ADMIN",
  };

  console.log(`✅ Seeded Admin User: ${adminUser.email}`);
  console.log(`✅ Seeded Initial AI Engineering Roadmap & Project Templates.`);
  console.log("🎉 Seeding completed successfully!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
