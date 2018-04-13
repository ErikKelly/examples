
/**
 * Fetches data from a given API endpoint.
 * @param {string} url - URL of the API endpoint.
 * @return {Promise} - Promise that resolves as a JSON object of the response.
 */
function fetchData(url) {
  return fetch(url).then((resp) => resp.json());
}

/**
 * Returns text wrapped in a element with provided tag name. Optionally, an
 * array of CSS class names can be added to the wrapping element.
 * @param {string} tagName - HTML tag name.
 * @param {string} text - Text content of the element.
 * @param {Array.<string>} [cssClasses] - Class names to add to the element.
 * @return {HTMLElement}
 */
function constructElement(tagName, text, cssClasses) {
  const el = document.createElement(tagName);
  const content = document.createTextNode(text);
  el.appendChild(content);
  if (cssClasses) {
    el.classList.add(cssClasses);
    if(cssClasses === 'table-cell-1'){
      el.onclick = displayPersonDetail;
    }
  }
  return el;
}

/**
 * Given an array of strings (data), this returns a table row element with <td>
 * children wrapping each item in the data array.
 * @param {Array.<string>} [data] - Data to display in table cells.
 * @return {HTMLElement}
 */
function constructTableRow(data) {
  const row = document.createElement('tr');
  var cellCount = 0;
  data.forEach((datum) => {
    cellCount++;
    row.appendChild(constructElement('td', datum,'table-cell-' + cellCount));
  });
  return row;
}

/**
 * Calls api to return homeworld data
 *
 */
function displayPersonDetail(){
  var person = this.innerHTML;
  var retrievedObject = localStorage.getItem('personInfo');
  var personData = JSON.parse(retrievedObject);
  var personSelected = '';
console.log(personData);
  personData.forEach(personInfo => {
    if (personInfo.name == person){
      personSelected = personInfo;
    }
  });

  fetchData(personSelected.homeworld).then((homeworld) => {

    displayHomeworld(homeworld);
  });

}

/**
 * Creates lightbox of homeworld data
 *
 */
function displayHomeworld(homeworld){

  // removes previously selected world content
  if (document.contains(document.getElementById("homeworld-content"))) {
    document.getElementById("homeworld-content").remove();
  }

    var worldContent = document.createElement("div");
    var worldString = '<div class="homeworld-details">World Details</div>'+
      '<div class="homeworld-name">Homeworld: ' + homeworld.name + '</div>'+
      '<div class="homeworld-climate">Climate: ' + homeworld.climate + '</div>'+
      '<div class="homeworld-diameter">Diameter: ' + homeworld.diameter + '</div>'+
      '<div class="homeworld-gravity">Gravity: ' + homeworld.gravity + '</div>'+
      '<div class="homeworld-orbital-period">Orbital Period: ' + homeworld.orbital_period + '</div>'+
      '<div class="homeworld-orbital-population">Population: ' + homeworld.population + '</div>'+
      '<div class="homeworld-orbital-surface-water">Surface Water: ' + homeworld.surface_water + '</div>'+
      '<div class="homeworld-terrain">Terrain: ' + homeworld.terrain + '</div>';

      worldContent.innerHTML = worldString;
      worldContent.id = 'homeworld-content';
      worldContent.className = 'homeworld-name';
      document.getElementById("sw-world").appendChild(worldContent);

      var closeButton = document.createElement("div");
        closeButton.onclick = closeHomeworld;
        closeButton.className = 'close-homeworld';
        closeButton.append('X');
        document.getElementById("homeworld-content").appendChild(closeButton);

  // displays world;
  document.getElementById('sw-app').classList.add('world-displayed');

  document.getElementById('sw-world').classList.add('active');
}

/**
 * Closes Homeworld lightbox
 * Removes classes world-displayed & active
 */
function closeHomeworld(){
  document.getElementById('sw-app').classList.remove('world-displayed');
  document.getElementById('sw-world').classList.remove('active');
}


/**
 * Collects all species, using .next to concat all pages
 * @param {string} url - Species URL
 * @param {array} speciesList - previous species
 */
