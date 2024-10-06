import React from "react";
import ResponsiveButton from "../components/ResponsiveButton";

function HomePage({switchPage}) {

    return (
        <>
        <h2>Welcome to the HomePage</h2>
        <ResponsiveButton onClick={()=>switchPage("main_page")} value="Next Page"></ResponsiveButton>
        </>
    )


}

export default HomePage;