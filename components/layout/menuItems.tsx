import React from 'react'

type Props = {
	vertical?: boolean
  flip?: boolean
}

const MenuItems = ({ vertical = false, flip = false }: Props) => {
  return (
    <div className={vertical ? "block" : "block max-[900px]:hidden"}>
        <nav aria-label="Global">
        <ul className={vertical ? "flex flex-col space-y-20 text-base" : "flex items-center space-x-10 text-sm"}>
            <li className={`${flip ? 'rotate-90': ''}`}>
            <a className={`text-md animate-underline`} href="#"> Categories </a>
            </li>

            <li className={`${flip ? 'rotate-90': ''}`}>
            <a className={`text-md animate-underline`} href="#"> Deals </a>
            </li>

            <li className={`${flip ? 'rotate-90': ''}`}>
            <a className={`text-md animate-underline`} href="#"> Contact </a>
            </li>

            <li className={`${flip ? 'rotate-90': ''}`}>
            <a className={`text-md animate-underline`} href="#"> About Us </a>
            </li>
        </ul>
        </nav>
    </div>
  )
}

export default MenuItems