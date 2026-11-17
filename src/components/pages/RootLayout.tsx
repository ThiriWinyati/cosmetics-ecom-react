import {Outlet} from "react-router";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import FaqAssistant from "@/components/support/FaqAssistant";

function RootLayout() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            <FaqAssistant />
        </div>
    );
}

export default RootLayout;
