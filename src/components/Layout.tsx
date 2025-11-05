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
      {/* Responsive padding to give space from edges without altering backgrounds */}
      <main className="flex-1 px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
