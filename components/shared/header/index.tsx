import { App_NAME } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import Menu from "./menu";
import Search from "./search";
import data from "@/lib/data";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";

export default function Header() {
    return (
        <header className="bg-black text-white">
            <div className="px-2">
                <div className="flex items-center justify-between py-3 px-5">
                    <div className="flex items-center">
                        <Link 
                            href="/"
                            className="flex items-center header-button font-extrabold text-2xl m-1"
                            >
                                {App_NAME}
                        </Link>
                    </div>
                    <div className="hidden md:block flex-1 max-w-xl"><Search /></div>
                    <Menu />
                </div>
                <div className="md:hidden block py-2"><Search /></div>
            </div>
            <div className="flex justify-center items-center px-3 mb-px bg-secondary sticky">
                <div className="flex items-center flex-wrap gap-3 overflow-hidden max-h-[42px]">
                    {data.headerMenus.map((menu) => (
                        <Link
                            key={menu.href}
                            href={menu.href}
                            className="header-button animate-underline p-2!"
                        >
                            {menu.name}
                        </Link>
                    ))}
                </div>
            </div>
        </header>
    );
}