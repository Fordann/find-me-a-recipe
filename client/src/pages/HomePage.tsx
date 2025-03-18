import React from "react";
import ResponsiveButton from "../components/ResponsiveButton";

// Définition des types des props
type HomePageProps = {
    switchPage: (page: "home_page" | "main_page") => void;
};

const HomePage: React.FC<HomePageProps> = ({ switchPage }) => {
    return (
        <>
            <h2>Welcome to the HomePage</h2>
            <ResponsiveButton onClick={() => switchPage("main_page")} value="Next Page" />
        </>
    );
};

export default HomePage;
