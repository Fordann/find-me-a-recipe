import React from "react";
import { StyledButton } from "../components";
import { useTranslation } from "../store/slices/language/LanguageExtension";
import LanguageSwitch from "../components/LanguageSwitch";
import { useDispatch } from "react-redux";
import { navigate } from "../store/slices/PageSlice";
import "../styles/HomePage.css";

type HomePageProps = {

};

const HomePage: React.FC<HomePageProps> = () => {
    const t = useTranslation();
    const dispatch = useDispatch();

    return (
        <div className="home-page">
            <div className="home-content">
                <h1 className="home-title">{t('home.welcome')}</h1>
                <p className="home-subtitle">{t('home.subtitle')}</p>
                <div className="home-switch-row">
                    <LanguageSwitch />
                </div>
                <div className="home-start-row">
                    <StyledButton onClick={() => dispatch(navigate("main_page"))} value={t('home.start')} />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
