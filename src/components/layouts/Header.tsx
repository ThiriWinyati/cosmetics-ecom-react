import MainNavigation from "@/components/layouts/MainNavigation.tsx";
import {siteConfig} from "@/config/site.ts";

function Header() {
  return (
    <header className="sticky top-0 z-50">
      <MainNavigation items={siteConfig.mainNav}/>
    </header>
  );
}

export default Header;
