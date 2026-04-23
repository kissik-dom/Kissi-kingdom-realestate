import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
	...authTables,

	// Properties table - all 100K+ listings
	properties: defineTable({
		// Basic info
		title: v.string(),
		description: v.string(),
		price: v.optional(v.number()),
		priceLabel: v.optional(v.string()), // "Contact for Price", "$2.5M", etc.
		currency: v.string(), // USD, EUR, GBP, etc.

		// Location
		country: v.string(),
		city: v.string(),
		state: v.optional(v.string()),
		address: v.optional(v.string()),

		// Classification
		category: v.string(), // ivy_league, international, minerals, wineries, farms_large, farms_cattle, farms_specialty, nyc_commercial, nyc_apartments, hbcu, arenas, nba_nfl_land
		propertyType: v.string(), // residential, commercial, hotel, land, farm, winery, mineral, arena, apartment_complex
		subcategory: v.optional(v.string()), // e.g., "Harvard University", "London", "Emeralds", etc.

		// Details
		acreage: v.optional(v.number()),
		squareFeet: v.optional(v.number()),
		stories: v.optional(v.number()),
		parcels: v.optional(v.number()),
		bedrooms: v.optional(v.number()),
		bathrooms: v.optional(v.number()),

		// Media & links
		imageUrl: v.optional(v.string()),
		imageUrls: v.optional(v.array(v.string())),
		listingUrl: v.optional(v.string()),

		// Broker info
		brokerName: v.optional(v.string()),
		brokerEmail: v.optional(v.string()),
		brokerPhone: v.optional(v.string()),
		brokerCompany: v.optional(v.string()),

		// Status
		status: v.string(), // available, pending, sold, off_market
		isVerified: v.boolean(),
	})
		.index("by_category", ["category"])
		.index("by_country", ["country"])
		.index("by_city", ["city"])
		.index("by_status", ["status"])
		.index("by_propertyType", ["propertyType"])
		.index("by_category_country", ["category", "country"])
		.searchIndex("search_properties", {
			searchField: "title",
			filterFields: ["category", "country", "city", "propertyType", "status"],
		}),

	// Agents - 100 agent profiles
	agents: defineTable({
		userId: v.optional(v.id("users")), // linked to auth user
		name: v.string(),
		email: v.string(),
		phone: v.optional(v.string()),
		whatsapp: v.optional(v.string()),
		company: v.optional(v.string()),
		accessCode: v.string(), // 6-digit broker portal code
		isActive: v.boolean(),
		role: v.string(), // agent, admin
		avatarInitials: v.optional(v.string()),
	})
		.index("by_email", ["email"])
		.index("by_accessCode", ["accessCode"])
		.index("by_userId", ["userId"])
		.index("by_role", ["role"]),

	// Agent-Property assignments
	agentProperties: defineTable({
		agentId: v.id("agents"),
		propertyId: v.id("properties"),
		assignedAt: v.number(),
		// Pipeline status
		pipelineStatus: v.string(), // new, contacted, verified, agent_spoken, intro_sent, offer_sent, pre_deposit, contract, payment_pending, payment_accepted, payment_rejected, closed
		attorneyName: v.optional(v.string()),
		attorneyEmail: v.optional(v.string()),
	})
		.index("by_agent", ["agentId"])
		.index("by_property", ["propertyId"])
		.index("by_agent_status", ["agentId", "pipelineStatus"])
		.index("by_status", ["pipelineStatus"]),

	// Pipeline step notes
	pipelineNotes: defineTable({
		agentPropertyId: v.id("agentProperties"),
		step: v.string(), // matches pipeline step name
		note: v.string(),
		createdAt: v.number(),
		createdBy: v.optional(v.string()), // agent name or "admin"
	}).index("by_agentProperty", ["agentPropertyId"]),

	// Access codes for broker portal
	brokerAccessCodes: defineTable({
		code: v.string(),
		agentId: v.optional(v.id("agents")),
		isUsed: v.boolean(),
		createdAt: v.number(),
	}).index("by_code", ["code"]),
});

export default schema;
