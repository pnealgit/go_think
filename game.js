var ws
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
      ws = null;
    }

    ws.onmessage = function(e) {
      //console.log('MESSAGE -- ',e.data);
      n = e.data.indexOf("Angle");
      if (n != -1 ) {
         var response = JSON.parse(e.data)

         if (response.Color == "red") {
             red_rovers[response.Id].angle = response.Angle;
         } else {
             blue_rovers[response.Id].angle = response.Angle;
         }
      } //end of found 'angle'
    } //endo of onmessage


    ws.onerror = function(evt) {
        console.log('onerror ',evt.data);
    }

} //end of WebsocketStart

senddata = function(data) {
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
    if (episode_knt >= 150) {
       mydata = {};
       mydata['num_episodes'] =  num_episodes;
       senddata(mydata);
       num_episodes++;
       episode_knt = 0;
       reset_rover_positions(red_rovers);
       reset_rover_positions(blue_rovers);
       reset_food_positions();
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
        console.log('in game area start');
        this.millis = 50;  //game intervale milliseconds
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        pause = false;
        console.log('before interval millis ',this.millis);
        this.interval = setInterval(updateGameArea,this.millis);
        console.log('interval is ',this.interval);
    },  
    stop : function() {
        pause = true; 
        console.log("STOP !!! ");
alert("STOPPPPPP")
        clearInterval(this.interval);
        ws.close();
    },  
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = "rgba(255,255,255,255)";
        this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
    }   
}    //end of gamearea


