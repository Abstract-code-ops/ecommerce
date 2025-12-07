import React from "react";

type Product = {
	id: string;
	title: string;
	image: string;
	href?: string;
};

const products: Product[] = [
	{
		id: "p1",
		title: "Paper Bags",
		image: "/freepik__the-style-is-candid-image-photography-with-natural__63769.png",
		href: "#",
	},
	{
		id: "p2",
		title: "Gift Boxes",
		image: "/composition-wrapped-gifts-cement-background.jpg",
		href: "#",
	},
	{
		id: "p3",
		title: "Bubble Wraps",
		image: "/person-organising-live-shop.jpg",
		href: "#",
	},
];

export default function FeaturedProducts() {
	return (
		<section className="p-6 mt-20 max-w-7xl mx-auto" aria-label="Featured products">
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-tangerine font-medium mb-10 text-center">Browse by category</h2>
			<div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-6">
				{products.map((p) => (
					// wrapper centers each tile
					<div key={p.id} className="flex justify-center">
						<a href={p.href} className="group" aria-label={p.title}>
							{/* circular tile */}
							<div className="relative w-75 h-75 md:w-95 md:h-95 rounded-full overflow-hidden">
								{/* image layer - grayscaled and scales on group hover */}
								<div
									className="absolute inset-0 rounded-full bg-center bg-cover transform transition-all duration-300 filter grayscale group-hover:grayscale-0 group-hover:scale-105"
									style={{ backgroundImage: `url(${p.image})` }}
									role="img"
									aria-hidden="true"
								/>

								{/* subtle gradient for better text contrast */}
								<div className="absolute inset-0 rounded-full bg-linear-to-t from-black/40 to-transparent pointer-events-none" />

								{/* title at bottom (not affected by grayscale) */}
								<div className="absolute bottom-10 left-0 right-0 z-10 text-center px-3">
									<h3 className="text-white text-sm md:text-lg font-bold drop-shadow-sm">{p.title}</h3>
								</div>
							</div>
						</a>
					</div>
				))}
			</div>
		</section>
	);
}
