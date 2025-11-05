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
      {/* Mobile-only horizontal margin; none on larger screens */}
      <main className="flex-1 mx-4 sm:mx-0 p-0">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
