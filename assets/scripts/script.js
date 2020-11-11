//Element selectors and input variables
var userInput;
var uvIndex;
var pastSearches = JSON.parse(localStorage.getItem('cities')) || [];
var displayInfo = document.getElementById('info');
var forecastElement = document.getElementById('daysForecast');
var citiesSearched = document.getElementById('citiesSearched');

// api key: ad48a33f3b48cd0e6865e7b3613dcfa6

//Event listener for search button
document.addEventListener('click', function (e) {
var target = e.target;
if(target.classList.contains('btn')){
    userInput = document.getElementById('searchCity').value;
    displayForecast(userInput);
    //empty the user's input
    document.getElementById('searchCity').value = '';
}
})

// Displays recently searched cities to the screen
//1. iterate through citiesSearched array
//2. dynamically create a div to display the results
//3. set each element the index iterates through in the array to the newly created div
//4. attach (append) the newly created div to the 'citiesSearched' id element
function displayPastSearches() {
    //set to empty before every render
    citiesSearched.innerHTML = ''
  
    for (var i = 0; i < pastSearches.length; i++) {
      var city = document.createElement('div');
      city.innerHTML = pastSearches[i] + " <hr>";
      citiesSearched.append(city);
    };
  };



//Captilize first letter of every word in the string
//1. make the string parameter lowercase and split it into an array of substrings -> store in a variable
//2. iterate through the stored string
//3. set first element (index 0) in the string toUpperCase
//4. concatenate all subsequent characters in the string to the uppercase character
//5. return the string back and unsplit it
function titleCase(str) {
  var splitStr = str.toLowerCase().split(' '); // console.log(splitStr)
  for (var i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(' ');
};

// Display the city the user inputted into the search bar
//1. pass userInput into the titleCase function to capitalize the first letter
//2. push the userInput to the pastSearches array so it can be displayed in the recent searches
//3. store pastSearches array in local storage under a key called 'cities'
//4. call displayPastSearches function to display recently searched cities to the screen
//5. call getCityWeather passing the userInput in order to get the forecast of the searched city
function displayForecast(userInput) {
  //push userInput to local storage
  userInput = titleCase(userInput);
  pastSearches.push(userInput);
  localStorage.setItem('cities', JSON.stringify(pastSearches));
  displayPastSearches();
  getCityWeather(userInput);
}

//Retreive weather data 
//1. set displayInfo element to empty
//2. fetch data from api
//3. return data as a .json object
//4. store information from the returned .json object to a dynamically created HTML element
//5. attach (append) stored information to the 
function getCityWeather(userInput){
  displayInfo.innerHTML = '';
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${userInput}&appid=ad48a33f3b48cd0e6865e7b3613dcfa6`)
  .then(response => response.json())
  .then(({ main: { temp, humidity }, wind: { speed }, coord: { lon, lat } }) => {
    var info = document.createElement('div');

    info.innerHTML = `<h2>${userInput} ${moment().format('MM/DD/YYYY')}</h2>
    <p>Temperature: ${temp} ºC</p>
    <p>Humidity: ${humidity}</p>
    <p> Wind Speed: ${speed} mph </p>
    `
      displayInfo.append(info)
      getUvIndex(lon, lat)
      getFiveDayForecast(lon, lat)
      
    })
    .catch(error => console.error(error))
} 


//Retreive UV data
//1. fetch uv data from API
//2. return data as a .json object
//3. reference the returned .json data in a variable
//4. dynamically create HTML elements to display the returned data
//5. round the uv data using Math.floor() method
//6. display whether or not the uv data is safe 
//7. append dynamically created elements to existing elements
const getUvIndex = (lon, lat) =>{
  fetch(`https://api.openweathermap.org/data/2.5/uvi?appid=ad48a33f3b48cd0e6865e7b3613dcfa6&lat=${lat}&lon=${lon}`)
    .then(response => response.json())
    .then(({ value }) => {
      var uvNode = document.createElement('p')
      uvNode.textContent = 'UV Index: '
      var uvSpan = document.createElement('span')
      uvSpan.textContent = `${value}`
      value = Math.floor(value)
      if(value < 3){
        uvSpan.setAttribute('class', 'uvSafe')
      }
      else if (value > 2 && value <6){
        uvSpan.setAttribute('class', 'uvMed')
      }
      else if (value > 5 && value < 8){
        uvSpan.setAttribute('class', 'uvMod')
      }
      else{
        uvSpan.setAttribute('class', 'uvHigh')
      }
      uvNode.append(uvSpan)
      displayInfo.append(uvNode)
    })

    .catch(error => console.error(error))
}

//Retreive the 5 day forecast of a given city
//1. fetch forecast from API
//2. return fetched data as a .json object
//3. store data as a list in a variable (list)
//4. iterate over the list variable
//5. dynamically create an html elements to display fetched data
//6. append created element to existing html element
function getFiveDayForecast(lon, lat) {
  forecastElement.innerHTML = '';
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=ad48a33f3b48cd0e6865e7b3613dcfa6`)
  .then(response => response.json())
  .then(data => {
    //converting unix time stamp to a date time
    var list = data.list;
    console.log(moment.unix(list[0].dt).format("MM/DD/YYYY"))
    for(var i = 7; i < list.length; i+=7){
      var forecastNode = document.createElement('div')
      forecastNode.setAttribute('class', 'col-sm-2.4 fiveForecastStyle')
      forecastNode.innerHTML = `
      <h6>${moment.unix(list[i].dt).format("MM/DD/YYYY")}</h6>
      <img src= "https://openweathermap.org/img/wn/${list[i].weather[0].icon}.png" alt = "${list[i].weather[0].icon}">
      <p>Temp: ${list[i].main.temp} ºC</p>
      <p>Humidity: ${list[i].main.humidity}%</p>
      `
      forecastElement.append(forecastNode)
    }
  })
  .catch(error => console.error(error))
}
//Displays the past searches
displayPastSearches();


