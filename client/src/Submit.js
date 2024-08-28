import React, { useState} from "react";



function Submit(props) {
    
    
  
    function apiCall() {
        // POST request using fetch inside useEffect React hook
        const donnees = {
            "aqt": "boeuf bourguignon",  
            "dt": "platprincipal",      
            "exp": 2,                   
            "dif": 2,                   
            "veg": 0,                  
            }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donnees)
        };
        fetch("/data", requestOptions)
            .then(response => response.json())
            .then(dataP => props.func(dataP))
    
    // empty dependency array means this effect will only run once (like componentDidMount in classes)
    }
    return (
        <button type="button" className="btn toggle-btn" aria-pressed="true" onClick={apiCall}>BOB le bricoleur</button>
    )
    };

export default Submit;