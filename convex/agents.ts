import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List all agents
export const list = query({
	args: {
		role: v.optional(v.string()),
	},
	returns: v.array(v.any()),
	handler: async (ctx, args) => {
		if (args.role) {
			return await ctx.db
				.query("agents")
				.withIndex("by_role", (q) => q.eq("role", args.role!))
				.collect();
		}
		return await ctx.db.query("agents").collect();
	},
});

// Get agent by access code
export const getByAccessCode = query({
	args: { accessCode: v.string() },
	returns: v.any(),
	handler: async (ctx, args) => {
		return await ctx.db
			.query("agents")
			.withIndex("by_accessCode", (q) => q.eq("accessCode", args.accessCode))
			.unique();
	},
});

// Get agent by email
export const getByEmail = query({
	args: { email: v.string() },
	returns: v.any(),
	handler: async (ctx, args) => {
		return await ctx.db
			.query("agents")
			.withIndex("by_email", (q) => q.eq("email", args.email))
			.unique();
	},
});

// Get single agent
export const get = query({
	args: { id: v.id("agents") },
	returns: v.any(),
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

// Verify broker access code — returns agent info + role
// Master admin code 999999 always works (returns admin even if DB is empty)
export const verifyAccessCode = query({
	args: { code: v.string() },
	returns: v.any(),
	handler: async (ctx, args) => {
		// Master admin override — always grants admin access
		if (args.code === "999999") {
			// Try to find existing admin first
			const admin = await ctx.db
				.query("agents")
				.withIndex("by_role", (q) => q.eq("role", "admin"))
				.first();
			if (admin) {
				return {
					agentId: admin._id,
					name: admin.name,
					email: admin.email,
					role: "admin",
					isActive: true,
				};
			}
			// Return synthetic admin if DB is empty
			return {
				agentId: "master",
				name: "Yumba Kamanda",
				email: "admin@kissikingdom.com",
				role: "admin",
				isActive: true,
			};
		}

		const agent = await ctx.db
			.query("agents")
			.withIndex("by_accessCode", (q) => q.eq("accessCode", args.code))
			.unique();
		if (!agent) return null;
		return {
			agentId: agent._id,
			name: agent.name,
			email: agent.email,
			role: agent.role,
			isActive: agent.isActive,
		};
	},
});

// Create agent
export const create = mutation({
	args: {
		name: v.string(),
		email: v.string(),
		phone: v.optional(v.string()),
		whatsapp: v.optional(v.string()),
		company: v.optional(v.string()),
		accessCode: v.string(),
		isActive: v.boolean(),
		role: v.string(),
		avatarInitials: v.optional(v.string()),
	},
	returns: v.id("agents"),
	handler: async (ctx, args) => {
		return await ctx.db.insert("agents", args);
	},
});

// Update agent
export const update = mutation({
	args: {
		id: v.id("agents"),
		name: v.optional(v.string()),
		email: v.optional(v.string()),
		phone: v.optional(v.string()),
		whatsapp: v.optional(v.string()),
		company: v.optional(v.string()),
		isActive: v.optional(v.boolean()),
		role: v.optional(v.string()),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const { id, ...updates } = args;
		const clean: Record<string, any> = {};
		for (const [k, val] of Object.entries(updates)) {
			if (val !== undefined) clean[k] = val;
		}
		await ctx.db.patch(id, clean);
		return null;
	},
});

// Delete agent
export const remove = mutation({
	args: { id: v.id("agents") },
	returns: v.null(),
	handler: async (ctx, args) => {
		// Also remove all assignments for this agent
		const assignments = await ctx.db
			.query("agentProperties")
			.withIndex("by_agent", (q) => q.eq("agentId", args.id))
			.collect();
		for (const a of assignments) {
			await ctx.db.delete(a._id);
		}
		await ctx.db.delete(args.id);
		return null;
	},
});

// Get agent stats
export const stats = query({
	args: {},
	returns: v.object({
		totalAgents: v.number(),
		activeAgents: v.number(),
	}),
	handler: async (ctx) => {
		const agents = await ctx.db.query("agents").collect();
		return {
			totalAgents: agents.length,
			activeAgents: agents.filter((a) => a.isActive).length,
		};
	},
});

// Get agent with their assignment count
export const listWithCounts = query({
	args: {},
	returns: v.array(v.any()),
	handler: async (ctx) => {
		const agents = await ctx.db.query("agents").collect();
		const result = await Promise.all(
			agents.map(async (agent) => {
				const assignments = await ctx.db
					.query("agentProperties")
					.withIndex("by_agent", (q) => q.eq("agentId", agent._id))
					.collect();
				return {
					...agent,
					assignmentCount: assignments.length,
				};
			}),
		);
		return result;
	},
});
