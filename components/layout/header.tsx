'use client'
import { useEffect, useState } from 'react'
import { ShoppingCart, Menu, X } from 'lucide-react'
import AnimatedButton from '../ui/animatedButton'
import MenuItems from './menuItems'
import SearchBar from '../ui/searchBar'
import SearchModal from '../ui/searchModal'
import { cn } from '@/lib/utils'

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const closeSearch = () => setSearchOpen(false);

  // openSearch will open the modal and, if the mobile sidebar is open,
  // animate it closed first so the modal is not confined/blocked.
  const openSearch = () => {
    // animate-close sidebar if open
    if (mobileOpen) {
      setShowSidebar(false);
      // allow the same transition timeout used for closing the sidebar
      setTimeout(() => setMobileOpen(false), TRANSITION_MS);
      // open the search modal slightly after the sidebar starts closing for smoothness
      setTimeout(() => setSearchOpen(true), 80);
      return;
    }
    setSearchOpen(true);
  };

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
    const handleScroll = () => {
      // Check if scrolled past half the viewport height
        if (window.scrollY > window.innerHeight * 0.01) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

	const [mobileOpen, setMobileOpen] = useState(false);
	const [showSidebar, setShowSidebar] = useState(false);
	const TRANSITION_MS = 500;

	// open handler: mount then animate in
	const openMobileMenu = () => {
		setMobileOpen(true);
		// allow next tick to mount then animate
		setTimeout(() => setShowSidebar(true), 10);
	};

	// close handler: animate out then unmount
	const closeMobileMenu = () => {
		setShowSidebar(false);
		setTimeout(() => setMobileOpen(false), TRANSITION_MS);
	};

    return (
        <header className={cn(`fixed top-0 left-0 z-50 w-full transition-all duration-300 ease-in-out text-black py-2 bg-background`)}>
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-around md:justify-between">

                    <div className="md:flex md:items-center md:gap-12">
                        <a className="block font-bold traching-wider capitalize text-xl" href="#">
                            <span className="sr-only">Home</span>
                            <h2>Paperly</h2>
                        </a>
                    </div>

					{/* Desktop menu */}
                    <MenuItems/>


					{/* Right controls on md+ */}
                    <div className="hidden md:flex sm:gap-4 items-center max-md:grow max-md:justify-end max-md:gap-2 max-md:pr-2">
                        <SearchBar onOpen={openSearch}/>
                        <ShoppingCart size={22} strokeWidth={2} className='cursor-pointer mr-2'/>
                        <a className="
                            rounded-sm px-3 py-1.5 text-md font-medium 
                            shadow-sm bg-secondary text-white 
                            transition-all duration-300 
                            hover:shadow-md
                            "
                            href="#">
                            Login
                        </a>

                        <AnimatedButton>Sign Up</AnimatedButton>

                    </div>

					{/* Hamburger for small screens */}
					<div className="min-[900px]:hidden flex items-center gap-2">
						<button
							aria-label="Open menu"
							className="p-2 rounded-md hover:bg-gray-100"
							onClick={() => openMobileMenu()}
						>
							<Menu size={22} />
						</button>
					</div>

                </div>
            </div>

			{/* Mobile slide-in sidebar + backdrop */}
			{mobileOpen && (
				<>
					{/* backdrop: fade in/out */}
					<div
						className={`fixed inset-0 z-40 bg-black/40 transition-opacity ease-out duration-${TRANSITION_MS} ${showSidebar ? 'opacity-100' : 'opacity-0'}`}
						onClick={() => closeMobileMenu()}
						aria-hidden="true"
					/>

					{/* sidebar panel: slide from right */}
					<aside
						className={`fixed inset-y-0 right-0 z-50 max-w-full bg-white shadow-lg text-earthy-brown space-y-4 transform transition-transform duration-${TRANSITION_MS} ${showSidebar ? 'translate-x-0' : 'translate-x-full'} w-full min-[515px]:w-2/4 lg:w-96 xl:w-80`}
						role="dialog"
						aria-modal="true"
					>
						<div className="flex items-center justify-between p-4">
							<div className="font-bold text-lg">Menu</div>
							<button
								aria-label="Close menu"
								className="p-2 rounded-md hover:bg-gray-100"
								onClick={() => closeMobileMenu()}
							>
								<X size={20} />
							</button>
						</div>

						<div className="flex justify-around">
							<SearchBar mobile onOpen={openSearch}/>
							<button
									className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-50"
									onClick={() => closeMobileMenu()}
								>
									<ShoppingCart size={18} /> View Cart
								</button>
						</div>

						<div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-64px)]">
							{/* mobile search (uses same header-controlled modal) */}

							{/* vertical nav */}
							<MenuItems vertical />

							{/* auth + cart */}
							<div className="pt-4 border-t flex flex-col gap-3">
								
								<a
									className="rounded-md px-4 py-2 text-center bg-transparent hover:bg-gray-50"
									href="#"
									onClick={() => closeMobileMenu()}
								>
									Login
								</a>
								<AnimatedButton>
									<span onClick={() => closeMobileMenu()}>Sign Up</span>
								</AnimatedButton>
							</div>
						</div>
					</aside>
				</>
			)}

            {/* Render SearchModal at header level so it's fixed to viewport (not inside sidebar) */}
            <SearchModal isOpen={searchOpen} onClose={closeSearch} />
             </header>)
}
 
export default Header