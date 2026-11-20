const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Setting up role_permissions table in crm-db...');
  const sql = `
    CREATE TABLE IF NOT EXISTS role_permissions (
      id VARCHAR(191) PRIMARY KEY,
      tenantId VARCHAR(191) NOT NULL,
      roleId VARCHAR(191) NOT NULL,
      allowedNavIds LONGTEXT NOT NULL,
      allowedRoutes LONGTEXT NULL,
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE KEY unique_tenant_role (tenantId, roleId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  await prisma.$executeRawUnsafe(sql);
  console.log('Table role_permissions is ready.');

  const tables = await prisma.$queryRawUnsafe("SHOW TABLES LIKE 'role_permissions'");
  console.log('Verified table:', tables);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
