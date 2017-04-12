function reset_rover_positions() {
   for(var nn=0; nn <num_rovers;nn++) {
         rovers[nn].reset_position();
   } //end of loop
}

function update_rovers() {
   for(var i=0; i <num_rovers;i++) {
       rovers[i].get_sensor_data();
       rovers[i].think();
       rovers[i].move();
       rovers[i].get_reward();
       rovers[i].draw();
   }
}
 
function Rover(id) {
    this.id = id;
    lox = Math.floor(myGameArea.canvas.width*.40);
    hix = Math.floor(myGameArea.canvas.width*.60);
    this.x = getRandomInt(lox,hix);

    loy = Math.floor(myGameArea.canvas.height*.40);
    hiy = Math.floor(myGameArea.canvas.height*.60);
    this.y = getRandomInt(loy,hiy);
    this.r = 15;
    this.color = 'red';
    this.num_sensors = 3;
    this.velocity = 1.0;
    this.sensor_length = this.r+15
    this.delta_radians = (2.0*Math.PI)*(1.0/12.0)
    this.epxs = [];
    this.epys = [];
    this.state = [];
    this.sensor_data = [];
    this.reward = 0.0;
    this.angle = Math.random() * 2.0 * Math.PI;
    this.dx = this.velocity * Math.cos(this.angle);
    this.dy = this.velocity * Math.sin(this.angle);

    this.reset_position = function() {
        lox = Math.floor(myGameArea.canvas.width*.40);
        hix = Math.floor(myGameArea.canvas.width*.60);
        this.x = getRandomInt(lox,hix);

        loy = Math.floor(myGameArea.canvas.height*.40);
        hiy = Math.floor(myGameArea.canvas.height*.60);
        this.y = getRandomInt(loy,hiy);
        this.angle = Math.random() * 2.0 * Math.PI;
        this.velocity = 1.0;
    }

    this.think = function() {
        this.angle = brains[this.id].think(this.state);
        //console.log('rover think state, back angle ',this.state,this.angle);

    }
   
   this.wtf = function() {
       console.log('wtf');
   } 
    this.move = function() {
        this.dx = this.velocity * Math.cos(this.angle)
        this.dy = this.velocity * Math.sin(this.angle)
        this.x += this.dx;
        this.y += this.dy;
    }

    this.draw = function() {
        ctx = myGameArea.context;
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r,0,2*Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#003300';
        for (s=0;s< this.num_sensors;s++) {
          shift = s-1;
          tangle = this.angle + (shift*this.delta_radians);
          y2 = this.sensor_length*Math.sin(tangle)
          x2 = this.sensor_length*Math.cos(tangle)
          ctx.moveTo(this.x,this.y)
          this.epxs[s]  = this.x + x2
          this.epys[s]  = this.y + y2
          ctx.lineTo(this.epxs[s],this.epys[s])
        } //end of loop on sensors

        ctx.stroke();
        ctx.closePath();
     } //end of rover draw 


      this.get_sensor_data= function() {
          this.state = [0,0,0,0,0,0,0,0,0];
      //food
      for (s=0;s<this.num_sensors;s++) {
           this.state[s] = 0
           for (i = 0;i<num_foods;i++) {
             f = foods[i];
             dist = Math.hypot((f.x-this.epxs[s]),(f.y-this.epys[s]));
             test = f.r ;
             if (dist <= test) {
              this.state[s] = 1
             } //end of if
           } //end of loop on food

         //now for borders
         this.state[3+s] = 0;
         if (this.epxs[s] > myGameArea.canvas.width-2 || this.epxs[s] < 5) {
            this.state[3+s] = 1;
         }
         if (this.epys[s] > myGameArea.canvas.height-2 || this.epys[s] < 5) {
            this.state[3+s] = 1;
         }
         //other rovers !!!
           for (ix = 0;ix<num_rovers;ix++) {
             if (ix != this.id) {
               rvr = rovers[ix];
               dist = Math.hypot((rvr.x-this.epxs[s]),(rvr.y-this.epys[s]));
               test = rvr.r ;
               if (dist <= test) {
                  this.state[6+s] = 1;
               } //end of if on dist test
            } //end of if on not me
           } //end of loop on rovers

        } //end of loop on sensors
    } //end of get_sensor_data function

    this.get_reward = function() {
        //food
        new_reward = 0;
        for (ij = 0;ij<num_foods;ij++) {
           dist = Math.hypot((foods[ij].x-this.x),(foods[ij].y-this.y));
           test = foods[ij].r + this.r;
           //console.log('dist,test',dist,test);
           if (dist <= test) {
                new_reward += 15;
          //      foods[ij].r += -1;
           } //end of if
         } //end of loop on food

       //now for borders
       if (this.x > myGameArea.canvas.width-5 || this.x < 5) {
         if( this.velocity > 0.0) {
           this.reward += -10;
           this.velocity = 0.0;
         }
       }
       if (this.y > myGameArea.canvas.height-2 || this.y < 5) {
         if (this.velocity > 0.0) {
           new_reward+= -10;
           this.velocity = 0.0;
         }
       } //end of if

      for (ir = 0;ir<num_rovers;ir++) {
         if (ir != this.id) {
           dist = Math.hypot((rovers[ir].x-this.x),(rovers[ir].y-this.y));
           test = rovers[ir].r + this.r;
           if (dist <= test) {
                new_reward += -2;
           } //end of if on dist test
          } //end of if on not me
       } //end of loop on rovers

       if (new_reward < 1 ) {
           new_reward = -1;
       }
       this.reward = new_reward;

     
    } //end of reward
} //end of Rover function  

function make_rovers(num_rovers) {
    for(i = 0;i<num_rovers;i++) {
        
        rovers[i] = new Rover(i);
    }
}//end of function make_rovers

