import MainNavigation from "@/components/layouts/MainNavigation.tsx";
import {siteConfig} from "@/config/site.ts";

function Header() {
  return (
    <header>
      <MainNavigation items={siteConfig.mainNav}/>
    </header>
  );
}

export default Header;