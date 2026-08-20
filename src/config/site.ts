export const siteConfig = {
    name: "Charm & Grace",
    description: "A modern cosmetics e-commerce website built with React",

    mainNav: [
        {
            title: "Products",

            card: [
                {
                    title: "Makeup",
                    href: "/products",
                    description: "Explore complexion, eye and lip essentials for every look.",
                },
                {
                    title: "Accessories",
                    href: "/products?category=brows",
                    description: "Discover tools and finishing touches for your beauty routine.",
                },
                {
                    title: "Vegan",
                    href: "/products?collection=vegan",
                    description: "Shop thoughtful formulas made without animal-derived ingredients.",
                },
                {
                    title: "Lipsticks",
                    href: "/products?category=lips",
                    description: "Find glossy, satin and matte lip colours for every mood.",
                },
            ],

            menu: [
                {
                    title: "Contact",
                    href: "/contact",
                },
                {
                    title: "FAQs",
                    href: "/faq",
                },
                {
                    title: "Blog",
                    href: "/blogs",
                },
                {
                    title: "About",
                    href: "/about",
                },
            ],
        },
    ],
};
