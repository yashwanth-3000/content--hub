"use client";

import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import menuData from "./menuData";

const Header = () => {
  const { data: session } = useSession();
  const pathUrl = usePathname();

  // Navbar toggle for mobile
  const [navbarOpen, setNavbarOpen] = useState(false);
  const toggleNavbar = () => setNavbarOpen((prev) => !prev);

  // Sticky Navbar state
  const [sticky, setSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY >= 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Submenu handler for desktop/mobile
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const handleSubmenu = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const { theme, setTheme } = useTheme();

  return (
    <header
      className={`fixed top-0 left-0 z-50 w-full transition-colors duration-300 ${
        sticky ? "bg-[#111827] shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo (Text-Only) */}
          <div className="flex-shrink-0">
            <Link href="/">
              <h1
                className="text-3xl font-bold bg-gradient-to-r from-[#67e8f9] to-[#22d3ee] 
                bg-clip-text text-transparent"
              >
                Content Hub
              </h1>
            </Link>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex space-x-8">
            {menuData.map((menuItem, index) => (
              <div key={index} className="relative group">
                {menuItem.path ? (
                  <Link
                    href={menuItem.path}
                    className={`text-lg font-medium transition-colors duration-300 ${
                      pathUrl === menuItem.path
                        ? "text-[#67e8f9]"
                        : "text-white hover:text-[#67e8f9]"
                    }`}
                  >
                    {menuItem.title}
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => handleSubmenu(index)}
                      className="flex items-center text-lg font-medium text-white hover:text-[#67e8f9] transition-colors duration-300"
                    >
                      {menuItem.title}
                      <svg
                        className="ml-1 h-5 w-5 transition-transform duration-300 group-hover:rotate-180"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M8 11l-4-4h8l-4 4z" />
                      </svg>
                    </button>
                    {menuItem.submenu && (
                      <div
                        className={`absolute left-0 mt-2 w-40 rounded bg-[#1f2937] p-2 shadow-lg transition-opacity duration-300 ${
                          openIndex === index ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                      >
                        {menuItem.submenu.map((submenuItem: any, i: number) => (
                          <Link
                            key={i}
                            href={submenuItem.path}
                            className={`block rounded px-4 py-2 text-sm transition-colors duration-300 ${
                              pathUrl === submenuItem.path
                                ? "text-[#67e8f9]"
                                : "text-gray-300 hover:text-[#67e8f9]"
                            }`}
                          >
                            {submenuItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle Theme"
              className="text-white hover:text-[#67e8f9] transition-colors duration-300"
            >
              {theme === "dark" ? (
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 15V5h2v10H9z" />
                </svg>
              ) : (
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 110 16 8 8 0 010-16zM9 15V5h2v10H9z" />
                </svg>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleNavbar}
              className="lg:hidden text-white hover:text-[#67e8f9] focus:outline-none"
              aria-label="Toggle Menu"
            >
              {navbarOpen ? (
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 
                    1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 
                    1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 
                    4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 
                    6h14a1 1 0 010 2H3a1 1 0 010-2z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {navbarOpen && (
          <nav className="lg:hidden mt-4">
            <ul className="flex flex-col space-y-4">
              {menuData.map((menuItem, index) => (
                <li key={index} className="relative">
                  {menuItem.path ? (
                    <Link
                      onClick={() => setNavbarOpen(false)}
                      href={menuItem.path}
                      className={`block text-lg font-medium transition-colors duration-300 ${
                        pathUrl === menuItem.path
                          ? "text-[#67e8f9]"
                          : "text-white hover:text-[#67e8f9]"
                      }`}
                    >
                      {menuItem.title}
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSubmenu(index)}
                        className="flex w-full items-center justify-between text-lg font-medium text-white hover:text-[#67e8f9] transition-colors duration-300"
                      >
                        {menuItem.title}
                        <svg
                          className="ml-1 h-5 w-5 transition-transform duration-300"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M8 11l-4-4h8l-4 4z" />
                        </svg>
                      </button>
                      {menuItem.submenu && openIndex === index && (
                        <div className="mt-2 pl-4">
                          {menuItem.submenu.map((submenuItem: any, i: number) => (
                            <Link
                              key={i}
                              onClick={() => setNavbarOpen(false)}
                              href={submenuItem.path}
                              className={`block text-lg font-medium transition-colors duration-300 ${
                                pathUrl === submenuItem.path
                                  ? "text-[#67e8f9]"
                                  : "text-gray-300 hover:text-[#67e8f9]"
                              }`}
                            >
                              {submenuItem.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
