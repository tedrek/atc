
function airline_init_pre() {
  prop.airline = {};
  prop.airline.airlines = {};
}

function airline_init() {
  // Civil Airlines
  airline_load("UAL");
  airline_load("BAW");
  airline_load("AAL");
  airline_load("AWE");
  airline_load("CESSNA");
  airline_load("ACA");
  airline_load("KLM");
  airline_load("KLC");
  airline_load("GLO");
  airline_load("TAM");
  airline_load("AVA");
  airline_load("AZU");
  airline_load("EMBRAER");
  airline_load("DAL");
  airline_load("AFL");
  airline_load("SBI");
  airline_load("TSO");
  airline_load("SVR");
  airline_load("UTA");
  airline_load("ASA");

  // Cargo Airlines
  airline_load("FDX");
  airline_load("UPS");
  airline_load("CWC");
  
  // Military Air Forces
  airline_load("RFF");
  airline_load("FAB");
  airline_load("USAF");
}

function airline_load(icao) {
  icao = icao.toLowerCase();
  new Content({
    type: "json",
    url: "assets/airlines/"+icao+".json",
    payload: icao.toLowerCase(),
    callback: function(status, data, payload) {
      if(status == "ok") {
        prop.airline.airlines[payload] = data;
      }
    }
  });
}

function airline_get(icao) {
  icao = icao.toLowerCase();
  return prop.airline.airlines[icao];
}

function airline_get_aircraft(icao) {
  var airline     = airline_get(icao);
  var aircraft    = airline.aircraft;

  return choose_weight(aircraft);
}

function airline_ready() {
  for(var i in prop.airline.airlines) {
    var airline = prop.airline.airlines[i];
    for(var j=0;j<airline.aircraft.length;j++) {
      if(!(airline.aircraft[j][0].toLowerCase() in prop.aircraft.models)) {
        console.warn("Airline "+i.toUpperCase()+" uses nonexistent aircraft "+airline.aircraft[j][0]+", expect errors");
      }
    }
  }
}
