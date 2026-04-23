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

// Count properties per category (lightweight, uses index)
export const countByCategory = query({
	args: { category: v.string() },
	returns: v.number(),
	handler: async (ctx, args) => {
		const results = await ctx.db
			.query("properties")
			.withIndex("by_category", (q) => q.eq("category", args.category))
			.collect();
		return results.length;
	},
});

// Get stats - uses per-category counts to handle 100K+ properties
export const stats = query({
	args: {},
	returns: v.object({
		totalProperties: v.number(),
		totalCountries: v.number(),
		totalCategories: v.number(),
		byCategory: v.any(),
	}),
	handler: async (ctx) => {
		// Get a sample for country count
		const sample = await ctx.db.query("properties").take(5000);
		const countries = new Set(sample.map((p) => p.country));

		// Use hardcoded category list and count per category efficiently
		const CATEGORIES = [
			"ivy_league", "international", "minerals", "wineries",
			"farms_large", "farms_cattle", "farms_specialty",
			"nyc_commercial", "nyc_apartments", "hbcu", "arenas", "nba_nfl_land",
		];

		const byCategory: Record<string, number> = {};
		let totalProperties = 0;
		let activeCategories = 0;

		for (const cat of CATEGORIES) {
			// Use take with a large limit per category
			const catProps = await ctx.db
				.query("properties")
				.withIndex("by_category", (q) => q.eq("category", cat))
				.take(50000);
			const count = catProps.length;
			if (count > 0) {
				byCategory[cat] = count;
				totalProperties += count;
				activeCategories++;
				// Add countries from this batch
				for (const p of catProps) {
					countries.add(p.country);
				}
			}
		}

		return {
			totalProperties,
			totalCountries: countries.size,
			totalCategories: activeCategories,
			byCategory,
		};
	},
});

// Get unique countries — sample-based for speed on 235K+ DB
export const getCountries = query({
	args: { category: v.optional(v.string()) },
	returns: v.array(v.string()),
	handler: async (ctx, args) => {
		const countries = new Set<string>();
		let q;
		if (args.category) {
			q = ctx.db
				.query("properties")
				.withIndex("by_category", (q2) => q2.eq("category", args.category!));
		} else {
			q = ctx.db.query("properties");
		}
		// Take a generous sample — 136 countries means we'll find them all in ~10K rows
		const sample = await q.take(15000);
		for (const p of sample) {
			countries.add(p.country);
		}
		return [...countries].sort();
	},
});

// Get unique cities - paginated
export const getCities = query({
	args: { country: v.optional(v.string()), category: v.optional(v.string()) },
	returns: v.array(v.string()),
	handler: async (ctx, args) => {
		const cities = new Set<string>();
		let cursor = null;
		let done = false;
		
		while (!done) {
			let q;
			if (args.country) {
				q = ctx.db.query("properties")
					.withIndex("by_country", (q2) => q2.eq("country", args.country!));
			} else if (args.category) {
				q = ctx.db.query("properties")
					.withIndex("by_category", (q2) => q2.eq("category", args.category!));
			} else {
				q = ctx.db.query("properties");
			}
			
			const page: any = await q.paginate({
				numItems: 2000,
				cursor: cursor === null ? undefined : cursor,
			} as any);
			
			for (const p of page.page) {
				cities.add(p.city);
			}
			
			if (page.isDone || page.page.length === 0) {
				done = true;
			} else {
				cursor = page.continueCursor;
			}
		}
		
		return [...cities].sort();
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
