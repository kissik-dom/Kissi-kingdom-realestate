import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";

// Generate a 6-digit access code
function genCode(index: number): string {
	return String(100000 + index).slice(0, 6);
}

const FIRST_NAMES = [
	"Amara", "Kwame", "Zuri", "Chidi", "Nia", "Kofi", "Adaeze", "Emeka", "Fatima", "Ibrahim",
	"Lena", "Marcus", "Sofia", "James", "Priya", "Chen", "Akiko", "Raj", "Elena", "Omar",
	"Yuki", "Diego", "Aisha", "Leo", "Mei", "Andre", "Nadia", "Theo", "Luna", "Hassan",
	"Julia", "David", "Sakura", "Victor", "Ingrid", "Bruno", "Freya", "Mateo", "Isla", "Kai",
	"Amina", "Felix", "Zara", "Noah", "Maya", "Ethan", "Chloe", "Lucas", "Eva", "Gabriel",
	"Olivia", "Alex", "Sophie", "Ryan", "Leila", "Daniel", "Grace", "Liam", "Aria", "Nathan",
	"Carmen", "Jake", "Serena", "Max", "Vivian", "Sam", "Tara", "Cole", "Ivy", "Miles",
	"Jade", "Finn", "Rosa", "Dean", "Pearl", "Blake", "Iris", "Sean", "Vera", "Troy",
	"Hope", "Grant", "Faith", "Reid", "Dawn", "Clay", "Lily", "Beau", "Fern", "Cruz",
	"Sage", "Knox", "Wren", "Lane", "Skye", "Jude", "Opal", "Nash", "Ruth", "Tate",
];

const LAST_NAMES = [
	"Okafor", "Mensah", "Williams", "Chen", "Patel", "Rodriguez", "Kim", "Johnson", "Nakamura", "Santos",
	"Ali", "Murphy", "Singh", "Brown", "Petrov", "Garcia", "Tanaka", "Anderson", "Hassan", "Taylor",
	"Wright", "Lopez", "Yamamoto", "Martin", "Cohen", "Wilson", "Das", "Thompson", "Ivanova", "Moore",
	"Jackson", "White", "Harris", "Clark", "Lewis", "Walker", "Hall", "Young", "King", "Scott",
	"Green", "Adams", "Baker", "Hill", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "Turner",
	"Phillips", "Evans", "Collins", "Stewart", "Morris", "Reed", "Cook", "Morgan", "Bell", "Bailey",
	"Cooper", "Howard", "Ward", "Cox", "Brooks", "Gray", "Hughes", "Price", "Russell", "Wood",
	"Barnes", "Ross", "Long", "Foster", "Powell", "Perry", "Butler", "Bennett", "Fisher", "Hunt",
	"Dean", "Hart", "Stone", "Fox", "Webb", "Cole", "West", "Grant", "Lane", "Cruz",
	"Boyd", "Marsh", "Quinn", "Watts", "Park", "Reyes", "Flores", "Shaw", "Black", "Wells",
];

