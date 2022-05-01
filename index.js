async function getData() {
    //here we use the API from the website to fetch the data
    try {
        const response = await fetch('https://www.berlin.de/sen/web/service/maerkte-feste/strassen-volksfeste/index.php/index/all.json?q=', {
            method: 'GET'
        });
        const results = await response.json();
        return results;
    } catch (error) {
        console.error(error);
    }
}


async function getEntries() {
    let results = document.getElementById('table')
    for(var i = 1;i<results.rows.length;){
        results.deleteRow(i);
    }

    //fetch the data
    const data = await getData();
    var entries = [];

    //creating a list of lists - each list is an event (we select only relevant columns)
    for (let i = 0; i < data['index'].length; i++) {
        var party = [];
        party.push(data['index'][i]['bezirk'])
        party.push(data['index'][i]['strasse'])
        party.push(data['index'][i]['von'])
        party.push(data['index'][i]['bis'])
        party.push(data['index'][i]['zeit'])
        party.push(data['index'][i]['www'])
        entries.push(party)
    }
     
    //based on the responses in the form, we filter our events
    if (document.getElementById('time').checked) {
        entries = filterByPlace(filterByTime(entries))
    } else {
        entries = filterByPlace(entries)
    }

    //here we create html elements to fill in the table with our selected entries
    for (let i = 0; i < entries.length; i++) {       
        let entry = document.createElement('tr')
        entry.setAttribute('class', 'entry')

        let neighbourhood = document.createElement('td');
        neighbourhood.innerText = entries[i][0]
        neighbourhood.setAttribute('class', 'neighb')
        entry.appendChild(neighbourhood)

        let street = document.createElement('td');
        street.innerText = entries[i][1]
        street.setAttribute('class', 'street')
        entry.appendChild(street)

        let from = document.createElement('td');
        from.innerText = entries[i][2]
        from.setAttribute('class', 'from')
        entry.appendChild(from)

        let to = document.createElement('td');
        to.innerText = entries[i][3]
        to.setAttribute('class', 'to')
        entry.appendChild(to)

        let time = document.createElement('td');
        time.innerText = entries[i][4]
        time.setAttribute('class', 'time')
        entry.appendChild(time)

        let info = document.createElement('td');
        info.innerText = entries[i][5]
        info.setAttribute('class', 'info')
        entry.appendChild(info)

        console.log(results)
        results.appendChild(entry)
    }
}

// given a list of entries, filters out ones that are not happening right now
function filterByTime(entries){
    //creating an object that indicates today's date
    var today = new Date().toISOString().slice(0, 10)
    var filtered_entries = []
    //goes through each entry and if the start date is smaller than today
    //and end date is larger than today tehn add this entry to our filtered entries
    for (let i = 0; i < entries.length; i++) {
        var from = new Date(entries[i][2]).toISOString().slice(0, 10)
        var to = new Date(entries[i][3]).toISOString().slice(0, 10)
        if (from <= today && to >= today) {
            filtered_entries.push(entries[i])
        }
    }
    return filtered_entries
}  

// given a list of entries, filters out ones that are not in the given neighborhood
function  filterByPlace(entries){
    var filtered_entries = []

    var input = document.getElementById('neighborhood').value
    for (let i = 0; i < entries.length; i++) {
        if (entries[i][0] === input) {
            filtered_entries.push(entries[i])
        }
    }
    return filtered_entries
}


// This part of the code implements the autocomplete function
var neighbourhoods = ["Mitte", "Charlottenburg-Wilmersdorf", "Neukölln", "Steglitz-Zehlendorf", "Spandau", "Tempelhof-Schöneberg", "Reinickendorf", "Treptow-Köpenick", "Marzahn-Hellersdorf", "Friedrichshain-Kreuzberg", "Pankow"]

function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
  }

autocomplete(document.getElementById("neighborhood"), neighbourhoods);

