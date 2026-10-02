const prisma = require('../config/prisma');

class LeadService {
  async getAll(tenantId, query = {}) {
    const { search, status, assignedUserId } = query;
    const where = { tenantId };

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (assignedUserId) {
      where.assignedUserId = assignedUserId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { company: { contains: search } },
        { email: { contains: search } },
      ];
    }

    return await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedUser: { select: { id: true, name: true, email: true, avatar: true, role: true } },
        convertedContact: { select: { id: true, name: true, company: true } },
        _count: { select: { deals: true, tasks: true, notes: true, activities: true } },
      },
    });
  }

  async getById(tenantId, id) {
    const lead = await prisma.lead.findFirst({
      where: { id, tenantId },
      include: {
        assignedUser: { select: { id: true, name: true, email: true, avatar: true, role: true } },
        convertedContact: true,
        deals: true,
        tasks: true,
        notes: { include: { author: { select: { id: true, name: true } } } },
        activities: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!lead) {
      const err = new Error('Lead not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    return lead;
  }

  async create(tenantId, data, userId) {
    if (!data.name || !data.company) {
      const err = new Error('Lead name and company are required.');
      err.statusCode = 400;
      throw err;
    }

    // Clean score and estimatedValue
    let estimatedValue = data.value || data.estimatedValue || 0;
    if (typeof estimatedValue === 'string') {
      estimatedValue = parseFloat(estimatedValue.replace(/[^0-9.-]+/g, '')) || 0;
    }

    const lead = await prisma.lead.create({
      data: {
        tenantId,
        assignedUserId: data.assignedUserId || userId || null,
        name: data.name.trim(),
        company: data.company.trim(),
        email: data.email ? data.email.trim() : null,
        phone: data.phone ? data.phone.trim() : null,
        source: data.source || 'Direct Outreach',
        territory: data.territory || 'North America',
        status: data.status ? data.status.toUpperCase() : 'NEW',
        qualification: data.qualification || null,
        score: parseInt(data.score, 10) || 75,
        estimatedValue,
      },
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });

    // Log Activity
    await prisma.activity.create({
      data: {
        tenantId,
        userId,
        leadId: lead.id,
        type: 'TASK_CREATED',
        title: `Lead '${lead.name}' was created`,
        description: `Source: ${lead.source}, Estimated Value: $${estimatedValue}`,
      },
    }).catch(() => {});

    return lead;
  }

  async update(tenantId, id, data) {
    await this.getById(tenantId, id);

    let estimatedValue = data.value || data.estimatedValue;
    if (typeof estimatedValue === 'string') {
      estimatedValue = parseFloat(estimatedValue.replace(/[^0-9.-]+/g, '')) || 0;
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.company !== undefined) updateData.company = data.company.trim();
    if (data.email !== undefined) updateData.email = data.email ? data.email.trim() : null;
    if (data.phone !== undefined) updateData.phone = data.phone ? data.phone.trim() : null;
    if (data.source !== undefined) updateData.source = data.source;
    if (data.territory !== undefined) updateData.territory = data.territory;
    if (data.status !== undefined) updateData.status = data.status.toUpperCase();
    if (data.qualification !== undefined) updateData.qualification = data.qualification;
    if (data.score !== undefined) updateData.score = parseInt(data.score, 10);
    if (estimatedValue !== undefined) updateData.estimatedValue = estimatedValue;
    if (data.assignedUserId !== undefined) updateData.assignedUserId = data.assignedUserId;

    return await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async delete(tenantId, id) {
    await this.getById(tenantId, id);
    return await prisma.lead.delete({
      where: { id },
    });
  }

  async convertToContact(tenantId, id, userId) {
    const lead = await this.getById(tenantId, id);

    if (lead.convertedToContactId) {
      const err = new Error('Lead has already been converted.');
      err.statusCode = 400;
      throw err;
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Check if Contact with identical email exists in this tenant, or create a new Contact
      let contact = null;
      if (lead.email) {
        contact = await tx.contact.findFirst({
          where: { tenantId, email: lead.email },
        });
      }

      if (!contact) {
        contact = await tx.contact.create({
          data: {
            tenantId,
            assignedUserId: lead.assignedUserId || userId,
            name: lead.name,
            company: lead.company,
            email: lead.email,
            phone: lead.phone,
            type: 'Converted Lead',
            totalValue: lead.estimatedValue || 0,
            status: 'Active',
            lastActivity: new Date(),
          },
          include: {
            assignedUser: { select: { id: true, name: true, email: true } },
          },
        });
      }

      // 2. Check if Deal already exists for this lead or create pipeline Deal in QUALIFIED stage
      let deal = await tx.deal.findFirst({
        where: { tenantId, leadId: lead.id },
      });

      if (!deal) {
        deal = await tx.deal.create({
          data: {
            tenantId,
            assignedUserId: lead.assignedUserId || userId,
            contactId: contact.id,
            leadId: lead.id,
            title: `${lead.company || lead.name} - Commercial Contract`,
            customer: contact.name || lead.company,
            value: lead.estimatedValue || 0,
            stage: 'QUALIFIED',
            probability: 60,
            expectedClose: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days out
            description: `Converted from Lead #${lead.id} (${lead.company}). Source: ${lead.source || 'Direct Outreach'}`,
          },
          include: {
            assignedUser: { select: { id: true, name: true, email: true } },
            contact: { select: { id: true, name: true, company: true } },
          },
        });
      }

      // 3. Create follow-up Task for the converted account
      const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days out
      const task = await tx.task.create({
        data: {
          tenantId,
          assignedUserId: lead.assignedUserId || userId,
          leadId: lead.id,
          contactId: contact.id,
          dealId: deal.id,
          title: `Follow up on Qualified Deal - ${lead.company || lead.name}`,
          description: `Schedule technical discovery & proposal call for ${deal.title} ($${deal.value}).`,
          priority: 'HIGH',
          status: 'PENDING',
          dueDate,
          reminder: '9:00 AM',
        },
        include: {
          assignedUser: { select: { id: true, name: true, email: true } },
        },
      });

      // 4. Update Lead with conversion pointer and status WON
      const updatedLead = await tx.lead.update({
        where: { id },
        data: {
          status: 'WON',
          convertedToContactId: contact.id,
        },
        include: {
          assignedUser: { select: { id: true, name: true, email: true } },
          convertedContact: { select: { id: true, name: true, company: true } },
        },
      });

      // 5. Log Activity for the full conversion event
      const activity = await tx.activity.create({
        data: {
          tenantId,
          userId,
          leadId: lead.id,
          contactId: contact.id,
          dealId: deal.id,
          type: 'LEAD_CONVERTED',
          title: `Lead '${lead.name}' converted to Contact & Deal`,
          description: `Converted to Contact '${contact.name}' with Pipeline Deal '${deal.title}' ($${deal.value}) and Follow-up Task.`,
        },
      });

      return {
        lead: updatedLead,
        contact,
        deal,
        task,
        activity,
      };
    });
  }
}

module.exports = new LeadService();
