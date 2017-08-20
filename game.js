var ws
var pause = false
function get_new_radians(angle_rec) {
    //angle_rec.Angle is actually an index

    var nn_index = angle_rec.Angle
    var id       = angle_rec.Id;
    var rover_angle = rovers[id].angle;
    var rover_delta_radians = rovers[id].delta_radians;
    var cr = 2.0*Math.PI;
    var delta_rad = 0;

    if (nn_index == 0) {
        //do nothing;
        delta_rad = 0;
    }

    if (nn_index == 1) {
        //do go left
        delta_rad = rover_delta_radians;
    }
    if (nn_index == 2) {
        //do go right
        delta_rad = -1.0 * rover_delta_radians;
    }

    new_angle = rover_angle + delta_rad;
//console.log("NN",nn_index,"rover angle: ",rover_angle,"  delta_rad",delta_rad," new angle ",new_angle);

    if(new_angle > cr) {
       new_angle = new_angle - cr;
    }
    if(new_angle < 0) {
      new_angle = (cr - (Math.abs(new_angle) % cr) )
    }
    //console.log("AFTER NEW ANGLE: ",new_angle)
    return new_angle;
} //end of function

function WebsocketStart() {

    ws = new WebSocket("ws://localhost:8081/talk")

    ws.onopen = function(evt) {
      senddata('CONNECTION MADE');
      setup();
      myGameArea.start(); 
    }
    ws.onclose = function(evt) {
      console.log('WEBSOCKET CLOSE');
      myGameArea.stop();
      //ws = null;
    }

    ws.onmessage = function(e) {
      n = e.data.indexOf("Angles");
      if (n != -1 ) {
         var response = JSON.parse(e.data)
         angles = response.Angle_records
         for (var iang=0;iang < angles.length;iang++) {
            angle_rec = angles[iang] 
            rovers[angle_rec.Id].angle = get_new_radians(angle_rec);
          } //end of loop on iang
      } //end of found 'angle'
    } //endo of onmessage


    ws.onerror = function(evt) {
        console.log('onerror ',evt.data);
    }

} //end of WebsocketStart

senddata = function(data) {
    if (pause) {
      return;
    }
    if (!ws) {
        console.log('cannot send data -- no ws');
        return false;
    }
    stuff = JSON.stringify(data);
    ws.send(stuff);
} //end of function senddata

function setup() {
    make_foods(num_foods);
    reset_food_positions();
    team = new Team(num_rovers,num_inputs,num_hidden,num_outputs);
    console.log("TEAM: ",team)
    senddata(team);
    rovers = make_rovers(team);
console.log("rovers: ",rovers)

    console.log('after making rovers');
    episode_knt = 0;
    num_episodes = 0;

} //end of setup
    
function updateGameArea() {
    if (pause) {
       return
    }
    if (episode_knt >= 580) {
       var mydata = {};
       reset_rover_positions(rovers);
       mydata['num_episodes'] =  num_episodes;
       senddata(mydata);
       episode_knt = 0;
       reset_food_positions();
       num_episodes++;

} //end of if on episode_knt

    myGameArea.clear();
    update_rovers(team,rovers);
    update_foods();
    episode_knt+= 1;
} //end of updateGameArea

myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.millis = 75;  //game intervale milliseconds
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        pause = false;
        this.interval = setInterval(updateGameArea,this.millis);
    },  
    stop : function() {
        pause = true; 
        console.log("STOP !!! ");
        clearInterval(this.interval);
        //ws.close();
    },  
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = "rgba(255,255,255,255)";
        this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
    } 
}    //end of gamearea


