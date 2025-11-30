import React from "react";
import { ResponsiveButton } from "../components";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitch from "../components/LanguageSwitch";
import "../styles/HomePage.css";

// Props type definition
type HomePageProps = {
    switchPage: (page: "home_page" | "main_page") => void;
};

const HomePage: React.FC<HomePageProps> = ({ switchPage }) => {
    const { t } = useLanguage();

    return (
        <div className="home-page">
            <div className="home-content">
                <h1 className="home-title">{t('home.welcome')}</h1>
                <p className="home-subtitle">{t('home.subtitle')}</p>
                <div className="home-switch-row">
                    <LanguageSwitch />
                </div>
                <div className="home-start-row">
                    <ResponsiveButton onClick={() => switchPage("main_page")} value={t('home.start')} />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
