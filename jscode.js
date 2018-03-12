
// Get information about user:

var CNT = "application/json; charset=utf-8";
var TKN = "M2U1MDIyMzEtNDNlMS00Y2Y2LWIxNDItN2MwNDdhOGM0NjRmNTE5Zjk5NmMtYTA1";
var AUT = "Bearer " + TKN;

var PERSONS = [ ] // array of all participants
var UNKNOWNS = [ ]; // list of unknown people (indices)
var ROOM_LIST = [ ];
var PIDS = [ ]; // list of ids of persons
var CUR_UNKNOWN = 0;
var PIDS_INDEX = 0;
var LAST_NSHOW = new Date( );

// checks if last name show is > x seconds ago,
// if so, faceNameHolder will be cleaned (text set to "...")
function CheckNShow( ) {
  var curDate = new Date();
  var seconds = (curDate.getTime( ) - LAST_NSHOW.getTime( )) / 1000;
  if (seconds >= 3) {
    document.getElementById("faceNameHolder").innerHTML = "...";
  } // if
  setTimeout(CheckNShow, 1000);
} // CheckNShow

function DispNameLeft(faceNr) {
  if (faceNr >= 0 && faceNr < PERSONS.length) {
    document.getElementById("faceNameHolder").innerHTML = PERSONS[faceNr].name;
    LAST_NSHOW = new Date( );
  } // if
} // DispNameLeft

// displays face [UNKNOWNS[n]]
function SetRFace(n) {
  if (UNKNOWNS.length == 0) {
    jQuery("#rfaceimage").attr('src', "defaultface.png");
    document.getElementById("rfacetext").innerHTML = "nobody";
  } // if
  else {
    var faceNr = UNKNOWNS[n];
    jQuery("#rfaceimage").attr('src', PERSONS[faceNr].imgURL);
    document.getElementById("rfacetext").innerHTML = PERSONS[faceNr].name;
  } // else
  var str = "";
  str += PERSONS.length + " faces, " + UNKNOWNS.length + " unknown";
  document.getElementById("rinfo").innerHTML = str;
} // SetRFace

// chooses random next index for face
function NextRFace( ) {
  var temp = CUR_UNKNOWN;
  if (UNKNOWNS.length <= 1) {
    console.log("UNKNOWNS.length == " + UNKNOWNS.length + "!");
    CUR_UNKNOWN = 0;
    SetRFace(CUR_UNKNOWN);
    return;
  } // if
  while (CUR_UNKNOWN == temp) {
    CUR_UNKNOWN = Math.floor(Math.random( ) * UNKNOWNS.length);
    console.log("CUR_UNKNOWN = " + CUR_UNKNOWN + " temp = " + temp);
  } // while
  SetRFace(CUR_UNKNOWN);
} // NextRFace

// removes element [CUR_UNKNOWN] from array UNKNOWNS
function RemoveCurrentRFace( ) {
  if (UNKNOWNS.length > 0) {
    var faceimgid = "#person_face_" + UNKNOWNS[CUR_UNKNOWN];
    jQuery(faceimgid).hide( );
  } // if

  if (UNKNOWNS.length <= 1) {
    UNKNOWNS = [ ];
    CUR_UNKNOWN = 0;
    NextRFace( );
    return;
  } // if
  var newArray = [ ];
  for (var x = 0; x < UNKNOWNS.length; x++) {
    if (x != CUR_UNKNOWN) {
      newArray[newArray.length] = UNKNOWNS[x];
    } // if
  } // for
  UNKNOWNS = newArray;
  CUR_UNKNOWN = 0;
  NextRFace( );
} // RemoveCurrentRFace

// displays all elements in array PERSONS
function ShowPersonList( ) {
  document.getElementById("facecontainer").innerHTML = "";
  for (var i = 0; i < PERSONS.length; i++) {
    var str = "";
    str += "<div class='pcolumn'";
    str += "id='person_face_" + i + "' "; // set id to person_face_[i]
    str += ">";
    str += "<img style='width:100%' class='faceimg' ";
    str += "src='" + PERSONS[i].imgURL + "' "; // add image
    str += "onmouseover='DispNameLeft(" + i + ");'";
    str += "></div>";

    document.getElementById("facecontainer").innerHTML += str;
  } // for
} // ShowPersonList

// puts all persons in results in PIDS
function PreloadParticipants(result) {
  PIDS = [ ];
  PIDS_INDEX = 0;
  for (x in result["items"]) {
    var personId = result["items"][x].personId;
    PIDS[PIDS.length] = personId;
  } // for
  ProcessPerson( );
} // PreloadParticipants

