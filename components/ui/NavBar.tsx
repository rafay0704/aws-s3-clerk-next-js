import React from "react";
import { UserButton } from "@clerk/nextjs";

const NavBar = () => {
  return (
    <nav className="px-8 py-4 flex justify-between items-center shadow-md bg-white">
      {/* Logo / App Name */}
      <div className="text-2xl font-bold text-blue-600">
        AWS S3 App
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-6">
        <a
          href="/home"
          className="px-3 py-2 text-gray-700 font-medium rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
        >
          Home
        </a>
        <a
          href="#about"
          className="px-3 py-2 text-gray-700 font-medium rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
        >
          About
        </a>
        <a
          href="#contact"
          className="px-3 py-2 text-gray-700 font-medium rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
        >
          Contact
        </a>
      </div>

      {/* Clerk User Button */}
      <div>
        <UserButton afterSignOutUrl="/" />
      </div>
    </nav>
  );
};

export default NavBar;
