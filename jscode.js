
// Get information about user:
var __url = "https://api.ciscospark.com/v1/people/me";

var CNT = "application/json; charset=utf-8";
var TKN = "M2U1MDIyMzEtNDNlMS00Y2Y2LWIxNDItN2MwNDdhOGM0NjRmNTE5Zjk5NmMtYTA1";
var AUT = "Bearer " + TKN;

var PERSONS = [] // array of all participants

function ShowResult(result) {
  document.getElementById("hans").innerHTML = JSON.stringify(JSON.parse(JSON.stringify(result)),null,2); ;
  //lert(JSON.stringify(result) + "LOLOLOL: " + result.avatar);
  document.getElementById("imgShow").src = result.avatar;
} // ShowResult


jQuery.ajax({
  url: __url,
  type: "GET",
  headers: {
    'Authorization': AUT,
    'Content-Type': CNT
  }, // headers
  success: function(result) {
    ShowResult(result);
  } // function
}); // jQuery.ajax

// displays all elements in array PERSONS
function ShowPersonList( ) {
  document.getElementById("hans").innerHTML = "";
  for (var i = 0; i < PERSONS.length; i++) {
    var str = "<img width='128' height='128' src = '" + PERSONS[i].imgURL + "'>";
    str += i + ": " + PERSONS[i].name + "<br/><br/>";
    document.getElementById("hans").innerHTML += str;
  } // for
} // ShowPersonList


// loops through result to get all participants
function ProcessParticipants(result) {
  for (x in result["items"]) {
    var personId = result["items"][x].personId;
    var _url = "https://api.ciscospark.com/v1/people/" + personId;
    var _header = {"Authorization" : AUT, "Content-type" : CNT};

    jQuery.ajax({
      url: _url,
      type: "GET",
      headers: _header,
      success: function(result) {
        if (result.type == "person") {
          var person = new Object;
          person.name = result.displayName;
          person.imgURL = result.avatar;
          person.id = result.id;

          PERSONS[PERSONS.length] = person;
          ShowPersonList( );
        } // if
      } // function
    }); // jQuery.ajax

  } // for
} // ProcessParticipants

// sends HTTP GET request to Spark server to obtain
// json containing all participants in room
function GetRoomParticipants( ) {

  var _url = "https://api.ciscospark.com/v1/memberships";
  var _header = {"Authorization" : AUT, "Content-type" : CNT};
  var _roomId = document.getElementById("roomInp").value;
  var _params = {"roomId" : _roomId};

  jQuery.ajax({
    url: _url,
    type: "GET",
    headers: _header,
    data: _params,
    success: function(result) {
      //alert(JSON.stringify(result));
      ProcessParticipants(result);
    } // function
  }); // jQuery.ajax
} // GetRoomParticipants

document.getElementById("roomBut").onclick = GetRoomParticipants;
