import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import CreateAccount from "./pages/CreateAccount";
import MerchantSetup from "./pages/MerchantSetup";
import MerchantProfile from "./pages/MerchantProfile";
import ViewUsers from "./pages/ViewUsers";
import ViewMerchants from "./pages/ViewMerchants";
import ViewTransactions from "./pages/ViewTransactions";
import MakePayment from "./pages/MakePayment";
import UserProfile from "./pages/UserProfile";
import TransactionHistory from "./pages/TransactionHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/merchant-setup" element={<MerchantSetup />} />
          <Route path="/merchant-profile" element={<MerchantProfile />} />
          <Route path="/view-users" element={<ViewUsers />} />
          <Route path="/view-merchants" element={<ViewMerchants />} />
          <Route path="/view-transactions" element={<ViewTransactions />} />
          <Route path="/make-payment" element={<MakePayment />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/transaction-history" element={<TransactionHistory />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
