/**
 * CRM nErgy Role Mapper
 * Bidirectional normalization between Frontend role formats and Prisma Schema enum Role.
 */

const FRONTEND_TO_PRISMA_MAP = {
  business_owner: 'BUSINESS_OWNER',
  owner: 'BUSINESS_OWNER',
  ceo: 'BUSINESS_OWNER',
  customer: 'CUSTOMER',
  client: 'CUSTOMER',
  content_creator: 'CONTENT_CREATOR',
  creator: 'CONTENT_CREATOR',
  content_builder: 'CONTENT_BUILDER',
  builder: 'CONTENT_BUILDER',
  influencer: 'INFLUENCER',
  affiliate_partner: 'AFFILIATE_PARTNER',
  affiliate: 'AFFILIATE_PARTNER',
  ai_marketing_pro: 'AI_MARKETING_PRO',
  marketing: 'AI_MARKETING_PRO',
  hr: 'HR',
  admin_1: 'OPERATIONS_SALES_ADMIN',
  admin1: 'OPERATIONS_SALES_ADMIN',
  sales: 'OPERATIONS_SALES_ADMIN',
  operations_sales_admin: 'OPERATIONS_SALES_ADMIN',
  admin_2: 'FINANCE_COMPLIANCE_ADMIN',
  admin2: 'FINANCE_COMPLIANCE_ADMIN',
  finance: 'FINANCE_COMPLIANCE_ADMIN',
  finance_compliance_admin: 'FINANCE_COMPLIANCE_ADMIN',
  crm_pro: 'CRM_PRO',
  employee: 'CRM_PRO',
  staff: 'CRM_PRO',
  super_admin: 'SUPER_ADMIN',
  superadmin: 'SUPER_ADMIN',
};

const PRISMA_TO_FRONTEND_MAP = {
  BUSINESS_OWNER: 'business_owner',
  CUSTOMER: 'customer',
  CONTENT_CREATOR: 'content_creator',
  CONTENT_BUILDER: 'content_builder',
  INFLUENCER: 'influencer',
  AFFILIATE_PARTNER: 'affiliate_partner',
  AI_MARKETING_PRO: 'ai_marketing_pro',
  HR: 'hr',
  OPERATIONS_SALES_ADMIN: 'admin_1',
  FINANCE_COMPLIANCE_ADMIN: 'admin_2',
  CRM_PRO: 'crm_pro',
  SUPER_ADMIN: 'super_admin',
};

const ROLE_DISPLAY_NAMES = {
  BUSINESS_OWNER: 'Business Owner / Executive',
  CUSTOMER: 'Client & Customer Portal',
  CONTENT_CREATOR: 'AI Media & Video Creator',
  CONTENT_BUILDER: 'Campaign & Content Builder',
  INFLUENCER: 'Brand Ambassador & Influencer',
  AFFILIATE_PARTNER: 'Affiliate Deal Partner',
  AI_MARKETING_PRO: 'AI Marketing Specialist',
  HR: 'Human Resources Director',
  OPERATIONS_SALES_ADMIN: 'Operations & Sales Administrator (Admin I)',
  FINANCE_COMPLIANCE_ADMIN: 'Finance & Compliance Administrator (Admin II)',
  CRM_PRO: 'CRM & Pipeline Specialist',
  SUPER_ADMIN: 'Master Super Administrator',
};

/**
 * Normalizes any frontend role input to valid Prisma Role enum.
 * @param {string} roleInput
 * @returns {string} Prisma Role enum
 */
const toPrismaRole = (roleInput) => {
  if (!roleInput) return 'CRM_PRO';
  const clean = String(roleInput).trim().toLowerCase();
  return FRONTEND_TO_PRISMA_MAP[clean] || 'CRM_PRO';
};

/**
 * Converts Prisma Role enum to frontend role ID format.
 * @param {string} prismaRole
 * @returns {string} Frontend role ID
 */
const toFrontendRole = (prismaRole) => {
  if (!prismaRole) return 'crm_pro';
  return PRISMA_TO_FRONTEND_MAP[prismaRole] || 'crm_pro';
};

/**
 * Gets human-readable display title for a role.
 * @param {string} role
 * @returns {string}
 */
const getRoleDisplayName = (role) => {
  const prismaRole = toPrismaRole(role);
  return ROLE_DISPLAY_NAMES[prismaRole] || 'CRM Specialist';
};

module.exports = {
  toPrismaRole,
  toFrontendRole,
  getRoleDisplayName,
  FRONTEND_TO_PRISMA_MAP,
  PRISMA_TO_FRONTEND_MAP,
};
