import { createBrowserRouter } from "react-router";
import RootLayout from "@/components/pages/RootLayout";
import Home from "@/components/pages/Home";
import About from "@/components/pages/About";
import ProductRootLayout from "@/components/pages/Products/ProductRootLayout";
import Product from "@/components/pages/Products/Product";
import ProductDetail from "@/components/pages/Products/ProductDetail";
import { Contact, InfoPage } from "@/components/pages/InfoPage";
import { AuthPage, CartPage, Checkout, CustomerOrders, Profile } from "@/components/pages/AccountPages";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminResource from "@/components/admin/AdminResource";
import ProductForm from "@/components/admin/ProductForm";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminChat from "@/components/admin/AdminChat";
import AdminMessages from "@/components/admin/AdminMessages";
import EditorsPicks from "@/components/pages/EditorsPicks";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: About },
      { path: "editors-picks", Component: EditorsPicks },
      { path: "products", Component: ProductRootLayout, children: [{ index: true, Component: Product }, { path: ":productId", Component: ProductDetail }] },
      { path: "services", element: <InfoPage type="shipping" /> },
      { path: "blogs", element: <InfoPage type="faq" /> },
      { path: "faq", element: <InfoPage type="faq" /> },
      { path: "contact", Component: Contact },
      { path: "shipping-returns", element: <InfoPage type="shipping" /> },
      { path: "privacy", element: <InfoPage type="privacy" /> },
      { path: "terms", element: <InfoPage type="terms" /> },
      { path: "login", element: <AuthPage mode="login" /> },
      { path: "signup", element: <AuthPage mode="signup" /> },
      { path: "forgot-password", element: <AuthPage mode="forgot" /> },
      { path: "profile", Component: Profile },
      { path: "orders", Component: CustomerOrders },
      { path: "cart", Component: CartPage },
      { path: "wishlist", element: <CartPage wishlist /> },
      { path: "checkout", Component: Checkout },
    ],
  },
  { path: "/admin/login", Component: AdminLogin },
  { path: "/admin", Component: AdminLayout, children: [{ index: true, Component: AdminDashboard }, { path: "products/new", Component: ProductForm }, { path: "products/:productId/edit", Component: ProductForm }, { path: "messages", Component: AdminMessages }, { path: "chat", Component: AdminChat }, { path: ":resource", Component: AdminResource }] },
]);
