var ws
var pause = false
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
      //console.log('MESSAGE -- ',e.data);
      n = e.data.indexOf("Angles");
      if (n != -1 ) {
         var response = JSON.parse(e.data)
         angles = response.Angle_records
         for (var iang=0;iang < angles.length;iang++) {
            angle = angles[iang] 
            if (response.Color == "red") {
             red_rovers[angle.Id].angle = angle.Angle;
            } else {
             red_rovers[angle.Id].angle = angle.Angle;
            } //end of if
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
    red_team = new Team('red',num_rovers,num_inputs,red_num_hidden,num_outputs);
    senddata(red_team);
    blue_team = new Team('blue',num_rovers,num_inputs,blue_num_hidden,num_outputs);
    senddata(blue_team);
    red_rovers = make_rovers(red_team);
    blue_rovers = make_rovers(blue_team);
    console.log('after making rovers');
    episode_knt = 0;
    num_episodes = 0;

} //end of setup
    
function updateGameArea() {
    if (pause) {
       return
    }
    if (episode_knt >= 280) {
       mydata = {};
       red_sum = reset_rover_positions(red_rovers);
       blue_sum = reset_rover_positions(blue_rovers);
       mydata['num_episodes'] =  num_episodes;
       senddata(mydata);
       episode_knt = 0;
       console.log("red sum: ",red_sum, "blue sum: ",blue_sum);
       reset_food_positions();
       num_episodes++;

} //end of if on episode_knt

    myGameArea.clear();
    update_rovers(red_team,red_rovers);
    update_rovers(blue_team,blue_rovers);
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


