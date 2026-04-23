import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all agent-property assignments for an agent
export const getAgentProperties = query({
	args: {
		agentId: v.id("agents"),
		status: v.optional(v.string()),
	},
	returns: v.array(v.any()),
	handler: async (ctx, args) => {
		let assignments;
		if (args.status) {
			assignments = await ctx.db
				.query("agentProperties")
				.withIndex("by_agent_status", (q) =>
					q.eq("agentId", args.agentId).eq("pipelineStatus", args.status!),
				)
				.collect();
		} else {
			assignments = await ctx.db
				.query("agentProperties")
				.withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
				.collect();
		}

		// Enrich with property data
		const enriched = await Promise.all(
			assignments.map(async (a) => {
				const property = await ctx.db.get(a.propertyId);
				return { ...a, property };
			}),
		);

		return enriched;
	},
});

// Get all assignments (admin view)
export const listAll = query({
	args: {
		status: v.optional(v.string()),
		limit: v.optional(v.number()),
	},
	returns: v.array(v.any()),
	handler: async (ctx, args) => {
		const limit = args.limit ?? 100;
		let assignments;
		if (args.status) {
			assignments = await ctx.db
				.query("agentProperties")
				.withIndex("by_status", (q) => q.eq("pipelineStatus", args.status!))
				.take(limit);
		} else {
			assignments = await ctx.db
				.query("agentProperties")
				.take(limit);
		}

		// Enrich with property and agent data
		const enriched = await Promise.all(
			assignments.map(async (a) => {
				const property = await ctx.db.get(a.propertyId);
				const agent = await ctx.db.get(a.agentId);
				return { ...a, property, agent };
			}),
		);

		return enriched;
	},
});

// Get single assignment with notes
export const getAssignment = query({
	args: { id: v.id("agentProperties") },
	returns: v.any(),
	handler: async (ctx, args) => {
		const assignment = await ctx.db.get(args.id);
		if (!assignment) return null;

		const property = await ctx.db.get(assignment.propertyId);
		const agent = await ctx.db.get(assignment.agentId);
		const notes = await ctx.db
			.query("pipelineNotes")
			.withIndex("by_agentProperty", (q) =>
				q.eq("agentPropertyId", args.id),
			)
			.collect();

		return { ...assignment, property, agent, notes };
	},
});

// Update pipeline status
export const updateStatus = mutation({
	args: {
		id: v.id("agentProperties"),
		pipelineStatus: v.string(),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, { pipelineStatus: args.pipelineStatus });
		return null;
	},
});

// Update attorney info
export const updateAttorney = mutation({
	args: {
		id: v.id("agentProperties"),
		attorneyName: v.string(),
		attorneyEmail: v.optional(v.string()),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, {
			attorneyName: args.attorneyName,
			attorneyEmail: args.attorneyEmail,
		});
		return null;
	},
});

// Add a note to a pipeline step
export const addNote = mutation({
	args: {
		agentPropertyId: v.id("agentProperties"),
		step: v.string(),
		note: v.string(),
		createdBy: v.optional(v.string()),
	},
	returns: v.id("pipelineNotes"),
	handler: async (ctx, args) => {
		return await ctx.db.insert("pipelineNotes", {
			agentPropertyId: args.agentPropertyId,
			step: args.step,
			note: args.note,
			createdAt: Date.now(),
			createdBy: args.createdBy,
		});
	},
});

// Assign property to agent
export const assignProperty = mutation({
	args: {
		agentId: v.id("agents"),
		propertyId: v.id("properties"),
	},
	returns: v.id("agentProperties"),
	handler: async (ctx, args) => {
		return await ctx.db.insert("agentProperties", {
			agentId: args.agentId,
			propertyId: args.propertyId,
			assignedAt: Date.now(),
			pipelineStatus: "new",
		});
	},
});

// Get pipeline stats
export const pipelineStats = query({
	args: {},
	returns: v.any(),
	handler: async (ctx) => {
		const all = await ctx.db.query("agentProperties").collect();
		const byStatus: Record<string, number> = {};
		for (const a of all) {
			byStatus[a.pipelineStatus] = (byStatus[a.pipelineStatus] || 0) + 1;
		}
		return { total: all.length, byStatus };
	},
});
