import Link from 'next/link';

export function Navbar(): JSX.Element {
    return (
      <nav className="flex justify-between bg-gray-900 text-white w-screen shadow-lg">
        <div className="px-5 xl:px-12 py-6 flex w-full items-center justify-center">
          <Link href="/" className="text-3xl font-bold font-heading text-uiucorange absolute left-5">
            UIUC Dining Buddy
          </Link>
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
              <Link href="/" className="hover:text-uiucorange">
                Dining Halls
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    );
}