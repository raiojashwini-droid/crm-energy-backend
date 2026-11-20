const prisma = require('../../config/prisma');

class CrmLiveDbService {
  /**
   * Helper to format currency
   */
  static formatCurrency(amount, isHindi = false) {
    const num = Number(amount) || 0;
    if (isHindi) {
      if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
      if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakh`;
      return `$${num.toLocaleString('en-US')}`;
    }
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  /**
   * Get authentic leads summary and statistics
   */
  static async getLeadsSummary(tenantId = null, limit = 20) {
    try {
      const whereClause = tenantId ? { tenantId } : undefined;

      let [totalCount, leads] = await Promise.all([
        prisma.lead.count({ where: whereClause }),
        prisma.lead.findMany({
          where: whereClause,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true,
            status: true,
            score: true,
            estimatedValue: true,
            source: true,
            createdAt: true,
          }
        })
      ]);

      // If tenant-filtered query returns 0, fallback to all available leads (e.g. dev/demo mode)
      if (totalCount === 0 && tenantId) {
        const [allCount, allLeads] = await Promise.all([
          prisma.lead.count(),
          prisma.lead.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              name: true,
              company: true,
              email: true,
              phone: true,
              status: true,
              score: true,
              estimatedValue: true,
              source: true,
              createdAt: true,
            }
          })
        ]);
        if (allCount > 0) {
          totalCount = allCount;
          leads = allLeads;
        }
      }

      const byStatus = {};
      let totalEstValue = 0;

      leads.forEach((l) => {
        const st = l.status || 'NEW';
        byStatus[st] = (byStatus[st] || 0) + 1;
        totalEstValue += Number(l.estimatedValue) || 0;
      });

      return {
        success: true,
        total: totalCount,
        byStatus,
        totalEstimatedValue: totalEstValue,
        leads
      };
    } catch (err) {
      console.warn('[CrmLiveDbService] Leads summary error:', err.message);
      return { success: false, total: 0, byStatus: {}, totalEstimatedValue: 0, leads: [], error: err.message };
    }
  }

  /**
   * Find specific lead by name or company
   */
  static async searchLeadByName(searchName, tenantId = null) {
    try {
      if (!searchName || typeof searchName !== 'string') {
        return { success: false, found: false, leads: [] };
      }

      const cleanName = searchName.trim();
      const whereClause = tenantId
        ? {
            tenantId,
            OR: [
              { name: { contains: cleanName } },
              { company: { contains: cleanName } },
              { email: { contains: cleanName } }
            ]
          }
        : {
            OR: [
              { name: { contains: cleanName } },
              { company: { contains: cleanName } },
              { email: { contains: cleanName } }
            ]
          };

      let leads = await prisma.lead.findMany({
        where: whereClause,
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          company: true,
          email: true,
          phone: true,
          status: true,
          score: true,
          estimatedValue: true,
          source: true,
          notes: true,
          createdAt: true,
        }
      });

      // If not found with tenant filter, search globally
      if ((!leads || leads.length === 0) && tenantId) {
        leads = await prisma.lead.findMany({
          where: {
            OR: [
              { name: { contains: cleanName } },
              { company: { contains: cleanName } },
              { email: { contains: cleanName } }
            ]
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true,
            status: true,
            score: true,
            estimatedValue: true,
            source: true,
            notes: true,
            createdAt: true,
          }
        });
      }

      return {
        success: true,
        found: leads.length > 0,
        count: leads.length,
        leads
      };
    } catch (err) {
      console.warn('[CrmLiveDbService] Search lead error:', err.message);
      return { success: false, found: false, count: 0, leads: [], error: err.message };
    }
  }

  /**
   * Get leads created today (start of day to now)
   */
  static async getTodayLeads(tenantId = null) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const whereClause = tenantId
        ? { tenantId, createdAt: { gte: today } }
        : { createdAt: { gte: today } };

      let [count, leads] = await Promise.all([
        prisma.lead.count({ where: whereClause }),
        prisma.lead.findMany({
          where: whereClause,
          take: 10,
          orderBy: { createdAt: 'desc' }
        })
      ]);

      if (count === 0 && tenantId) {
        const [allCount, allLeads] = await Promise.all([
          prisma.lead.count({ where: { createdAt: { gte: today } } }),
          prisma.lead.findMany({
            where: { createdAt: { gte: today } },
            take: 10,
            orderBy: { createdAt: 'desc' }
          })
        ]);
        if (allCount > 0) {
          count = allCount;
          leads = allLeads;
        }
      }

      return {
        success: true,
        count,
        leads
      };
    } catch (err) {
      console.warn('[CrmLiveDbService] Today leads error:', err.message);
      return { success: false, count: 0, leads: [], error: err.message };
    }
  }

  /**
   * Get authentic Deals pipeline summary (never fake numbers!)
   */
  static async getDealsSummary(tenantId = null) {
    try {
      const whereClause = tenantId ? { tenantId } : undefined;

      const [totalCount, deals] = await Promise.all([
        prisma.deal.count({ where: whereClause }),
        prisma.deal.findMany({
          where: whereClause,
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            customer: true,
            stage: true,
            value: true,
            probability: true,
            expectedClose: true,
          }
        })
      ]);

      const byStage = {};
      let totalPipelineValue = 0;

      deals.forEach((d) => {
        const st = d.stage || 'NEW_LEAD';
        byStage[st] = (byStage[st] || 0) + 1;
        totalPipelineValue += Number(d.value) || 0;
      });

      return {
        success: true,
        total: totalCount,
        byStage,
        totalPipelineValue,
        deals
      };
    } catch (err) {
      console.warn('[CrmLiveDbService] Deals summary error:', err.message);
      return { success: false, total: 0, byStage: {}, totalPipelineValue: 0, deals: [], error: err.message };
    }
  }

  /**
   * Get authentic Tasks summary
   */
  static async getTasksSummary(tenantId = null) {
    try {
      const whereClause = tenantId ? { tenantId } : undefined;

      let [totalCount, tasks] = await Promise.all([
        prisma.task.count({ where: whereClause }),
        prisma.task.findMany({
          where: whereClause,
          take: 10,
          orderBy: { dueDate: 'asc' },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
            assignedUserId: true,
          }
        })
      ]);

      if (totalCount === 0 && tenantId) {
        const [allCount, allTasks] = await Promise.all([
          prisma.task.count(),
          prisma.task.findMany({
            take: 10,
            orderBy: { dueDate: 'asc' },
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              dueDate: true,
              assignedUserId: true,
            }
          })
        ]);
        if (allCount > 0) {
          totalCount = allCount;
          tasks = allTasks;
        }
      }

      let pending = 0;
      let urgent = 0;

      tasks.forEach((t) => {
        if (t.status === 'PENDING') pending++;
        if (t.priority === 'URGENT' || t.priority === 'HIGH') urgent++;
      });

      return {
        success: true,
        total: totalCount,
        pending,
        urgent,
        tasks
      };
    } catch (err) {
      console.warn('[CrmLiveDbService] Tasks summary error:', err.message);
      return { success: false, total: 0, pending: 0, urgent: 0, tasks: [], error: err.message };
    }
  }

  /**
   * Get authentic Contacts summary
   */
  static async getContactsSummary(tenantId = null, limit = 10) {
    try {
      const whereClause = tenantId ? { tenantId } : undefined;

      let [totalCount, contacts] = await Promise.all([
        prisma.contact.count({ where: whereClause }),
        prisma.contact.findMany({
          where: whereClause,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true,
            status: true,
          }
        })
      ]);

      if (totalCount === 0 && tenantId) {
        const [allCount, allContacts] = await Promise.all([
          prisma.contact.count(),
          prisma.contact.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              company: true,
              status: true,
            }
          })
        ]);
        if (allCount > 0) {
          totalCount = allCount;
          contacts = allContacts;
        }
      }

      return {
        success: true,
        total: totalCount,
        contacts
      };
    } catch (err) {
      console.warn('[CrmLiveDbService] Contacts summary error:', err.message);
      return { success: false, total: 0, contacts: [], error: err.message };
    }
  }
}

module.exports = CrmLiveDbService;
