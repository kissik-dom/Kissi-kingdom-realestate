import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, Filter, MapPin, LogOut, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, PROPERTY_TYPES } from "@/lib/constants";

export function BrowsePage() {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [selectedCountry, setSelectedCountry] = useState<string>("all");
	const [selectedType, setSelectedType] = useState<string>("all");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	// Check broker session
	const brokerAgent = useMemo(() => {
		const stored = sessionStorage.getItem("brokerAgent");
		return stored ? JSON.parse(stored) : null;
	}, []);

	useEffect(() => {
		if (!brokerAgent) {
			navigate("/broker-portal");
		}
	}, [brokerAgent, navigate]);

	const properties = useQuery(api.properties.list, {
		category: selectedCategory !== "all" ? selectedCategory : undefined,
		country: selectedCountry !== "all" ? selectedCountry : undefined,
		propertyType: selectedType !== "all" ? selectedType : undefined,
		limit: 100,
	});

	const searchResults = useQuery(
		api.properties.search,
		searchQuery.length > 2
			? {
					searchQuery,
					category: selectedCategory !== "all" ? selectedCategory : undefined,
					country: selectedCountry !== "all" ? selectedCountry : undefined,
				}
			: "skip",
	);

	const countries = useQuery(api.properties.getCountries, {
		category: selectedCategory !== "all" ? selectedCategory : undefined,
	});

	const displayProperties = searchQuery.length > 2
		? searchResults ?? []
		: properties?.properties ?? [];

	const handleLogout = () => {
		sessionStorage.removeItem("brokerAgent");
		navigate("/broker-portal");
	};

	const formatPrice = (price?: number, label?: string) => {
		if (label) return label;
		if (!price) return "Contact for Price";
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			maximumFractionDigits: 0,
		}).format(price);
	};

	const getCategoryLabel = (val: string) =>
		CATEGORIES.find((c) => c.value === val)?.label ?? val;
	const getCategoryIcon = (val: string) =>
		CATEGORIES.find((c) => c.value === val)?.icon ?? "📍";

	if (!brokerAgent) return null;

	return (
		<div className="flex-1 flex flex-col overflow-hidden bg-[#fafaf8]">
			{/* Top Bar */}
			<div className="bg-[#0f1d3a] text-white px-4 py-3 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<span className="text-lg">👑</span>
					<span className="font-semibold text-sm tracking-wide">
						KISSI KINGDOM
					</span>
				</div>
				<div className="flex items-center gap-4">
					<span className="text-sm text-gray-300">
						Welcome, {brokerAgent.name}
					</span>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleLogout}
						className="text-gray-400 hover:text-white hover:bg-white/10"
					>
						<LogOut className="size-4 mr-1" /> Exit
					</Button>
				</div>
			</div>

			{/* Search & Filters */}
			<div className="bg-white border-b border-[#e0d8cc] px-4 py-4">
				<div className="max-w-7xl mx-auto space-y-4">
					{/* Search bar */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
						<Input
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search properties by name, location..."
							className="pl-10 h-11 bg-[#fafaf8] border-[#e0d8cc]"
						/>
					</div>

					{/* Filter row */}
					<div className="flex flex-wrap gap-3 items-center">
						<Filter className="size-4 text-gray-400" />

						<Select value={selectedCategory} onValueChange={setSelectedCategory}>
							<SelectTrigger className="w-[200px] h-9 text-sm bg-[#fafaf8]">
								<SelectValue placeholder="All Categories" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Categories</SelectItem>
								{CATEGORIES.map((cat) => (
									<SelectItem key={cat.value} value={cat.value}>
										{cat.icon} {cat.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={selectedCountry} onValueChange={setSelectedCountry}>
							<SelectTrigger className="w-[180px] h-9 text-sm bg-[#fafaf8]">
								<SelectValue placeholder="All Countries" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Countries</SelectItem>
								{(countries ?? []).map((c) => (
									<SelectItem key={c} value={c}>
										{c}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={selectedType} onValueChange={setSelectedType}>
							<SelectTrigger className="w-[160px] h-9 text-sm bg-[#fafaf8]">
								<SelectValue placeholder="All Types" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								{PROPERTY_TYPES.map((t) => (
									<SelectItem key={t.value} value={t.value}>
										{t.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<div className="ml-auto flex gap-1">
							<Button
								variant={viewMode === "grid" ? "default" : "ghost"}
								size="sm"
								onClick={() => setViewMode("grid")}
								className="h-9 w-9 p-0"
							>
								<Grid3X3 className="size-4" />
							</Button>
							<Button
								variant={viewMode === "list" ? "default" : "ghost"}
								size="sm"
								onClick={() => setViewMode("list")}
								className="h-9 w-9 p-0"
							>
								<List className="size-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Results */}
			<div className="flex-1 overflow-y-auto px-4 py-6">
				<div className="max-w-7xl mx-auto">
					<div className="flex items-center justify-between mb-4">
						<p className="text-sm text-gray-500">
							{displayProperties.length} properties found
						</p>
					</div>

					{viewMode === "grid" ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
							{displayProperties.map((prop: any) => (
								<div
									key={prop._id}
									className="bg-white border border-[#e0d8cc] rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
								>
									{/* Image placeholder */}
									<div className="h-40 bg-gradient-to-br from-[#0f1d3a] to-[#162850] flex items-center justify-center relative">
										<span className="text-5xl opacity-30">
											{getCategoryIcon(prop.category)}
										</span>
										<Badge className="absolute top-2 right-2 bg-[#c5972c] text-white text-[10px]">
											{prop.status}
										</Badge>
									</div>

									<div className="p-4 space-y-2">
										<h3 className="font-semibold text-sm text-[#0f1d3a] line-clamp-2 group-hover:text-[#c5972c] transition-colors">
											{prop.title}
										</h3>
										<div className="flex items-center gap-1 text-xs text-gray-500">
											<MapPin className="size-3" />
											{prop.city}, {prop.country}
										</div>
										<div className="flex items-center justify-between pt-1">
											<span className="text-sm font-bold text-[#c5972c]">
												{formatPrice(prop.price, prop.priceLabel)}
											</span>
											<Badge
												variant="outline"
												className="text-[10px] border-[#e0d8cc]"
											>
												{getCategoryLabel(prop.category).split(" ")[0]}
											</Badge>
										</div>
										{prop.acreage && (
											<p className="text-xs text-gray-400">
												{prop.acreage.toLocaleString()} acres
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="space-y-2">
							{displayProperties.map((prop: any) => (
								<div
									key={prop._id}
									className="bg-white border border-[#e0d8cc] rounded-lg px-4 py-3 flex items-center gap-4 hover:shadow-md transition-shadow"
								>
									<div className="w-12 h-12 bg-[#0f1d3a] rounded-lg flex items-center justify-center shrink-0">
										<span className="text-xl">
											{getCategoryIcon(prop.category)}
										</span>
									</div>
									<div className="flex-1 min-w-0">
										<h3 className="font-semibold text-sm text-[#0f1d3a] truncate">
											{prop.title}
										</h3>
										<div className="flex items-center gap-1 text-xs text-gray-500">
											<MapPin className="size-3" />
											{prop.city}, {prop.country}
										</div>
									</div>
									<Badge
										variant="outline"
										className="text-[10px] border-[#e0d8cc] shrink-0"
									>
										{getCategoryLabel(prop.category).split(" ")[0]}
									</Badge>
									<span className="text-sm font-bold text-[#c5972c] shrink-0 w-28 text-right">
										{formatPrice(prop.price, prop.priceLabel)}
									</span>
									<Badge className="bg-[#c5972c]/10 text-[#c5972c] text-[10px] shrink-0">
										{prop.status}
									</Badge>
								</div>
							))}
						</div>
					)}

					{displayProperties.length === 0 && (
						<div className="text-center py-20 text-gray-400">
							<p className="text-lg">No properties found</p>
							<p className="text-sm mt-2">
								Try adjusting your filters or search query
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
