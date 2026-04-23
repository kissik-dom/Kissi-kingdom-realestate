export const APP_NAME = "Kissi Kingdom";

export const CATEGORIES = [
	{ value: "ivy_league", label: "Ivy League & Ivy Plus Schools", icon: "🏛️" },
	{ value: "international", label: "International Top Cities", icon: "🌍" },
	{ value: "minerals", label: "Precious Minerals", icon: "💎" },
	{ value: "wineries", label: "Wineries", icon: "🍷" },
	{ value: "farms_large", label: "Large-Scale Farms", icon: "🌾" },
	{ value: "farms_cattle", label: "Cattle Farms", icon: "🐄" },
	{ value: "farms_specialty", label: "Specialty Fruit & Spice Farms", icon: "🥭" },
	{ value: "nyc_commercial", label: "NYC & NJ Commercial", icon: "🏢" },
	{ value: "nyc_apartments", label: "NYC & NJ Apartments", icon: "🏬" },
	{ value: "hbcu", label: "HBCU Properties", icon: "🎓" },
	{ value: "arenas", label: "Arenas & Stadiums", icon: "🏟️" },
	{ value: "nba_nfl_land", label: "NBA/NFL Large-Acre Land", icon: "🏈" },
] as const;

export const PIPELINE_STEPS = [
	{ key: "new", label: "New / Assigned", color: "bg-gray-500" },
	{ key: "contacted", label: "Initiated Contact", color: "bg-blue-500" },
	{ key: "verified", label: "Property Verified", color: "bg-cyan-500" },
	{ key: "agent_spoken", label: "Spoke to Agent", color: "bg-indigo-500" },
	{ key: "intro_sent", label: "Introductory Letter Sent", color: "bg-purple-500" },
	{ key: "offer_sent", label: "Offer Letter Sent", color: "bg-amber-500" },
	{ key: "pre_deposit", label: "Pre-Deposit / Earnest Money", color: "bg-orange-500" },
	{ key: "contract", label: "Contract", color: "bg-emerald-500" },
	{ key: "payment_pending", label: "Payment Pending", color: "bg-yellow-500" },
	{ key: "payment_accepted", label: "Payment Accepted", color: "bg-green-600" },
	{ key: "payment_rejected", label: "Payment Rejected", color: "bg-red-500" },
	{ key: "closed", label: "Closed", color: "bg-slate-800" },
] as const;

export const PROPERTY_TYPES = [
	{ value: "residential", label: "Residential" },
	{ value: "commercial", label: "Commercial" },
	{ value: "hotel", label: "Hotel" },
	{ value: "land", label: "Land" },
	{ value: "farm", label: "Farm" },
	{ value: "winery", label: "Winery" },
	{ value: "mineral", label: "Mineral" },
	{ value: "arena", label: "Arena" },
	{ value: "apartment_complex", label: "Apartment Complex" },
] as const;
