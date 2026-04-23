import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List properties with filters
export const list = query({
	args: {
		category: v.optional(v.string()),
		country: v.optional(v.string()),
		city: v.optional(v.string()),
		propertyType: v.optional(v.string()),
		status: v.optional(v.string()),
		limit: v.optional(v.number()),
	},
	returns: v.object({
		properties: v.array(v.any()),
		hasMore: v.boolean(),
	}),
	handler: async (ctx, args) => {
		const limit = args.limit ?? 50;

		let results;
		if (args.category && args.country) {
			results = await ctx.db
				.query("properties")
				.withIndex("by_category_country", (q) =>
					q.eq("category", args.category!).eq("country", args.country!),
				)
				.take(limit + 1);
		} else if (args.category) {
			results = await ctx.db
				.query("properties")
				.withIndex("by_category", (q) => q.eq("category", args.category!))
				.take(limit + 1);
		} else if (args.country) {
			results = await ctx.db
				.query("properties")
				.withIndex("by_country", (q) => q.eq("country", args.country!))
				.take(limit + 1);
		} else if (args.propertyType) {
			results = await ctx.db
				.query("properties")
				.withIndex("by_propertyType", (q) =>
					q.eq("propertyType", args.propertyType!),
				)
				.take(limit + 1);
		} else if (args.status) {
			results = await ctx.db
				.query("properties")
				.withIndex("by_status", (q) => q.eq("status", args.status!))
				.take(limit + 1);
		} else {
			results = await ctx.db.query("properties").take(limit + 1);
		}

		const hasMore = results.length > limit;
		const properties = hasMore ? results.slice(0, limit) : results;

		return { properties, hasMore };
	},
});

// Search properties by text
export const search = query({
	args: {
		searchQuery: v.string(),
		category: v.optional(v.string()),
		country: v.optional(v.string()),
		city: v.optional(v.string()),
		propertyType: v.optional(v.string()),
		status: v.optional(v.string()),
		limit: v.optional(v.number()),
	},
	returns: v.array(v.any()),
	handler: async (ctx, args) => {
		const limit = args.limit ?? 50;
		const q = ctx.db
			.query("properties")
			.withSearchIndex("search_properties", (q2) => {
				let sq = q2.search("title", args.searchQuery);
				if (args.category) sq = sq.eq("category", args.category);
				if (args.country) sq = sq.eq("country", args.country);
				if (args.city) sq = sq.eq("city", args.city);
				if (args.propertyType)
					sq = sq.eq("propertyType", args.propertyType);
				if (args.status) sq = sq.eq("status", args.status);
				return sq;
			});
		return await q.take(limit);
	},
});

// Get single property
export const get = query({
	args: { id: v.id("properties") },
	returns: v.any(),
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

// Get stats
export const stats = query({
	args: {},
	returns: v.object({
		totalProperties: v.number(),
		totalCountries: v.number(),
		totalCategories: v.number(),
		byCategory: v.any(),
	}),
	handler: async (ctx) => {
		const allProps = await ctx.db.query("properties").collect();
		const countries = new Set(allProps.map((p) => p.country));
		const categories = new Set(allProps.map((p) => p.category));

		const byCategory: Record<string, number> = {};
		for (const p of allProps) {
			byCategory[p.category] = (byCategory[p.category] || 0) + 1;
		}

		return {
			totalProperties: allProps.length,
			totalCountries: countries.size,
			totalCategories: categories.size,
			byCategory,
		};
	},
});

// Get unique countries
export const getCountries = query({
	args: { category: v.optional(v.string()) },
	returns: v.array(v.string()),
	handler: async (ctx, args) => {
		let props;
		if (args.category) {
			props = await ctx.db
				.query("properties")
				.withIndex("by_category", (q) => q.eq("category", args.category!))
				.collect();
		} else {
			props = await ctx.db.query("properties").collect();
		}
		return [...new Set(props.map((p) => p.country))].sort();
	},
});

// Get unique cities
export const getCities = query({
	args: { country: v.optional(v.string()) },
	returns: v.array(v.string()),
	handler: async (ctx, args) => {
		let props;
		if (args.country) {
			props = await ctx.db
				.query("properties")
				.withIndex("by_country", (q) => q.eq("country", args.country!))
				.collect();
		} else {
			props = await ctx.db.query("properties").collect();
		}
		return [...new Set(props.map((p) => p.city))].sort();
	},
});

// Create property
export const create = mutation({
	args: {
		title: v.string(),
		description: v.string(),
		price: v.optional(v.number()),
		priceLabel: v.optional(v.string()),
		currency: v.string(),
		country: v.string(),
		city: v.string(),
		state: v.optional(v.string()),
		address: v.optional(v.string()),
		category: v.string(),
		propertyType: v.string(),
		subcategory: v.optional(v.string()),
		acreage: v.optional(v.number()),
		squareFeet: v.optional(v.number()),
		stories: v.optional(v.number()),
		parcels: v.optional(v.number()),
		bedrooms: v.optional(v.number()),
		bathrooms: v.optional(v.number()),
		imageUrl: v.optional(v.string()),
		imageUrls: v.optional(v.array(v.string())),
		listingUrl: v.optional(v.string()),
		brokerName: v.optional(v.string()),
		brokerEmail: v.optional(v.string()),
		brokerPhone: v.optional(v.string()),
		brokerCompany: v.optional(v.string()),
		status: v.string(),
		isVerified: v.boolean(),
	},
	returns: v.id("properties"),
	handler: async (ctx, args) => {
		return await ctx.db.insert("properties", args);
	},
});

// Bulk create properties (up to 100 at a time)
export const bulkCreate = mutation({
	args: {
		properties: v.array(v.object({
			title: v.string(),
			description: v.string(),
			price: v.optional(v.number()),
			priceLabel: v.optional(v.string()),
			currency: v.string(),
			country: v.string(),
			city: v.string(),
			state: v.optional(v.string()),
			address: v.optional(v.string()),
			category: v.string(),
			propertyType: v.string(),
			subcategory: v.optional(v.string()),
			acreage: v.optional(v.number()),
			squareFeet: v.optional(v.number()),
			stories: v.optional(v.number()),
			parcels: v.optional(v.number()),
			bedrooms: v.optional(v.number()),
			bathrooms: v.optional(v.number()),
			imageUrl: v.optional(v.string()),
			imageUrls: v.optional(v.array(v.string())),
			listingUrl: v.optional(v.string()),
			brokerName: v.optional(v.string()),
			brokerEmail: v.optional(v.string()),
			brokerPhone: v.optional(v.string()),
			brokerCompany: v.optional(v.string()),
			status: v.string(),
			isVerified: v.boolean(),
		})),
	},
	returns: v.number(),
	handler: async (ctx, args) => {
		let count = 0;
		for (const prop of args.properties) {
			await ctx.db.insert("properties", prop);
			count++;
		}
		return count;
	},
});
