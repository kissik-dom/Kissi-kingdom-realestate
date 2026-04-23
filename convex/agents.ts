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

// Verify broker access code
export const verifyAccessCode = query({
	args: { code: v.string() },
	returns: v.any(),
	handler: async (ctx, args) => {
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
