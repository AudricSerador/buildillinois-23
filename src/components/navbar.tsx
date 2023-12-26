export function Navbar(): JSX.Element {
    return (
      <nav className="flex justify-between bg-gray-900 text-white w-screen shadow-lg">
        <div className="px-5 xl:px-12 py-6 flex w-full items-center justify-center">
          <a className="text-3xl font-bold font-heading text-uiucorange absolute left-5" href="/">
            {/* <img class="h-9" src="logo.png" alt="logo"> */}
            UIUC Dining Buddy
          </a>
          <ul className="hidden md:flex px-4 mx-auto font-semibold font-heading space-x-12">
            <li>
              <a className="hover:text-uiucorange" href="/">
                Home
              </a>
            </li>
            <li>
              <a className="hover:text-uiucorange" href="/allfood">
                All Food
              </a>
            </li>
            <li>
              <a className="hover:text-uiucorange" href="#">
                My Favorites
              </a>
            </li>
            <li>
              <a className="hover:text-uiucorange" href="#">
                Dining Halls
              </a>
            </li>
          </ul>
        </div>
      </nav>
    );
}