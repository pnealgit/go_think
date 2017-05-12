
var Team = function (color,num_rovers,num_inputs,num_hidden,num_outputs) {
    console.log('make ',color,' go team');
    this.team_name = "make_"+color+'_team';
    this.color = color;
    this.num_rovers = num_rovers;
    this.num_inputs = num_inputs;
    this.num_hidden = num_hidden;
    this.num_outputs = num_outputs;
} //end of function

function make_rovers(team) {
    console.log('make_rovers',team.color);
    rovers = [];
    for(var ri = 0;ri<team.num_rovers;ri++) {
        rovers[ri] = new Rover(ri);
    }
    return rovers;
}//end of function make_rovers

function Rover(id) {
    this.id = id;
    this.x = width/2;
    this.y = height/2;
    this.r = 15;
    this.num_sensors = 3;
    this.velocity = 2.0;
    this.sensor_length = this.r+15
    this.delta_radians = (2.0*Math.PI)*(1.0/12.0)
    this.epxs = [];
    this.epys = [];
    this.state = [];
    this.old_state = [];
    this.sensor_data = [];
    this.reward = 0.0;
    this.angle = Math.random() * 2.0 * Math.PI;
    this.dx = this.velocity * Math.cos(this.angle);
    this.dy = this.velocity * Math.sin(this.angle);

    this.move = function() {
        this.dx = this.velocity * Math.cos(this.angle)
        this.dy = this.velocity * Math.sin(this.angle)
        this.x += this.dx;
        this.y += this.dy;
    }

    this.draw = function(color) {
        ctx = myGameArea.context;
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r,0,2*Math.PI);
        ctx.fillStyle = color;
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

} //end of Rover function


Rover.prototype.get_sensor_data= function() {
      this.state = [0,0,0,0,0,0,0,0];
      //food
      for (s=0;s<this.num_sensors;s++) {
           for (i = 0;i<num_foods;i++) {
             f = foods[i];
             dist = Math.hypot((f.x-this.epxs[s]),(f.y-this.epys[s]));
             test = f.r ;
             if (dist <= test) {
              this.state[s] = 1;
             }
           } //end of loop on food

         //now for borders
         if (this.epxs[s] > myGameArea.canvas.width-2 || this.epxs[s] < 5) {
            this.state[s+3] = 1;
         }

         if (this.epys[s] > myGameArea.canvas.height-2 || this.epys[s] < 5) {
            this.state[s+3] = 1;
         }
        } //end of loop on sensors
      this.state[6] = this.x
      this.state[7] = this.y

      return this.state;
    } //end of get_sensor_data function

function update_rovers(team,rovers) {

   all_rovers = {};
   all_rovers['status']  = team.color + "_team_state";
   all_rovers['color'] = team.color;
   all_recs = [] ;
   for(var i=0; i <team.num_rovers;i++) {
      if (rovers[i].state.length > 0) {
           rovers[i].old_state = rovers[i].state;
      } else {
          rovers[i].old_state = [0,0,0,0,0,0];
      }
       rovers[i].state = rovers[i].get_sensor_data();
       my_data = {};
       my_data['id'] = i;
       rrr = rovers[i].get_reward();

       junk = []
       junk =  junk.concat(rovers[i].state,rovers[i].old_state)

       my_data['state'] = junk
       my_data['reward'] = rrr

       all_recs.push(my_data);
       rovers[i].reward += rrr;
       rovers[i].move();
       rovers[i].draw(team.color);
   } //end of loop on rovers
      
   all_rovers['all_recs'] = all_recs; 
   senddata(all_rovers);
   
} //end of function 

Rover.prototype.get_reward = function() {
        //food
        no_change = true;
        new_reward = 0;
        for (ij = 0;ij<num_foods;ij++) {
           dist = Math.hypot((foods[ij].x-this.x),(foods[ij].y-this.y));
           test = foods[ij].r + this.r;
           if (dist <= test) {
                new_reward += 1;
                no_change = false;
           } //end of if
         } //end of loop on food

       //now for borders
       if (this.x > myGameArea.canvas.width-5 || this.x < 5) {
         if( this.velocity > 0.0) {
           //new_reward += -1;
           no_change = false;
           this.velocity = 0.0;
         }
       }
       if (this.y > myGameArea.canvas.height-2 || this.y < 5) {
         if (this.velocity > 0.0) {
           //new_reward+= -1;
           no_change = false;
           this.velocity = 0.0;
         }
       } //end of if
       return new_reward;
} //end of get_reward

   
function reset_rover_positions(rovers) {
   sum = 0;
   for(var nn=0; nn <num_rovers;nn++) {
         sum+= rovers[nn].reward;
         rovers[nn].reset_position();
         rovers[nn].reward = 0;
   } //end of loop
   return sum;
}

 

Rover.prototype.reset_position = function() {
        lox = Math.floor(30);
        hix = Math.floor(width-30);
        this.x = getRandomInt(lox,hix);
        this.x = width/2;

        loy = Math.floor(30);
        hiy = Math.floor(height-30);
        this.y = getRandomInt(loy,hiy);
        this.y = height/2;

        this.angle = Math.random() * 2.0 * Math.PI;
        this.velocity = 2.0;
    }

 
