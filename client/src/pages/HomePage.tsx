import React from "react";
import { StyledButton } from "../components";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitch from "../components/LanguageSwitch";
import { useNavigation } from "../contexts/PageContext";
import "../styles/HomePage.css";

type HomePageProps = {

};

const HomePage: React.FC<HomePageProps> = () => {
    const { t } = useLanguage();
    const switchPage = useNavigation();

    return (
        <div className="home-page">
            <div className="home-content">
                <h1 className="home-title">{t('home.welcome')}</h1>
                <p className="home-subtitle">{t('home.subtitle')}</p>
                <div className="home-switch-row">
                    <LanguageSwitch />
                </div>
                <div className="home-start-row">
                    <StyledButton onClick={() => switchPage("main_page")} value={t('home.start')} />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