// takes element from PIDS and loads person and puts result
// in PERSONS, until we've had all elements in PIDS
function ProcessPerson( ) {
  if (PIDS_INDEX >= PIDS.length) {
    console.log("Done with loading persons");
    return;
  } // if
  console.log("Loading person " + PIDS_INDEX);
  var personId = PIDS[PIDS_INDEX];
  var _url = "https://api.ciscospark.com/v1/people/" + personId;
  var _header = {"Authorization" : AUT, "Content-type" : CNT};

  jQuery.ajax({
    url: _url,
    type: "GET",
    headers: _header,
    success: function(result) {
      if (result.type == "person") {
        if (result.hasOwnProperty('avatar')) {
          var person = new Object;
          person.name = result.displayName;
          person.imgURL = result.avatar;
          person.id = result.id;

          PERSONS[PERSONS.length] = person;

          // update UNKNOWNS:
          UNKNOWNS = [];
          for (var n = 0; n < PERSONS.length; n++)
            UNKNOWNS[n] = n;

          SetRFace(0);
          ShowPersonList( );
        } // if
      } // if
    } // function
  }); // jQuery.ajax
  PIDS_INDEX = PIDS_INDEX + 1;
  setTimeout(ProcessPerson, 1000);
} // ProcessPerson

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
          if (result.hasOwnProperty('avatar')) {
            var person = new Object;
            person.name = result.displayName;
            person.imgURL = result.avatar;
            person.id = result.id;

            PERSONS[PERSONS.length] = person;

            // update UNKNOWNS:
            UNKNOWNS = [];
            for (var n = 0; n < PERSONS.length; n++)
              UNKNOWNS[n] = n;

            SetRFace(0);

            ShowPersonList( );
          } // if
        } // if
      } // function
    }); // jQuery.ajax

    // now wait a bit:
    var initTime = new Date( );
    var curTime = new Date( );
    while ((curTime.getTime( ) - initTime.getTime( )) < 500) {
      curTime = new Date( );
    } // while

  } // for
} // ProcessParticipants

// sends HTTP GET request to Spark server to obtain
// json containing all participants in room
function GetRoomParticipants( ) {
  var roomNr = document.getElementById("roomselect").selectedIndex;
  var _roomId;

  console.log("selected index: " + roomNr);
  if (roomNr >= 0 && roomNr < ROOM_LIST.length) {
    _roomId = ROOM_LIST[roomNr].id;
    console.log("Selected room" + ROOM_LIST[roomNr].name);
    console.log(ROOM_LIST[roomNr].id);
  } // if
  else {
    alert("Invalid roomNr!");
    return;
  } // else
  var _url = "https://api.ciscospark.com/v1/memberships";
  var _header = {"Authorization" : AUT, "Content-type" : CNT};
  var _params = {"roomId" : _roomId, "max" : 1000};

  PERSONS = [ ];
  UNKNOWNS = [ ];
  CUR_UNKNOWN = 0;

  jQuery.ajax({
    url: _url,
    type: "GET",
    headers: _header,
    data: _params,
    success: function(result, status, xhr) {
      //ProcessParticipants(result);
      PreloadParticipants(result);
    } // function
  }); // jQuery.ajax
} // GetRoomParticipants

// finds all rooms that user is in
function GetRooms( ) {
  // remove all rooms from roomselect
  var select = document.getElementById("roomselect");
  var slength = select.options.length;
  for (var i = 0; i < slength; i++) {
    select.options[i] = null;
  } // for

  ROOM_LIST = [ ];
  var _url = "https://api.ciscospark.com/v1/rooms";
  var _header = {"Authorization" : AUT, "Content-type" : CNT};
  var _params = {"type" : "group", "sortBy" : "created"};

  jQuery.ajax({
    url: _url,
    type: "GET",
    headers: _header,
    data: _params,
    success: function(result) {
      for (x in result["items"]) {
        var roomId = result["items"][x].id;
        var roomName = result["items"][x].title;

        if (roomName.length > 30) {
          roomName = roomName.substring(0, 30);
          roomName += "...";
        } // if
        var temp = new Object( );
        temp.id = roomId;
        temp.name = roomName;
        ROOM_LIST[ROOM_LIST.length] = temp;
        //console.log(roomName);
        var option = document.createElement("option");
        option.text = roomName;
        select.add(option);
      } // for
    } // function
  }); // jQuery.ajax
} // GetRooms

document.getElementById("roomBut").onclick = GetRoomParticipants;
document.getElementById("nextfacebutton").onclick = NextRFace;
document.getElementById("removefacebutton").onclick = RemoveCurrentRFace;

CheckNShow( );
GetRooms( );
