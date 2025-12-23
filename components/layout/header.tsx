'use client'
import React from 'react'
import Link from 'next/link'
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react'
import AnimatedButton from '../ui/animatedButton'
import MenuItems from './menuItems'
import SearchBar from '../ui/searchBar'
import SearchModal from '../ui/searchModal'
import { cn } from '@/lib/utils'
import { useHeaderLogic } from '../shared/header'

const Header = () => {
	const {
		searchOpen,
		setSearchOpen,
		closeSearch,
		openSearch,
		isScrolled,
		mobileOpen,
		openMobileMenu,
		closeMobileMenu,
		showSidebar,
		setShowSidebar,
		TRANSITION_MS,
		user,
		signOut,
		isLoading,
	} = useHeaderLogic();
	console.log('Header user:', user);
	console.log('Header isLoading:', isLoading);
	console.log(signOut);

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
                        <Link href="/cart">
                            <ShoppingCart size={22} strokeWidth={2} className='cursor-pointer mr-2'/>
                        </Link>
                        
                        {user ? (
                            <div className="flex items-center gap-2">
                                <Link 
                                    href="/profile"
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
                                >
                                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                                        {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="text-sm font-medium hidden lg:block max-w-[100px] truncate">
                                        {user.user_metadata?.full_name || 'Profile'}
                                    </span>
                                </Link>
                                <button 
                                    onClick={() => signOut()}
                                    className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                    title="Sign out"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link className="
                                    rounded-sm px-3 py-1.5 text-md font-medium 
                                    shadow-sm bg-secondary text-white 
                                    transition-all duration-300 
                                    hover:shadow-md
                                    "
                                    href="/sign-in">
                                    Login
                                </Link>
                                <Link href="/sign-up">
                                    <AnimatedButton>Sign Up</AnimatedButton>
                                </Link>
                            </>
                        )}
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
							<Link
								href="/cart"
								className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-50"
								onClick={() => closeMobileMenu()}
							>
								<ShoppingCart size={18} /> View Cart
							</Link>
						</div>

						<div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-64px)]">
							{/* mobile search (uses same header-controlled modal) */}

							{/* vertical nav */}
							<MenuItems vertical />

							{/* auth + cart */}
							<div className="pt-4 border-t flex flex-col gap-3">
								{user ? (
									<>
										<Link
											href="/profile"
											className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-50"
											onClick={() => closeMobileMenu()}
										>
											<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
												{user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-medium truncate">
													{user.user_metadata?.full_name || 'Profile'}
												</p>
												<p className="text-xs text-muted-foreground truncate">{user.email}</p>
											</div>
										</Link>
										<button
											className="flex items-center justify-center gap-2 rounded-md px-4 py-2 text-red-600 hover:bg-red-50"
											onClick={() => {
												signOut();
												closeMobileMenu();
											}}
										>
											<LogOut size={18} /> Sign Out
										</button>
									</>
								) : (
									<>
										<Link
											className="rounded-md px-4 py-2 text-center bg-transparent hover:bg-gray-50"
											href="/sign-in"
											onClick={() => closeMobileMenu()}
										>
											Login
										</Link>
										<Link href="/sign-up" onClick={() => closeMobileMenu()}>
											<AnimatedButton>Sign Up</AnimatedButton>
										</Link>
									</>
								)}
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