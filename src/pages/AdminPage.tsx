import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
	Search,
	Users,
	Building,
	BarChart3,
	MapPin,
	CheckCircle,
	ChevronDown,
	ChevronRight,
	Globe,
	Filter,
	Plus,
	UserPlus,
	ExternalLink,
	Mail,
	Phone,
	Check,
	Eye,
	Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { CATEGORIES, PIPELINE_STEPS, PROPERTY_TYPES } from "@/lib/constants";
import type { Id } from "../../convex/_generated/dataModel";

export function AdminPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedPipelineStatus, setSelectedPipelineStatus] =
		useState<string>("all");
	const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
	const [showCreateAgent, setShowCreateAgent] = useState(false);
	const [_showAssignPanel, setShowAssignPanel] = useState(false);
	const [assignAgentId, setAssignAgentId] = useState<string | null>(null);
	const [showPropertyDetail, setShowPropertyDetail] = useState<any>(null);

	// Property browsing state for assignment
	const [assignCategory, setAssignCategory] = useState<string>("all");
	const [assignCountry, setAssignCountry] = useState<string>("all");
	const [assignType, setAssignType] = useState<string>("all");
	const [assignSearch, setAssignSearch] = useState("");

	const agentsWithCounts = useQuery(api.agents.listWithCounts, {});
	const agentStats = useQuery(api.agents.stats, {});
	const propertyStats = useQuery(api.properties.stats, {});
	const pipelineStats = useQuery(api.pipeline.pipelineStats, {});
	const allAssignments = useQuery(api.pipeline.listAll, {
		status:
			selectedPipelineStatus !== "all" ? selectedPipelineStatus : undefined,
		limit: 200,
	});

	// Properties for assignment panel
	const assignProperties = useQuery(api.properties.list, {
		category: assignCategory !== "all" ? assignCategory : undefined,
		country: assignCountry !== "all" ? assignCountry : undefined,
		propertyType: assignType !== "all" ? assignType : undefined,
		limit: 100,
	});

	const assignSearchResults = useQuery(
		api.properties.search,
		assignSearch.length > 2
			? {
					searchQuery: assignSearch,
					category:
						assignCategory !== "all" ? assignCategory : undefined,
					country:
						assignCountry !== "all" ? assignCountry : undefined,
				}
			: "skip",
	);

	// Admin browsing
	const [adminBrowseCategory, setAdminBrowseCategory] =
		useState<string>("all");
	const [adminBrowseCountry, setAdminBrowseCountry] =
		useState<string>("all");
	const [adminBrowseSearch, setAdminBrowseSearch] = useState("");

	const adminProperties = useQuery(api.properties.list, {
		category:
			adminBrowseCategory !== "all" ? adminBrowseCategory : undefined,
		country:
			adminBrowseCountry !== "all" ? adminBrowseCountry : undefined,
		limit: 100,
	});

	const adminSearchResults = useQuery(
		api.properties.search,
		adminBrowseSearch.length > 2
			? {
					searchQuery: adminBrowseSearch,
					category:
						adminBrowseCategory !== "all"
							? adminBrowseCategory
							: undefined,
					country:
						adminBrowseCountry !== "all"
							? adminBrowseCountry
							: undefined,
				}
			: "skip",
	);

	const countries = useQuery(api.properties.getCountries, {
		category:
			assignCategory !== "all" ? assignCategory : undefined,
	});

	// Already assigned property IDs for selected agent
	const assignedPropertyIds = useQuery(
		api.pipeline.getAssignedPropertyIds,
		assignAgentId ? { agentId: assignAgentId as Id<"agents"> } : "skip",
	);
	const assignedSet = new Set(assignedPropertyIds ?? []);

	const assignPropertyMut = useMutation(api.pipeline.assignProperty);
	const unassignPropertyMut = useMutation(api.pipeline.unassignProperty);
	// @ts-ignore used for future features
	const bulkAssignMut = useMutation(api.pipeline.bulkAssignProperties); // eslint-disable-line
	const createAgentMut = useMutation(api.agents.create);
	// @ts-ignore used for future features
	const removeAgentMut = useMutation(api.agents.remove); // eslint-disable-line
	const seedDatabaseMut = useMutation(api.seed.seedDatabase);
	const [isSeeding, setIsSeeding] = useState(false);

	const handleSeedDatabase = async () => {
		setIsSeeding(true);
		try {
			const result = await seedDatabaseMut({});
			if (result?.status === "already_seeded") {
				toast.info(`Database already seeded: ${result.agents} agents, ${result.properties} properties`);
			} else {
				toast.success(`Database seeded: ${result?.agents} agents, ${result?.properties} properties`);
			}
		} catch (err) {
			toast.error("Failed to seed database");
			console.error(err);
		} finally {
			setIsSeeding(false);
		}
	};

	const filteredAgents = (agentsWithCounts ?? []).filter(
		(a: any) =>
			!searchQuery ||
			a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			a.email.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const getStepInfo = (key: string) =>
		PIPELINE_STEPS.find((s) => s.key === key) ?? {
			key,
			label: key,
			color: "bg-gray-500",
		};

	const getCategoryIcon = (val: string) =>
		CATEGORIES.find((c) => c.value === val)?.icon ?? "📍";

	const formatPrice = (price?: number, label?: string, currency?: string) => {
		if (label) return label;
		if (!price) return "Contact";
		if (price >= 1_000_000) return `${currency || "USD"} ${(price / 1_000_000).toFixed(1)}M`;
		if (price >= 1_000) return `${currency || "USD"} ${(price / 1_000).toFixed(0)}K`;
		return `${currency || "USD"} ${price.toLocaleString()}`;
	};

	const handleToggleAssignment = async (propertyId: string) => {
		if (!assignAgentId) return;
		try {
			if (assignedSet.has(propertyId)) {
				await unassignPropertyMut({
					agentId: assignAgentId as Id<"agents">,
					propertyId: propertyId as Id<"properties">,
				});
				toast.success("Property unassigned");
			} else {
				await assignPropertyMut({
					agentId: assignAgentId as Id<"agents">,
					propertyId: propertyId as Id<"properties">,
				});
				toast.success("Property assigned!");
			}
		} catch {
			toast.error("Failed to update assignment");
		}
	};

	const displayAssignProperties =
		assignSearch.length > 2
			? assignSearchResults ?? []
			: assignProperties?.properties ?? [];

	const displayAdminProperties =
		adminBrowseSearch.length > 2
			? adminSearchResults ?? []
			: adminProperties?.properties ?? [];

	return (
		<div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-[#0f1d3a]">
						Admin Command Center
					</h1>
					<p className="text-sm text-gray-500 mt-1">
						Full oversight of all agents, properties, and pipeline
						activity
					</p>
				</div>
				{(agentStats?.totalAgents ?? 0) === 0 && (
					<Button
						onClick={handleSeedDatabase}
						disabled={isSeeding}
						className="bg-[#c5972c] hover:bg-[#d4a94a] text-white"
					>
						{isSeeding ? "Seeding..." : "Initialize Database"}
					</Button>
				)}
			</div>

			{/* Overview Stats */}
			<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
				<div className="bg-white border border-[#e0d8cc] rounded-lg p-4">
					<div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
						<Users className="size-3" /> Total Agents
					</div>
					<div className="text-2xl font-bold text-[#0f1d3a]">
						{agentStats?.totalAgents ?? 0}
					</div>
				</div>
				<div className="bg-white border border-[#e0d8cc] rounded-lg p-4">
					<div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
						<Building className="size-3" /> Properties
					</div>
					<div className="text-2xl font-bold text-[#c5972c]">
						{(propertyStats?.totalProperties ?? 0).toLocaleString()}
					</div>
				</div>
				<div className="bg-white border border-[#e0d8cc] rounded-lg p-4">
					<div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
						<Globe className="size-3" /> Countries
					</div>
					<div className="text-2xl font-bold text-[#0f1d3a]">
						{propertyStats?.totalCountries ?? 0}
					</div>
				</div>
				<div className="bg-white border border-[#e0d8cc] rounded-lg p-4">
					<div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
						<BarChart3 className="size-3" /> In Pipeline
					</div>
					<div className="text-2xl font-bold text-emerald-600">
						{pipelineStats?.total ?? 0}
					</div>
				</div>
				<div className="bg-white border border-[#e0d8cc] rounded-lg p-4">
					<div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
						<CheckCircle className="size-3" /> Accepted
					</div>
					<div className="text-2xl font-bold text-green-600">
						{pipelineStats?.byStatus?.payment_accepted ?? 0}
					</div>
				</div>
			</div>

			{/* Tabs */}
			<Tabs defaultValue="agents" className="space-y-4">
				<TabsList className="bg-white border border-[#e0d8cc]">
					<TabsTrigger
						value="agents"
						className="data-[state=active]:bg-[#0f1d3a] data-[state=active]:text-white"
					>
						<Users className="size-3 mr-1" /> Agents
					</TabsTrigger>
					<TabsTrigger
						value="assign"
						className="data-[state=active]:bg-[#0f1d3a] data-[state=active]:text-white"
					>
						<Layers className="size-3 mr-1" /> Assign Properties
					</TabsTrigger>
					<TabsTrigger
						value="pipeline"
						className="data-[state=active]:bg-[#0f1d3a] data-[state=active]:text-white"
					>
						<BarChart3 className="size-3 mr-1" /> Pipeline
					</TabsTrigger>
					<TabsTrigger
						value="properties"
						className="data-[state=active]:bg-[#0f1d3a] data-[state=active]:text-white"
					>
						<Building className="size-3 mr-1" /> All Properties
					</TabsTrigger>
				</TabsList>

				{/* Agents Tab */}
				<TabsContent value="agents" className="space-y-4">
					<div className="flex gap-3">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search agents by name or email..."
								className="pl-10 h-10 bg-white border-[#e0d8cc]"
							/>
						</div>
						<Button
							onClick={() => setShowCreateAgent(true)}
							className="bg-[#c5972c] hover:bg-[#d4a94a] text-white h-10"
						>
							<UserPlus className="size-4 mr-1" /> New Agent
						</Button>
					</div>

					<div className="space-y-2">
						{filteredAgents.map((agent: any) => (
							<div
								key={agent._id}
								className="bg-white border border-[#e0d8cc] rounded-lg overflow-hidden"
							>
								<div className="flex items-center gap-3 p-4">
									<button
										type="button"
										className="flex items-center gap-3 flex-1 hover:bg-[#fafaf8] transition-colors text-left min-w-0"
										onClick={() =>
											setExpandedAgent(
												expandedAgent === agent._id
													? null
													: agent._id,
											)
										}
									>
										<div className="w-10 h-10 rounded-full bg-[#0f1d3a] flex items-center justify-center text-white text-sm font-medium shrink-0">
											{agent.avatarInitials ||
												agent.name
													.slice(0, 2)
													.toUpperCase()}
										</div>
										<div className="flex-1 min-w-0">
											<div className="font-semibold text-sm text-[#0f1d3a]">
												{agent.name}
											</div>
											<div className="text-xs text-gray-500">
												{agent.email}
											</div>
										</div>
										<Badge
											variant="outline"
											className={`text-[10px] shrink-0 ${agent.role === "admin" ? "border-[#c5972c] text-[#c5972c]" : "border-[#e0d8cc]"}`}
										>
											{agent.role}
										</Badge>
										<div className="text-xs text-gray-400 shrink-0">
											Code: {agent.accessCode}
										</div>
										<Badge
											variant="outline"
											className="text-[10px] shrink-0 border-emerald-300 text-emerald-600"
										>
											{agent.assignmentCount ?? 0}{" "}
											properties
										</Badge>
									</button>
									<Button
										variant="outline"
										size="sm"
										className="shrink-0 h-8 text-xs border-[#c5972c] text-[#c5972c] hover:bg-[#c5972c] hover:text-white"
										onClick={() => {
											setAssignAgentId(agent._id);
											setShowAssignPanel(true);
										}}
									>
										<Plus className="size-3 mr-1" /> Assign
									</Button>
									{expandedAgent === agent._id ? (
										<ChevronDown className="size-4 text-gray-400 shrink-0" />
									) : (
										<ChevronRight className="size-4 text-gray-400 shrink-0" />
									)}
								</div>

								{expandedAgent === agent._id && (
									<AgentDetail agentId={agent._id} />
								)}
							</div>
						))}
					</div>
				</TabsContent>

				{/* Assign Properties Tab */}
				<TabsContent value="assign" className="space-y-4">
					<div className="bg-white border border-[#e0d8cc] rounded-lg p-4 space-y-4">
						<h3 className="font-semibold text-[#0f1d3a]">
							Step 1: Select Agent
						</h3>
						<Select
							value={assignAgentId ?? ""}
							onValueChange={(v) => setAssignAgentId(v)}
						>
							<SelectTrigger className="w-full h-10 bg-[#fafaf8]">
								<SelectValue placeholder="Choose an agent to assign properties to..." />
							</SelectTrigger>
							<SelectContent>
								{(agentsWithCounts ?? []).map((a: any) => (
									<SelectItem key={a._id} value={a._id}>
										{a.name} ({a.email}) —{" "}
										{a.assignmentCount} assigned
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{assignAgentId && (
						<div className="space-y-4">
							<div className="bg-white border border-[#e0d8cc] rounded-lg p-4 space-y-4">
								<h3 className="font-semibold text-[#0f1d3a]">
									Step 2: Browse & Select Properties
								</h3>
								<p className="text-xs text-gray-500">
									Click the checkbox to assign/unassign.
									Assigned properties are highlighted.
								</p>

								{/* Filters */}
								<div className="flex flex-wrap gap-3">
									<div className="relative flex-1 min-w-[200px]">
										<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
										<Input
											value={assignSearch}
											onChange={(e) =>
												setAssignSearch(e.target.value)
											}
											placeholder="Search properties..."
											className="pl-10 h-9 bg-[#fafaf8]"
										/>
									</div>
									<Select
										value={assignCategory}
										onValueChange={setAssignCategory}
									>
										<SelectTrigger className="w-[180px] h-9 text-sm bg-[#fafaf8]">
											<SelectValue placeholder="Category" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">
												All Categories
											</SelectItem>
											{CATEGORIES.map((cat) => (
												<SelectItem
													key={cat.value}
													value={cat.value}
												>
													{cat.icon} {cat.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Select
										value={assignCountry}
										onValueChange={setAssignCountry}
									>
										<SelectTrigger className="w-[160px] h-9 text-sm bg-[#fafaf8]">
											<SelectValue placeholder="Country" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">
												All Countries
											</SelectItem>
											{(countries ?? []).map((c) => (
												<SelectItem key={c} value={c}>
													{c}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Select
										value={assignType}
										onValueChange={setAssignType}
									>
										<SelectTrigger className="w-[140px] h-9 text-sm bg-[#fafaf8]">
											<SelectValue placeholder="Type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">
												All Types
											</SelectItem>
											{PROPERTY_TYPES.map((t) => (
												<SelectItem
													key={t.value}
													value={t.value}
												>
													{t.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							{/* Property list with assign checkboxes */}
							<div className="space-y-1">
								{displayAssignProperties.map((prop: any) => {
									const isAssigned = assignedSet.has(
										prop._id,
									);
									return (
										<div
											key={prop._id}
											className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all cursor-pointer ${
												isAssigned
													? "bg-emerald-50 border-emerald-300"
													: "bg-white border-[#e0d8cc] hover:border-[#c5972c]"
											}`}
											onClick={() =>
												handleToggleAssignment(prop._id)
											}
										>
											<div
												className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 ${
													isAssigned
														? "bg-emerald-500 border-emerald-500 text-white"
														: "border-gray-300"
												}`}
											>
												{isAssigned && (
													<Check className="size-4" />
												)}
											</div>
											<div className="w-10 h-10 bg-[#0f1d3a] rounded-lg flex items-center justify-center shrink-0">
												<span>
													{getCategoryIcon(
														prop.category,
													)}
												</span>
											</div>
											<div className="flex-1 min-w-0">
												<h4 className="font-semibold text-sm text-[#0f1d3a] truncate">
													{prop.title}
												</h4>
												<div className="flex items-center gap-3 text-xs text-gray-500">
													<span className="flex items-center gap-1">
														<MapPin className="size-3" />
														{prop.city},{" "}
														{prop.country}
													</span>
													{prop.acreage && (
														<span>
															{prop.acreage.toLocaleString()}{" "}
															acres
														</span>
													)}
													{prop.propertyType && (
														<span className="capitalize">
															{prop.propertyType}
														</span>
													)}
												</div>
											</div>
											<span className="text-sm font-bold text-[#c5972c] shrink-0">
												{formatPrice(
													prop.price,
													prop.priceLabel,
													prop.currency,
												)}
											</span>
											<Button
												variant="ghost"
												size="sm"
												className="shrink-0 h-8 w-8 p-0"
												onClick={(e) => {
													e.stopPropagation();
													setShowPropertyDetail(prop);
												}}
											>
												<Eye className="size-4 text-gray-400" />
											</Button>
										</div>
									);
								})}
								{displayAssignProperties.length === 0 && (
									<div className="text-center py-12 text-gray-400">
										No properties match your filters
									</div>
								)}
							</div>
						</div>
					)}
				</TabsContent>

				{/* Pipeline Tab */}
				<TabsContent value="pipeline" className="space-y-4">
					{/* Pipeline Status Breakdown */}
					{pipelineStats && (
						<div className="bg-white border border-[#e0d8cc] rounded-lg p-4">
							<h3 className="text-sm font-semibold text-[#0f1d3a] mb-3">
								Pipeline Status Distribution
							</h3>
							<div className="flex flex-wrap gap-2">
								{PIPELINE_STEPS.map((step) => {
									const count =
										pipelineStats.byStatus?.[step.key] ?? 0;
									return (
										<Badge
											key={step.key}
											className={`${step.color} text-white text-xs px-3 py-1 ${count === 0 ? "opacity-40" : ""}`}
										>
											{step.label}: {count}
										</Badge>
									);
								})}
							</div>
						</div>
					)}

					<div className="flex gap-3 items-center">
						<Filter className="size-4 text-gray-400" />
						<Select
							value={selectedPipelineStatus}
							onValueChange={setSelectedPipelineStatus}
						>
							<SelectTrigger className="w-[220px] h-10 bg-white">
								<SelectValue placeholder="All Pipeline Statuses" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									All Statuses
								</SelectItem>
								{PIPELINE_STEPS.map((s) => (
									<SelectItem key={s.key} value={s.key}>
										{s.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						{(allAssignments ?? []).map((ap: any) => {
							const stepInfo = getStepInfo(ap.pipelineStatus);
							return (
								<div
									key={ap._id}
									className="bg-white border border-[#e0d8cc] rounded-lg p-4 flex items-center gap-4"
								>
									<div
										className={`w-1.5 h-12 rounded-full ${stepInfo.color}`}
									/>
									<div className="w-10 h-10 bg-[#0f1d3a] rounded-lg flex items-center justify-center shrink-0">
										<span>
											{getCategoryIcon(
												ap.property?.category,
											)}
										</span>
									</div>
									<div className="flex-1 min-w-0">
										<h3 className="font-semibold text-sm text-[#0f1d3a] truncate">
											{ap.property?.title ??
												"Loading..."}
										</h3>
										<div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
											<span className="flex items-center gap-1">
												<MapPin className="size-3" />
												{ap.property?.city},{" "}
												{ap.property?.country}
											</span>
											<span>
												Agent:{" "}
												{ap.agent?.name ?? "Unknown"}
											</span>
										</div>
									</div>
									<span className="text-sm font-bold text-[#c5972c] shrink-0">
										{formatPrice(
											ap.property?.price,
											ap.property?.priceLabel,
											ap.property?.currency,
										)}
									</span>
									<Badge
										className={`${stepInfo.color} text-white text-xs shrink-0`}
									>
										{stepInfo.label}
									</Badge>
									<Button
										variant="ghost"
										size="sm"
										className="shrink-0 h-8 w-8 p-0"
										onClick={() =>
											setShowPropertyDetail(ap.property)
										}
									>
										<Eye className="size-4 text-gray-400" />
									</Button>
								</div>
							);
						})}

						{(allAssignments ?? []).length === 0 && (
							<div className="text-center py-16 text-gray-400">
								<BarChart3 className="size-12 mx-auto mb-3 opacity-40" />
								<p>
									No pipeline items found. Assign properties to
									agents to start.
								</p>
							</div>
						)}
					</div>
				</TabsContent>

				{/* All Properties Tab */}
				<TabsContent value="properties" className="space-y-4">
					<div className="flex flex-wrap gap-3">
						<div className="relative flex-1 min-w-[200px]">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
							<Input
								value={adminBrowseSearch}
								onChange={(e) =>
									setAdminBrowseSearch(e.target.value)
								}
								placeholder="Search all properties..."
								className="pl-10 h-9 bg-white border-[#e0d8cc]"
							/>
						</div>
						<Select
							value={adminBrowseCategory}
							onValueChange={setAdminBrowseCategory}
						>
							<SelectTrigger className="w-[180px] h-9 text-sm bg-white">
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									All Categories
								</SelectItem>
								{CATEGORIES.map((cat) => (
									<SelectItem
										key={cat.value}
										value={cat.value}
									>
										{cat.icon} {cat.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select
							value={adminBrowseCountry}
							onValueChange={setAdminBrowseCountry}
						>
							<SelectTrigger className="w-[160px] h-9 text-sm bg-white">
								<SelectValue placeholder="Country" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									All Countries
								</SelectItem>
								{(countries ?? []).map((c) => (
									<SelectItem key={c} value={c}>
										{c}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						{displayAdminProperties.map((prop: any) => (
							<div
								key={prop._id}
								className="bg-white border border-[#e0d8cc] rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
								onClick={() => setShowPropertyDetail(prop)}
							>
								<div className="w-10 h-10 bg-[#0f1d3a] rounded-lg flex items-center justify-center shrink-0">
									<span>
										{getCategoryIcon(prop.category)}
									</span>
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold text-sm text-[#0f1d3a] truncate">
										{prop.title}
									</h3>
									<div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
										<span className="flex items-center gap-1">
											<MapPin className="size-3" />
											{prop.city}, {prop.country}
										</span>
										{prop.acreage && (
											<span>
												{prop.acreage.toLocaleString()}{" "}
												acres
											</span>
										)}
										{prop.brokerName && (
											<span>
												Broker: {prop.brokerName}
											</span>
										)}
									</div>
								</div>
								<Badge
									variant="outline"
									className="text-[10px] shrink-0 capitalize"
								>
									{prop.propertyType}
								</Badge>
								<Badge
									variant="outline"
									className="text-[10px] shrink-0"
								>
									{CATEGORIES.find(
										(c) => c.value === prop.category,
									)?.label?.split(" ")[0]}
								</Badge>
								<span className="text-sm font-bold text-[#c5972c] shrink-0">
									{formatPrice(
										prop.price,
										prop.priceLabel,
										prop.currency,
									)}
								</span>
								<Badge
									className={`text-xs shrink-0 ${
										prop.status === "available"
											? "bg-emerald-500 text-white"
											: prop.status === "pending"
												? "bg-amber-500 text-white"
												: "bg-gray-500 text-white"
									}`}
								>
									{prop.status}
								</Badge>
							</div>
						))}
					</div>
				</TabsContent>
			</Tabs>

			{/* Create Agent Dialog */}
			<CreateAgentDialog
				open={showCreateAgent}
				onClose={() => setShowCreateAgent(false)}
				onCreate={createAgentMut}
			/>

			{/* Property Detail Dialog */}
			<PropertyDetailDialog
				property={showPropertyDetail}
				onClose={() => setShowPropertyDetail(null)}
			/>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────
// SUB: Agent Detail expanded row
// ─────────────────────────────────────────────────────────────
function AgentDetail({ agentId }: { agentId: any }) {
	const agentProperties = useQuery(api.pipeline.getAgentProperties, {
		agentId,
	});
	const updateStatus = useMutation(api.pipeline.updateStatus);

	const getStepInfo = (key: string) =>
		PIPELINE_STEPS.find((s) => s.key === key) ?? {
			key,
			label: key,
			color: "bg-gray-500",
		};

	const getCategoryIcon = (val: string) =>
		CATEGORIES.find((c) => c.value === val)?.icon ?? "📍";

	if (!agentProperties) {
		return (
			<div className="px-4 pb-4 text-sm text-gray-400">Loading...</div>
		);
	}

	if (agentProperties.length === 0) {
		return (
			<div className="px-4 pb-4 text-sm text-gray-400">
				No properties assigned — use the "Assign" button or "Assign
				Properties" tab
			</div>
		);
	}

	return (
		<div className="px-4 pb-4 border-t border-[#e0d8cc] pt-3 space-y-2">
			{agentProperties.map((ap: any) => {
				const stepInfo = getStepInfo(ap.pipelineStatus);
				return (
					<div
						key={ap._id}
						className="flex items-center gap-3 bg-[#fafaf8] rounded-lg p-3"
					>
						<span className="text-lg">
							{getCategoryIcon(ap.property?.category)}
						</span>
						<div className="flex-1 min-w-0">
							<div className="text-sm font-medium text-[#0f1d3a] truncate">
								{ap.property?.title}
							</div>
							<div className="text-xs text-gray-500">
								{ap.property?.city}, {ap.property?.country}
							</div>
						</div>
						<Select
							value={ap.pipelineStatus}
							onValueChange={(val) =>
								updateStatus({
									id: ap._id,
									pipelineStatus: val,
								})
							}
						>
							<SelectTrigger className="h-7 text-[10px] w-[160px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{PIPELINE_STEPS.map((s) => (
									<SelectItem key={s.key} value={s.key}>
										{s.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Badge
							className={`${stepInfo.color} text-white text-[10px]`}
						>
							{stepInfo.label}
						</Badge>
					</div>
				);
			})}
		</div>
	);
}

// ─────────────────────────────────────────────────────────────
// SUB: Create Agent Dialog
// ─────────────────────────────────────────────────────────────
function CreateAgentDialog({
	open,
	onClose,
	onCreate,
}: {
	open: boolean;
	onClose: () => void;
	onCreate: any;
}) {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [company, setCompany] = useState("");
	const [role, setRole] = useState("agent");

	const handleCreate = async () => {
		if (!name || !email) {
			toast.error("Name and email are required");
			return;
		}
		try {
			const accessCode = String(
				100000 + Math.floor(Math.random() * 900000),
			);
			await onCreate({
				name,
				email,
				phone: phone || undefined,
				company: company || undefined,
				accessCode,
				isActive: true,
				role,
				avatarInitials: name.slice(0, 2).toUpperCase(),
			});
			toast.success(`Agent created! Access code: ${accessCode}`);
			setName("");
			setEmail("");
			setPhone("");
			setCompany("");
			onClose();
		} catch {
			toast.error("Failed to create agent");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="text-[#0f1d3a]">
						Create New Agent
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<div>
						<label className="text-xs font-medium text-gray-500 block mb-1">
							Full Name *
						</label>
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="John Doe"
						/>
					</div>
					<div>
						<label className="text-xs font-medium text-gray-500 block mb-1">
							Email *
						</label>
						<Input
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="john@example.com"
						/>
					</div>
					<div>
						<label className="text-xs font-medium text-gray-500 block mb-1">
							Phone
						</label>
						<Input
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							placeholder="+1-555-0100"
						/>
					</div>
					<div>
						<label className="text-xs font-medium text-gray-500 block mb-1">
							Company
						</label>
						<Input
							value={company}
							onChange={(e) => setCompany(e.target.value)}
							placeholder="Kissi Kingdom"
						/>
					</div>
					<div>
						<label className="text-xs font-medium text-gray-500 block mb-1">
							Role
						</label>
						<Select value={role} onValueChange={setRole}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="agent">Agent</SelectItem>
								<SelectItem value="admin">Admin</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<Button
						onClick={handleCreate}
						className="w-full bg-[#c5972c] hover:bg-[#d4a94a] text-white"
					>
						<UserPlus className="size-4 mr-1" /> Create Agent
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// ─────────────────────────────────────────────────────────────
// SUB: Property Detail Dialog — full details
// ─────────────────────────────────────────────────────────────
function PropertyDetailDialog({
	property,
	onClose,
}: {
	property: any;
	onClose: () => void;
}) {
	if (!property) return null;
	const p = property;

	return (
		<Dialog open={!!property} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-[#0f1d3a] text-lg">
						{p.title}
					</DialogTitle>
				</DialogHeader>

				{/* Image / placeholder */}
				<div className="h-48 bg-gradient-to-br from-[#0f1d3a] to-[#162850] rounded-lg flex items-center justify-center">
					<span className="text-7xl opacity-30">
						{CATEGORIES.find((c) => c.value === p.category)?.icon ??
							"🏠"}
					</span>
				</div>

				{/* Key Info Grid */}
				<div className="grid grid-cols-2 gap-4 mt-4">
					<InfoBox
						label="Price"
						value={
							p.priceLabel ||
							(p.price
								? `${p.currency || "USD"} ${p.price.toLocaleString()}`
								: "Contact Broker")
						}
						highlight
					/>
					<InfoBox label="Status" value={p.status} />
					<InfoBox
						label="Location"
						value={`${p.city}, ${p.country}`}
					/>
					{p.address && (
						<InfoBox label="Address" value={p.address} />
					)}
					{p.acreage && (
						<InfoBox
							label="Acreage"
							value={`${p.acreage.toLocaleString()} acres`}
						/>
					)}
					{p.squareFeet && (
						<InfoBox
							label="Square Feet"
							value={`${p.squareFeet.toLocaleString()} sq ft`}
						/>
					)}
					<InfoBox
						label="Category"
						value={
							CATEGORIES.find((c) => c.value === p.category)
								?.label ?? p.category
						}
					/>
					<InfoBox
						label="Property Type"
						value={p.propertyType}
						capitalize
					/>
					{p.subcategory && (
						<InfoBox label="Subcategory" value={p.subcategory} />
					)}
					<InfoBox
						label="Verified"
						value={p.isVerified ? "✅ Yes" : "❌ No"}
					/>
				</div>

				{/* Description */}
				<div className="mt-4">
					<h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
						Description
					</h4>
					<p className="text-sm text-gray-700 leading-relaxed">
						{p.description}
					</p>
				</div>

				{/* Broker Info */}
				{(p.brokerName || p.brokerEmail || p.brokerPhone) && (
					<div className="mt-4 bg-[#fafaf8] border border-[#e0d8cc] rounded-lg p-4">
						<h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
							Broker Contact
						</h4>
						<div className="space-y-2">
							{p.brokerName && (
								<div className="flex items-center gap-2 text-sm">
									<Users className="size-4 text-[#c5972c]" />
									<span className="font-medium">
										{p.brokerName}
									</span>
								</div>
							)}
							{p.brokerCompany && (
								<div className="flex items-center gap-2 text-sm text-gray-600">
									<Building className="size-4 text-gray-400" />
									{p.brokerCompany}
								</div>
							)}
							{p.brokerEmail && (
								<div className="flex items-center gap-2 text-sm">
									<Mail className="size-4 text-gray-400" />
									<a
										href={`mailto:${p.brokerEmail}`}
										className="text-[#c5972c] hover:underline"
									>
										{p.brokerEmail}
									</a>
								</div>
							)}
							{p.brokerPhone && (
								<div className="flex items-center gap-2 text-sm">
									<Phone className="size-4 text-gray-400" />
									<a
										href={`tel:${p.brokerPhone}`}
										className="text-[#c5972c] hover:underline"
									>
										{p.brokerPhone}
									</a>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Listing Link */}
				{p.listingUrl && (
					<a
						href={p.listingUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="mt-4 flex items-center justify-center gap-2 bg-[#0f1d3a] text-white rounded-lg py-3 hover:bg-[#1a2d5a] transition-colors"
					>
						<ExternalLink className="size-4" /> View Original
						Listing
					</a>
				)}
			</DialogContent>
		</Dialog>
	);
}

function InfoBox({
	label,
	value,
	highlight,
	capitalize: cap,
}: {
	label: string;
	value: string;
	highlight?: boolean;
	capitalize?: boolean;
}) {
	return (
		<div className="bg-[#fafaf8] rounded-lg p-3">
			<div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
				{label}
			</div>
			<div
				className={`text-sm font-medium mt-0.5 ${highlight ? "text-[#c5972c] text-lg font-bold" : "text-[#0f1d3a]"} ${cap ? "capitalize" : ""}`}
			>
				{value}
			</div>
		</div>
	);
}
