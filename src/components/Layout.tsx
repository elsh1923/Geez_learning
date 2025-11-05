// src/components/Layout.tsx
import React, { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* No padding at any breakpoint; sections manage their own spacing */}
      <main className="flex-1 p-0">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
