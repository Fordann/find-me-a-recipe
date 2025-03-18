import React from "react";

// Typage des props
interface SubmitProps {
  func: (data: any) => void; // Typage de la fonction func qui reçoit un paramètre data de type 'any'
}

const Submit: React.FC<SubmitProps> = (props) => {

  function apiCall(): void {
    const donnees = {
      "aqt": "boeuf bourguignon",  
      "dt": "platprincipal",      
      "exp": 2,                   
      "dif": 2,                   
      "veg": 0,                  
    };

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donnees),
    };

    fetch("/data", requestOptions)
      .then((response) => response.json())  // Le type de réponse est implicitement 'any' ici, mais tu peux le préciser selon l'API.
      .then((dataP) => props.func(dataP));
  }

  return (
    <button type="button" className="btn toggle-btn" aria-pressed="true" onClick={apiCall}>
      BOB le bricoleur
    </button>
  );
};

export default Submit;
