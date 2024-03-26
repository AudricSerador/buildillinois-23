import { useState, useEffect } from "react";
import { useAuth } from "@/auth/auth.service";
import Link from "next/link";

export function Navbar(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { user, signOut } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        document.body.style.paddingTop = "64px";
      } else {
        document.body.style.paddingTop = "0px";
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return (
    <nav
      className={`${
        isMobile ? "fixed top-0" : ""
      } fixed bg-uiucblue text-white w-full z-10`}
    >
      <div className="px-5 xl:px-12 py-6 flex w-full items-center shadow-xl justify-center">
        <Link
          href="/"
          className="text-3xl font-bold font-heading text-uiucorange absolute left-5"
        >
          IllinEats
        </Link>
        {isMobile ? (
          <>
            <button onClick={toggleMenu} className="ml-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div
              className={`fixed top-16 right-0 h-full bg-gray-900 text-white w-64 transition-transform duration-500 ease-out ${
                isOpen
                  ? "transform translate-x-0"
                  : "transform translate-x-full"
              }`}
            >
              <div className="font-custombold flex flex-col px-5 xl:px-12 py-3">
                <Link
                  href="/"
                  className="mt-4 text-white hover:uiucorange"
                  onClick={closeMenu}
                >
                  Home
                </Link>
                <Link
                  href="/allfood"
                  className="mt-4 text-white hover:uiucorange"
                  onClick={closeMenu}
                >
                  All Food
                </Link>
                <Link
                  href="/dininghalls"
                  className="mt-4 text-white hover:uiucorange"
                  onClick={closeMenu}
                >
                  Dining Halls
                </Link>
                <Link
                  href="/"
                  className="mt-4 text-white hover:uiucorange"
                  onClick={closeMenu}
                >
                  My Favorites
                </Link>

                {user ? (
                  <div className="mt-4">
                    <p>{user.name}</p>
                    <p>{user.email}</p>
                    <button onClick={signOut}>Sign Out</button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="mt-4 text-white hover:uiucorange"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <ul className="hidden md:flex px-4 mx-auto font-semibold font-heading space-x-12">
              <li>
                <Link href="/" className="hover:text-uiucorange">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/allfood" className="hover:text-uiucorange">
                  All Food
                </Link>
              </li>
              <li>
                <Link href="/user/favorites" className="hover:text-uiucorange">
                  My Favorites
                </Link>
              </li>
              <li>
                <Link href="/dininghalls" className="hover:text-uiucorange">
                  Dining Halls
                </Link>
              </li>
            </ul>
            {user ? (
              <div className="block font-custombold text-lg -my-1.5">
                <button
                  className="flex items-center space-x-2"
                  onClick={toggleDropdown}
                >
                  <span>{user.name}</span>
                  <img
                    className="w-8 h-8 rounded-full"
                    src="https://cdn-icons-png.freepik.com/512/7022/7022927.png"
                    alt="user photo"
                  />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-7 w-48 mr-8 bg-white rounded-md overflow-hidden shadow-xl">
                    <div className="px-4 py-3 -my-2">
                      <span className="block text-sm text-gray-900">
                        {user.name}
                      </span>
                      <span className="block text-sm text-gray-500 truncate">
                        {user.email}
                      </span>
                    </div>
                    <div className="h-0.5 bg-clouddark mx-2"></div>

                    <ul>
                      <li>
                        <Link
                          href="/user/dashboard"
                          onClick={closeMenu}
                          className="block px-4 py-2 w-full text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          onClick={closeMenu}
                          className="block px-4 py-2 w-full text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Settings
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/user/dashboard"
                          onClick={closeMenu}
                          className="block px-4 py-2 w-full text-left text-sm text-gray-700 hover:bg-red-100"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="#"
                          className="block px-4 py-2 w-full text-left text-sm text-gray-700 hover:bg-red-100"
                        >
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            closeMenu();
                            signOut();
                          }}
                          className="block px-4 py-2 w-full text-left text-sm text-gray-700 hover:bg-red-100"
                        >
                          Sign Out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                onClick={closeMenu}
                className="bg-uiucorange text-lg font-custombold text-white rounded-lg px-6 py-1.5 -my-1.5 hover:text-white"
              >
                Login
              </Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