// Sample property data by category
const PROPERTY_TEMPLATES = {
	ivy_league: {
		propertyType: "residential",
		subcategories: ["Harvard University", "Yale University", "Princeton University", "Columbia University", "Brown University", "Cornell University", "UPenn", "Dartmouth College", "USC", "UCLA", "Notre Dame"],
		cities: [
			{ city: "Cambridge", state: "MA", country: "United States" },
			{ city: "New Haven", state: "CT", country: "United States" },
			{ city: "Princeton", state: "NJ", country: "United States" },
			{ city: "New York", state: "NY", country: "United States" },
			{ city: "Providence", state: "RI", country: "United States" },
			{ city: "Ithaca", state: "NY", country: "United States" },
			{ city: "Philadelphia", state: "PA", country: "United States" },
			{ city: "Hanover", state: "NH", country: "United States" },
			{ city: "Los Angeles", state: "CA", country: "United States" },
			{ city: "South Bend", state: "IN", country: "United States" },
		],
		priceRange: [500000, 15000000],
		titles: ["Luxury Estate near {sub}", "Historic Home by {sub}", "Modern Residence close to {sub}", "Double Parcel Property near {sub}", "Multi-Family near {sub}"],
	},
	international: {
		propertyType: "residential",
		subcategories: ["London", "Paris", "Monaco", "Rome", "Tokyo", "Seoul", "Manila", "Dubai", "Singapore", "Hong Kong"],
		cities: [
			{ city: "London", country: "United Kingdom" },
			{ city: "Paris", country: "France" },
			{ city: "Monaco", country: "Monaco" },
			{ city: "Rome", country: "Italy" },
			{ city: "Tokyo", country: "Japan" },
			{ city: "Seoul", country: "South Korea" },
			{ city: "Manila", country: "Philippines" },
			{ city: "Dubai", country: "United Arab Emirates" },
			{ city: "Singapore", country: "Singapore" },
			{ city: "Hong Kong", country: "China" },
		],
		priceRange: [1000000, 50000000],
		titles: ["Luxury Penthouse in {city}", "Waterfront Estate in {city}", "Historic Villa in {city}", "Modern Tower in {city}", "Grand Residence in {city}"],
	},
	minerals: {
		propertyType: "mineral",
		subcategories: ["Emeralds", "Rubies", "Sapphires", "Diamonds", "Gold", "Rose Quartz", "Aquamarine", "Yellow Diamonds", "Turquoise"],
		cities: [
			{ city: "Bogotá", country: "Colombia" },
			{ city: "Mogok", country: "Myanmar" },
			{ city: "Ratnapura", country: "Sri Lanka" },
			{ city: "Kimberley", country: "South Africa" },
			{ city: "Kalgoorlie", country: "Australia" },
			{ city: "Minas Gerais", country: "Brazil" },
			{ city: "Jaipur", country: "India" },
			{ city: "Tucson", state: "AZ", country: "United States" },
			{ city: "Antwerp", country: "Belgium" },
			{ city: "Bangkok", country: "Thailand" },
		],
		priceRange: [2000000, 100000000],
		titles: ["{sub} Mining Property in {city}", "{sub} Rich Land in {country}", "Active {sub} Mine - {city}", "{sub} Deposit Property", "Premium {sub} Claim - {country}"],
	},
	wineries: {
		propertyType: "winery",
		subcategories: ["Red Wine", "White Wine", "Sparkling", "Rosé", "Organic"],
		cities: [
			{ city: "Napa Valley", state: "CA", country: "United States" },
			{ city: "Bordeaux", country: "France" },
			{ city: "Tuscany", country: "Italy" },
			{ city: "Mendoza", country: "Argentina" },
			{ city: "Stellenbosch", country: "South Africa" },
			{ city: "Barossa Valley", country: "Australia" },
			{ city: "Rioja", country: "Spain" },
			{ city: "Douro Valley", country: "Portugal" },
			{ city: "Marlborough", country: "New Zealand" },
			{ city: "Willamette Valley", state: "OR", country: "United States" },
		],
		priceRange: [3000000, 75000000],
		titles: ["Premium Winery Estate in {city}", "Historic Vineyard in {city}", "{sub} Vineyard - {country}", "Boutique Winery in {city}", "Grand Cru Estate - {city}"],
	},
	farms_large: {
		propertyType: "farm",
		subcategories: ["Crop Farm", "Mixed Use", "Timber", "Grazing", "Irrigated"],
		cities: [
			{ city: "Dallas", state: "TX", country: "United States" },
			{ city: "Kansas City", state: "KS", country: "United States" },
			{ city: "Montana", state: "MT", country: "United States" },
			{ city: "Queensland", country: "Australia" },
			{ city: "Saskatchewan", country: "Canada" },
			{ city: "São Paulo", country: "Brazil" },
			{ city: "Córdoba", country: "Argentina" },
			{ city: "Nairobi", country: "Kenya" },
			{ city: "Harare", country: "Zimbabwe" },
			{ city: "Canterbury", country: "New Zealand" },
		],
		priceRange: [5000000, 200000000],
		titles: ["{acreage}-Acre Ranch in {state}", "Large Scale Farm - {city}", "Premium Farmland in {country}", "{sub} Operation - {city}", "Expansive Agricultural Estate"],
	},
	farms_cattle: {
		propertyType: "farm",
		subcategories: ["Organic Beef", "Wagyu", "Angus", "Hereford", "Mixed"],
		cities: [
			{ city: "Fort Worth", state: "TX", country: "United States" },
			{ city: "Cheyenne", state: "WY", country: "United States" },
			{ city: "Billings", state: "MT", country: "United States" },
			{ city: "Buenos Aires", country: "Argentina" },
			{ city: "São Paulo", country: "Brazil" },
			{ city: "Queensland", country: "Australia" },
			{ city: "Waikato", country: "New Zealand" },
			{ city: "Alberta", country: "Canada" },
		],
		priceRange: [2000000, 80000000],
		titles: ["{sub} Cattle Ranch in {city}", "Premium Cattle Operation - {state}", "Organic Ranch in {country}", "{sub} Farm - {city}", "Heritage Cattle Estate"],
	},
	farms_specialty: {
		propertyType: "farm",
		subcategories: ["Mango Farm", "Citrus Grove", "Exotic Fruits", "Spice Farm", "Cocoa", "Vanilla", "Saffron"],
		cities: [
			{ city: "Kerala", country: "India" },
			{ city: "Zanzibar", country: "Tanzania" },
			{ city: "Davao", country: "Philippines" },
			{ city: "Oaxaca", country: "Mexico" },
			{ city: "Kumasi", country: "Ghana" },
			{ city: "Madagascar City", country: "Madagascar" },
			{ city: "Kona", state: "HI", country: "United States" },
			{ city: "Chiang Mai", country: "Thailand" },
		],
		priceRange: [1000000, 30000000],
		titles: ["{sub} in {city}", "Premium {sub} - {country}", "Organic {sub} Estate", "Heritage {sub} in {city}", "Award-Winning {sub}"],
	},
	nyc_commercial: {
		propertyType: "commercial",
		subcategories: ["Hotel", "Office Tower", "Mixed-Use", "Retail", "Development Site"],
		cities: [
			{ city: "Manhattan", state: "NY", country: "United States" },
			{ city: "Midtown", state: "NY", country: "United States" },
			{ city: "Financial District", state: "NY", country: "United States" },
			{ city: "SoHo", state: "NY", country: "United States" },
			{ city: "Times Square", state: "NY", country: "United States" },
			{ city: "Jersey City", state: "NJ", country: "United States" },
			{ city: "Hoboken", state: "NJ", country: "United States" },
		],
		priceRange: [10000000, 500000000],
		titles: ["{sub} Property in {city}", "{stories}-Story {sub} - {city}", "Prime {sub} in {city}", "Landmark {sub} - {city}", "Trophy {sub} Asset"],
	},
	nyc_apartments: {
		propertyType: "apartment_complex",
		subcategories: ["Luxury Complex", "Full Building", "Pre-War Building", "New Development", "Converted Loft"],
		cities: [
			{ city: "Manhattan", state: "NY", country: "United States" },
			{ city: "Brooklyn", state: "NY", country: "United States" },
			{ city: "Queens", state: "NY", country: "United States" },
			{ city: "Bronx", state: "NY", country: "United States" },
			{ city: "Jersey City", state: "NJ", country: "United States" },
			{ city: "Newark", state: "NJ", country: "United States" },
		],
		priceRange: [5000000, 200000000],
		titles: ["{sub} in {city}", "Full Building - {city}", "{sub} - {city}", "Prime Apartment Complex in {city}", "{sub} Tower"],
	},
	hbcu: {
		propertyType: "residential",
		subcategories: ["Spelman College", "Howard University", "Florida A&M", "Tuskegee University", "Morehouse College", "Hampton University", "Xavier University", "Fisk University", "Claflin University", "NC A&T"],
		cities: [
			{ city: "Atlanta", state: "GA", country: "United States" },
			{ city: "Washington", state: "DC", country: "United States" },
			{ city: "Tallahassee", state: "FL", country: "United States" },
			{ city: "Tuskegee", state: "AL", country: "United States" },
			{ city: "Hampton", state: "VA", country: "United States" },
			{ city: "New Orleans", state: "LA", country: "United States" },
			{ city: "Nashville", state: "TN", country: "United States" },
			{ city: "Orangeburg", state: "SC", country: "United States" },
			{ city: "Greensboro", state: "NC", country: "United States" },
			{ city: "Baltimore", state: "MD", country: "United States" },
		],
		priceRange: [200000, 5000000],
		titles: ["Double Parcel near {sub}", "Commercial Property by {sub}", "Investment Property near {sub}", "Adjacent Parcels close to {sub}", "Residential near {sub}"],
	},
	arenas: {
		propertyType: "arena",
		subcategories: ["Sports Arena", "Concert Venue", "Multi-Purpose Stadium", "Convention Center", "Historic Arena"],
		cities: [
			{ city: "Las Vegas", state: "NV", country: "United States" },
			{ city: "Orlando", state: "FL", country: "United States" },
			{ city: "Nashville", state: "TN", country: "United States" },
			{ city: "London", country: "United Kingdom" },
			{ city: "Dubai", country: "United Arab Emirates" },
			{ city: "Sydney", country: "Australia" },
		],
		priceRange: [50000000, 2000000000],
		titles: ["{sub} in {city}", "Landmark {sub} - {city}", "Modern {sub}", "Premium {sub} - {country}", "World-Class {sub}"],
	},
	nba_nfl_land: {
		propertyType: "land",
		subcategories: ["Flat Land", "Mountainous", "Waterfront", "Development Ready", "Mixed Terrain"],
		cities: [
			{ city: "Atlanta", state: "GA", country: "United States" },
			{ city: "Dallas", state: "TX", country: "United States" },
			{ city: "Denver", state: "CO", country: "United States" },
			{ city: "Houston", state: "TX", country: "United States" },
			{ city: "Los Angeles", state: "CA", country: "United States" },
			{ city: "Miami", state: "FL", country: "United States" },
			{ city: "Phoenix", state: "AZ", country: "United States" },
			{ city: "Chicago", state: "IL", country: "United States" },
			{ city: "Nashville", state: "TN", country: "United States" },
			{ city: "Las Vegas", state: "NV", country: "United States" },
		],
		priceRange: [10000000, 300000000],
		titles: ["{acreage}-Acre {sub} near {city}", "Large Acreage near {city}", "{sub} Parcel - {state}", "Development Land near {city}", "Premium Acreage - {city}"],
	},
};

