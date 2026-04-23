import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicLayout } from "./components/PublicLayout";
import { PublicOnlyRoute } from "./components/PublicOnlyRoute";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import {
	DashboardPage,
	LandingPage,
	LoginPage,
	SettingsPage,
	SignupPage,
	OurWhyPage,
	BrokerPortalPage,
	BrowsePage,
	AdminPage,
	ContactPage,
} from "./pages";

function App() {
	return (
		<ErrorBoundary>
			<ThemeProvider defaultTheme="light" switchable>
				<Toaster />
				<Routes>
					{/* Public pages - Kissi Kingdom site */}
					<Route element={<PublicLayout />}>
						<Route path="/" element={<LandingPage />} />
						<Route path="/our-why" element={<OurWhyPage />} />
						<Route path="/broker-portal" element={<BrokerPortalPage />} />
						<Route path="/contact" element={<ContactPage />} />
						<Route element={<PublicOnlyRoute />}>
							<Route path="/login" element={<LoginPage />} />
							<Route path="/signup" element={<SignupPage />} />
						</Route>
					</Route>

					{/* Broker portal pages - session-based auth (own layouts) */}
					<Route path="/browse" element={<BrowsePage />} />
					<Route path="/dashboard" element={<DashboardPage />} />
					<Route path="/admin" element={<AdminPage />} />

					{/* Authenticated pages - Convex Auth */}
					<Route element={<ProtectedRoute />}>
						<Route element={<AppLayout />}>
							<Route path="/settings" element={<SettingsPage />} />
						</Route>
					</Route>

					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</ThemeProvider>
		</ErrorBoundary>
	);
}

export default App;