function getSpecies(url = "https://swapi.co/api/species/", speciesList = []){
  return new Promise(function(resolve,reject){
    var result = fetchData(url).then((speciesData) => {
      // concats all results from calls
      if (speciesList && typeof speciesList.results !== "undefined"){
        speciesData.results = speciesList.results.concat(speciesData.results);
      }
      // if a next page exists, runs again
      if (speciesData.next){
        getSpecies(speciesData.next,speciesData);
      }else{
        populateSpecies(speciesData);
        populateTable();
      }
      return speciesData;
    });
    resolve(result);
  });
}

/**
 * Populates species list/selector
 * @param {array} result - Data of all species
 */
function populateSpecies(result){

  var myDiv = document.getElementById("sw-species");

  //Create and append the options
  result.results.forEach(species => {

    // defaults to Human
    var divStatus = (species.name === "Human") ? 'active' : 'inactive';

    var divInsert = document.createElement("div");


    if (divStatus === "active"){
      divInsert.onclick = displaySpecies;
    }else{
      divInsert.onclick = changeSpecies;
    }
    divInsert.className = divStatus;

    divInsert.setAttribute('speciesURL', species.url);

    var speciesName = document.createElement("div");
    speciesName.className = "species-name";
    speciesName.append(species.name + ': ' + species.designation + ' ' + species.classification);
    divInsert.append(speciesName);


    var blockDiv2 = document.createElement("div");
    blockDiv2.className = "species-detail";
    blockDiv2.append('Average height: ' + species.average_height);
    blockDiv2.append(' | ');
    blockDiv2.append('Average lifespan: ' + species.average_lifespan);
    divInsert.append(blockDiv2);

    var navDiv = document.createElement("div");
    navDiv.className = "species-button";
    navDiv.append('- Select Different Species -');
    divInsert.append(navDiv);

    document.getElementById("sw-species").appendChild(divInsert);

  });
}

/**
 * Adds class to display species
 */
function displaySpecies() {
  document.getElementById('sw-species').classList.toggle('display-all');
}

/**
 * Change selected species
 */
function changeSpecies() {

  var prevActive = document.querySelector(".active");
  prevActive.classList.remove("active");
  prevActive.classList.add("inactive");
  prevActive.onclick = changeSpecies;

  this.classList.remove("inactive");
  this.classList.add("active");
  this.onclick = displaySpecies;

  // removes display all
  document.getElementById('sw-species').classList.remove('display-all');

  var speciesURL = this.getAttribute("speciesurl");
  // clears previous table data and dashboard
  clearTable();
  clearDashboard();
  // repopulates table
  populateTable(speciesURL);
}


/**
 * Gathers species data from api
 * @param {string} url - url for species type
 */
function populateTable(url='https://swapi.co/api/species/1/'){

fetchData(url).then((groupData) => {

  var promises = groupData.people.map(url => new Promise(function(resolve, reject) {

    var result = fetchData(url).then((personData) => {

      // adding new field to sort last name, capilalized to account for Beru Whitesun lars
      var nameSplit = personData.name.split(' ').pop().toUpperCase();
      personData.sort_by = nameSplit + ' ' + personData.name;

      return personData;
/*
// can add another query to initial
    }).then((personData) => {

      var promises2 = personData.species.map(url2 => new Promise(function(resolve, reject) {

        var result2 = fetchData(url2).then((speciesData) => {
          personData['species_info'] = speciesData;
          return personData;

        })
      })
    );
    return personData;
*/
  });

   resolve(result);

 })
);


/**
 * Promise populates table
 */
Promise.all(promises).then(function(results) {
   // sort by last name
   // results.sort(function(a,b) {return (a.sort_by > b.sort_by) ? 1 : ((b.sort_by > a.sort_by) ? -1 : 0);} );
   results.sort(compareValues('sort_by'));

   results.forEach(personInfo => {
     //populates table
     personInfo.height_formatted = (personInfo.height === "unknown") ? personInfo.height : (personInfo.height / 100) + 'm';
     personInfo.mass_formatted = (personInfo.mass === "unknown") ? personInfo.mass : (personInfo.mass) + 'kg';

     insertRows(personInfo);
   });

   localStorage.setItem('personInfo', JSON.stringify(results));
   // localStorage.setItem('personInfo', results);

   personAverages(results);

 });

});

}


/**
 * Sort by key
 * @param {string} key - element key to sort on
 * @param {string} order - asc or desc
 */