const BROKERS = [
	{ name: "Marcus & Associates", email: "info@marcusrealty.com", phone: "+1-212-555-0101" },
	{ name: "Global Properties Ltd", email: "deals@globalprops.com", phone: "+44-20-7946-0958" },
	{ name: "Pinnacle Real Estate", email: "inquiries@pinnaclere.com", phone: "+1-310-555-0192" },
	{ name: "Crown & Associates", email: "office@crownassociates.com", phone: "+1-646-555-0173" },
	{ name: "Sovereign Realty Group", email: "contact@sovereignrealty.com", phone: "+971-4-555-0144" },
	{ name: "Pacific Rim Properties", email: "info@pacrimprops.com", phone: "+81-3-5555-0125" },
	{ name: "Atlas International", email: "deals@atlasinternational.com", phone: "+33-1-5555-0136" },
	{ name: "Keystone Capital Realty", email: "office@keystonecr.com", phone: "+1-415-555-0187" },
];

const STATUSES = ["available", "available", "available", "available", "pending", "off_market"];
const PIPELINE_STATUSES = ["new", "new", "contacted", "verified", "agent_spoken", "intro_sent", "offer_sent", "pre_deposit", "contract", "payment_pending"];

function randomFrom<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min)) + min;
}

export const seedAll = internalMutation({
	args: {},
	returns: v.null(),
	handler: async (ctx) => {
		// Check if already seeded
		const existing = await ctx.db.query("agents").first();
		if (existing) {
			console.log("Already seeded, skipping");
			return null;
		}

		// 1. Create 100 agents + 1 admin
		const agentIds = [];
		// Admin first
		const adminId = await ctx.db.insert("agents", {
			name: "Yumba Kamanda",
			email: "admin@kissikingdom.com",
			phone: "+1-000-000-0001",
			accessCode: "000001",
			isActive: true,
			role: "admin",
			avatarInitials: "YK",
		});
		agentIds.push(adminId);

		for (let i = 0; i < 100; i++) {
			const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
			const lastName = LAST_NAMES[i % LAST_NAMES.length];
			const code = genCode(i + 2);
			const id = await ctx.db.insert("agents", {
				name: `${firstName} ${lastName}`,
				email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@kissikingdom.com`,
				phone: `+1-555-${String(1000 + i).slice(0, 3)}-${String(1000 + i).slice(1, 5)}`,
				accessCode: code,
				isActive: true,
				role: "agent",
				avatarInitials: `${firstName[0]}${lastName[0]}`,
			});
			agentIds.push(id);
		}

		// 2. Create properties across all categories - 25 per category = 300 total sample
		const categories = Object.keys(PROPERTY_TEMPLATES) as (keyof typeof PROPERTY_TEMPLATES)[];
		const propertyIds = [];

		for (const cat of categories) {
			const tmpl = PROPERTY_TEMPLATES[cat];
			const count = cat === "arenas" ? 10 : 25;

			for (let i = 0; i < count; i++) {
				const loc = randomFrom(tmpl.cities);
				const sub = randomFrom(tmpl.subcategories);
				const broker = randomFrom(BROKERS);
				const price = randomBetween(tmpl.priceRange[0], tmpl.priceRange[1]);
				const acreage = cat.includes("farm") || cat === "nba_nfl_land" ? randomBetween(1000, 60000) : undefined;
				const stories = cat === "nyc_commercial" ? randomBetween(5, 60) : undefined;

				const locState = "state" in loc ? (loc as any).state as string : "";
				let title = randomFrom(tmpl.titles)
					.replace("{sub}", sub)
					.replace("{city}", loc.city)
					.replace("{country}", loc.country)
					.replace("{state}", locState || "")
					.replace("{acreage}", String(acreage || ""))
					.replace("{stories}", String(stories || ""));

				const id = await ctx.db.insert("properties", {
					title,
					description: `Premium ${tmpl.propertyType} property in ${loc.city}, ${loc.country}. ${sub} category. Contact broker for full details and private viewing.`,
					price,
					priceLabel: price > 10000000 ? `$${(price / 1000000).toFixed(1)}M` : `$${(price / 1000).toFixed(0)}K`,
					currency: "USD",
					country: loc.country,
					city: loc.city,
					state: "state" in loc ? (loc as any).state as string : undefined,
					category: cat,
					propertyType: tmpl.propertyType,
					subcategory: sub,
					acreage,
					stories,
					parcels: cat === "ivy_league" || cat === "hbcu" ? randomBetween(2, 4) : undefined,
					imageUrl: `https://images.unsplash.com/photo-${1560518883 + i}?w=800&h=600`,
					listingUrl: `https://example.com/listing/${cat}-${i}`,
					brokerName: broker.name,
					brokerEmail: broker.email,
					brokerPhone: broker.phone,
					brokerCompany: broker.name,
					status: randomFrom(STATUSES),
					isVerified: Math.random() > 0.3,
				});
				propertyIds.push(id);
			}
		}

		// 3. Assign properties to agents (each agent gets 2-5 properties)
		for (let i = 1; i <= 100; i++) {
			const agentId = agentIds[i];
			const numProps = randomBetween(2, 6);
			for (let j = 0; j < numProps; j++) {
				const propId = randomFrom(propertyIds);
				const status = randomFrom(PIPELINE_STATUSES);
				await ctx.db.insert("agentProperties", {
					agentId,
					propertyId: propId,
					assignedAt: Date.now() - randomBetween(0, 30 * 24 * 60 * 60 * 1000),
					pipelineStatus: status,
				});
			}
		}

		// 4. Create broker access codes table entries
		for (let i = 0; i < 100; i++) {
			await ctx.db.insert("brokerAccessCodes", {
				code: genCode(i + 2),
				agentId: agentIds[i + 1],
				isUsed: false,
				createdAt: Date.now(),
			});
		}

		console.log(`Seeded: 1 admin + 100 agents, ${propertyIds.length} properties`);
		return null;
	},
});

