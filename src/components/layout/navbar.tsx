import { useState, useEffect } from "react";
import Link from "next/link";

export function Navbar(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        document.body.style.paddingTop = "64px"; // Adjust this value to match the height of your navbar
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
      } fixed bg-uiucblue text-white w-full shadow-lg z-10`}
    >
      <div className="px-5 xl:px-12 py-6 flex w-full items-center justify-center">
        <Link
          href="/"
          className="text-3xl font-bold font-heading text-uiucorange absolute left-5"
        >
          UIUC Dining Buddy
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
              className={`fixed top-16 right-0 h-full bg-gray-900 text-white shadow-lg w-64 transition-transform duration-500 ease-out ${
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
                  href="/"
                  className="mt-4 text-white hover:uiucorange"
                  onClick={closeMenu}
                >
                  My Favorites
                </Link>
                <Link
                  href="/dininghalls"
                  className="mt-4 text-white hover:uiucorange"
                  onClick={closeMenu}
                >
                  Dining Halls
                </Link>
              </div>
            </div>
          </>
        ) : (
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
              <Link href="/" className="hover:text-uiucorange">
                My Favorites
              </Link>
            </li>
            <li>
              <Link href="/dininghalls" className="hover:text-uiucorange">
                Dining Halls
              </Link>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}
