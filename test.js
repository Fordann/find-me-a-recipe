const apiKey = '2a899d3cc4bda80837f6523fc55467f0';

let submit_button = document.querySelector('input[type="submit"]');
let next_button = document.getElementById('next');
let cities = []
let current_city = 0

function display_city(city) {
  const temperature = city.main.temp;
  const description = city.weather[0].description;
  const location = city.name;
  document.querySelector('#temp').innerHTML = temperature;
  document.querySelector('#description').innerHTML = description;
  document.querySelector('#city').innerHTML = location;
}


next_button.onclick = function () {
  if (cities.length != 0) {
    current_city = (current_city + 1) % cities.length;
    display_city(cities[current_city])
  }
}

function get_data_from_text(potential_cities) {
  for (let i = 0; i < potential_cities.length; i++) {
    let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${potential_cities[i]}&appid=${apiKey}`;
    fetch(apiUrl)
      .then((response) => 
        response.json()
      .then(data => {
        if (data.message != 'city not found') {
          cities.push(data);}})  
      .then(() => {
      if (cities.length != 0) {
        display_city(cities[current_city]);
      }}) 
      .catch(error => {
        console.error('Error:', error);
      }));
  }
  return true;
}


submit_button.onclick = function () {
  let city_input = document.getElementById('city input').value;
  if (city_input != "") {
    potential_cities = city_input.split(" ");
    get_data_from_text(potential_cities)
    .then(()=> {
      if (cities.length != 0) {
        display_city(cities[current_city])
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });  
  } 
}


  
  