// Public mutation to seed the database — callable from admin UI
export const seedDatabase = mutation({
	args: {},
	returns: v.any(),
	handler: async (ctx) => {
		// Check if already seeded
		const existing = await ctx.db.query("agents").first();
		if (existing) {
			const agentCount = (await ctx.db.query("agents").collect()).length;
			const propCount = (await ctx.db.query("properties").collect()).length;
			return { status: "already_seeded", agents: agentCount, properties: propCount };
		}

		// 1. Create 100 agents + 1 admin
		const agentIds = [];
		const adminId = await ctx.db.insert("agents", {
			name: "Yumba Kamanda",
			email: "admin@kissikingdom.com",
			phone: "+1-000-000-0001",
			accessCode: "000001",
			isActive: true,
			role: "admin",
			avatarInitials: "YK",
		});
		agentIds.push(adminId);

		for (let i = 0; i < 100; i++) {
			const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
			const lastName = LAST_NAMES[i % LAST_NAMES.length];
			const code = genCode(i + 2);
			const id = await ctx.db.insert("agents", {
				name: `${firstName} ${lastName}`,
				email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@kissikingdom.com`,
				phone: `+1-555-${String(1000 + i).slice(0, 3)}-${String(1000 + i).slice(1, 5)}`,
				accessCode: code,
				isActive: true,
				role: "agent",
				avatarInitials: `${firstName[0]}${lastName[0]}`,
			});
			agentIds.push(id);
		}

		// 2. Create properties across all categories
		const categories = Object.keys(PROPERTY_TEMPLATES) as (keyof typeof PROPERTY_TEMPLATES)[];
		const propertyIds = [];

		for (const cat of categories) {
			const tmpl = PROPERTY_TEMPLATES[cat];
			const count = cat === "arenas" ? 10 : 25;

			for (let i = 0; i < count; i++) {
				const loc = randomFrom(tmpl.cities);
				const sub = randomFrom(tmpl.subcategories);
				const broker = randomFrom(BROKERS);
				const price = randomBetween(tmpl.priceRange[0], tmpl.priceRange[1]);
				const acreage = cat.includes("farm") || cat === "nba_nfl_land" ? randomBetween(1000, 60000) : undefined;
				const stories = cat === "nyc_commercial" ? randomBetween(5, 60) : undefined;

				const locState = "state" in loc ? (loc as any).state as string : "";
				let title = randomFrom(tmpl.titles)
					.replace("{sub}", sub)
					.replace("{city}", loc.city)
					.replace("{country}", loc.country)
					.replace("{state}", locState || "")
					.replace("{acreage}", String(acreage || ""))
					.replace("{stories}", String(stories || ""));

				const id = await ctx.db.insert("properties", {
					title,
					description: `Premium ${tmpl.propertyType} property in ${loc.city}, ${loc.country}. ${sub} category. Contact broker for full details and private viewing.`,
					price,
					priceLabel: price > 10000000 ? `$${(price / 1000000).toFixed(1)}M` : `$${(price / 1000).toFixed(0)}K`,
					currency: "USD",
					country: loc.country,
					city: loc.city,
					state: "state" in loc ? (loc as any).state as string : undefined,
					category: cat,
					propertyType: tmpl.propertyType,
					subcategory: sub,
					acreage,
					stories,
					parcels: cat === "ivy_league" || cat === "hbcu" ? randomBetween(2, 4) : undefined,
					imageUrl: `https://images.unsplash.com/photo-${1560518883 + i}?w=800&h=600`,
					listingUrl: `https://example.com/listing/${cat}-${i}`,
					brokerName: broker.name,
					brokerEmail: broker.email,
					brokerPhone: broker.phone,
					brokerCompany: broker.name,
					status: randomFrom(STATUSES),
					isVerified: Math.random() > 0.3,
				});
				propertyIds.push(id);
			}
		}

		// 3. Assign properties to agents
		for (let i = 1; i <= 100; i++) {
			const agentId = agentIds[i];
			const numProps = randomBetween(2, 6);
			for (let j = 0; j < numProps; j++) {
				const propId = randomFrom(propertyIds);
				const status = randomFrom(PIPELINE_STATUSES);
				await ctx.db.insert("agentProperties", {
					agentId,
					propertyId: propId,
					assignedAt: Date.now() - randomBetween(0, 30 * 24 * 60 * 60 * 1000),
					pipelineStatus: status,
				});
			}
		}

		// 4. Create broker access codes
		for (let i = 0; i < 100; i++) {
			await ctx.db.insert("brokerAccessCodes", {
				code: genCode(i + 2),
				agentId: agentIds[i + 1],
				isUsed: false,
				createdAt: Date.now(),
			});
		}

		return { status: "seeded", agents: 101, properties: propertyIds.length };
	},
});