function compareValues(key, order='asc') {
  return function(a, b) {
    if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
        return 0;
    }

    const varA = (typeof a[key] === 'string') ?
      a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string') ?
      b[key].toUpperCase() : b[key];

    let comparison = 0;

    // compares number values for height and mass
    if (key === "height" || key === "mass"){

      const varA2 = (varA == "UNKNOWN") ? Infinity : varA;
      const varB2 = (varB == "UNKNOWN") ? Infinity : varB;
      if (Number(varA2) > Number(varB2)) {
        comparison = 1;
      } else if (Number(varA2) < Number(varB2)) {
        comparison = -1;
      }

    }else{
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
    }
    return (
      (order == 'desc') ? (comparison * -1) : comparison
    );
  };
}

/**
 * Takes user data and finds averages, inserting them into the dashboard
 * @param {array.<string>} [data] - Data to insert into dashboard
 * @return {HTMLElement}
 */
function personAverages(results){
  var totalPeople = results.length;
  var massUsers = totalPeople;
  var massTotal = 0;
  var massAvg = 0;

  var tallestHeight = 0;
  var tallestPerson = '';

  var haircolor = [];

  results.forEach(personInfo => {

    // subtract unkonwn users to not reduce average of known users
    if (personInfo.mass == "unknown"){
      massUsers--;
    }else{
      var personMass = personInfo.mass.replace(/\,/g,'');
      massTotal = (+massTotal) + (+personMass);
    }

    // find tallest person
    if (personInfo.height !== "unknown" && tallestHeight < personInfo.height){
      tallestPerson = personInfo.name;
      tallestHeight = personInfo.height;
    }

    haircolor[personInfo.hair_color] = (typeof haircolor[personInfo.hair_color] == "undefined") ? 1 : haircolor[personInfo.hair_color] + 1;

  });

  // finds the leading haircolor
  var colorCount = 0;
  var colorLeader = '';
    for (var k in haircolor){
      if (haircolor[k] > colorCount){
        colorCount = haircolor[k];
        colorLeader = k;
      }
    }

  // average mass
  massAvg = Math.round( +massTotal / massUsers);

  insertDashboard("Average mass: " + massAvg + 'kg');
  insertDashboard("Name and height of tallest: " + tallestPerson + ' ' + (tallestHeight / 100) + 'm');
  insertDashboard("Most common hair color: " + colorLeader);

}

/**
 * Takes a string and inserts it into the sw-dashboard div
 * @param {<string>} [data] - Data to insert into dashboard
 * @return {HTMLElement}
 */
function insertDashboard(insertText){
    var divInsert = document.createElement("div");
    divInsert.innerHTML = insertText;
    document.getElementById("sw-dashboard").appendChild(divInsert);
}

/**
 * Inserts rows into swTable table
 * @param {array.<string>} [data] - Person data
 * @return {HTMLElement}
 */
function insertRows(personData){
  const row = constructTableRow([
    personData.name,
    personData.height_formatted,
    personData.mass_formatted,
    personData.hair_color
  ]);
  swTable.appendChild(row);

  }



/**
   * Clears results table and repopulates with sorted data
*/
document.addEventListener('DOMContentLoaded', function(){
  // sort
  var classname = document.getElementsByClassName("sort");

  var myFunction = function() {

      var sortBy = this.getAttribute("sort-attribute");
      // add
      var sortedClass = document.querySelector(".sorted");
      sortedClass.classList.remove("sorted");
      this.classList.add('sorted');
      var retrievedObject = localStorage.getItem('personInfo');

      var personData = JSON.parse(retrievedObject);

      personData.sort(compareValues(sortBy));

      clearTable();

      // inserts new ordered rows into table
      personData.forEach(personInfo => {
        insertRows(personInfo);
      });

  };

  for (var i = 0; i < classname.length; i++) {
      classname[i].addEventListener('click', myFunction, false);
  }


}, false);

/**
 * Clears table data
 */
function clearTable(){
  // removes previous rows from table
  var table = document.getElementById("sw-table");
  for(var i = table.rows.length - 1; i > 0; i--)
  {
      table.deleteRow(i);
  }
}

/**
 * Clears dashboard data
 */
function clearDashboard(){
  // removes previous rows from table
  var myNode = document.getElementById("sw-dashboard");
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
  }
}

const swTable = document.getElementById('sw-table')
    .getElementsByTagName('tbody')[0];

// get initial species
var species = getSpecies();
