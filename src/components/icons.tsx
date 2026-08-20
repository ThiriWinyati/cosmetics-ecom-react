import {
    HomeIcon,
    HamburgerMenuIcon,
    HeartIcon,
    StarIcon,
    PlusIcon,
    MinusIcon,
} from "@radix-ui/react-icons";

import * as React from "react";

export type IconProps = React.HTMLAttributes<SVGElement>;

export const Icons = {
    logo: (props: IconProps) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="size-6"
            {...props}
        >
            <circle cx="12" cy="12" r="9" />
            <path d="M9 12h6" />
            <path d="M12 9v6" />
        </svg>
    ),

    home: HomeIcon,
    menu: HamburgerMenuIcon,
    heart: HeartIcon,
    star: StarIcon,
    plus: PlusIcon,
    minus: MinusIcon,
};