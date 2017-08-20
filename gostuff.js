var Team = function(num_rovers,num_inputs,num_hidden,num_outputs) {
    this.team_name = "make_team";
    this.num_rovers = num_rovers;
    this.num_inputs = num_inputs;
    this.num_hidden = num_hidden;
    this.num_outputs = num_outputs;
}
//end of function

function make_rovers(team) {
    rovers = [];
    for (var ri = 0; ri < team.num_rovers; ri++) {
        rovers[ri] = new Rover(ri);
    }
    reset_rover_positions(rovers)
    return rovers;
}
//end of function make_rovers

function Rover(id) {
    this.id = id;
    this.x = width / 2 + getRandomInt(-5, 5);
    this.y = height / 2 + getRandomInt(-5, 5);
    this.r = 10;
    this.sensors = [];
    this.num_antennae = 3;
    this.num_sensors_per_antenna = 2;
    this.num_sensors = this.num_antennae * this.num_sensors_per_antenna;
    this.velocity = 2.0;
    this.antenna_length =  10
    //this.delta_radians = (2.0 * Math.PI) * (1.0 / this.num_sensors)
    this.delta_radians =  Math.PI/4.0

    this.state = [];
    this.reward = 0.0;
    this.angle = 2.0*Math.PI * Math.random();
    this.last_food_x = 0.0;
    this.last_food_y = 0.0;

    this.dx = this.velocity * Math.cos(this.angle);
    this.dy = this.velocity * Math.sin(this.angle);
    this.make_sensors();

    this.move = function() {
        this.dx = this.velocity * Math.cos(this.angle)
        this.dy = this.velocity * Math.sin(this.angle)
        this.x += this.dx;
        this.y += this.dy;
    }

    this.draw = function() {
        ctx = myGameArea.context;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = '#000000';
        tangle = this.angle- this.delta_radians;
       
        this.set_sensor_positions();
	for (var s=0;s<this.num_antennae;s++) {
            ctx.moveTo(this.x,this.y);
            ctx.lineTo(this.sensors[s].xpos, this.sensors[s].ypos)
        }
        //end of loop on sensors
        ctx.stroke();
        ctx.closePath();
    }
    //end of rover draw
}
//end of Rover function

function update_rovers(team, rovers) {

    all_rovers = {};
    all_rovers['status'] = "state";
    all_recs = [];

    best_score = -9999.9
    worst_score = 99999.9

    for (var i = 0; i < team.num_rovers; i++) {
        my_data = {};
        my_data['id'] = i;
        my_data['reward'] = 0;

        rovers[i].get_sensor_data(i);
        rrr = rovers[i].get_reward();
        my_data['state'] = rovers[i].state;
        my_data['reward'] = rrr

        //console.log('my_data state',my_data.state);

        all_recs.push(my_data);
        rovers[i].reward += my_data['reward'];
        rovers[i].move();
        rovers[i].draw();
    }
    //end of loop on rovers

    all_rovers['all_recs'] = all_recs;
    senddata(all_rovers);
}
//end of function 

Rover.prototype.get_reward = function() {

    //first num_sensors are food
    //second num_sensors are other rovers
    //third num_sensors are walls

    //food
    no_change = true;
    new_reward = 0;
    for (ij = 0; ij < num_foods; ij++) {
        dist = Math.hypot((foods[ij].x - this.x), (foods[ij].y - this.y));
        test = foods[ij].r + this.r;
        if (dist <= test) {
            new_reward += 50;
            no_change = false;
        }
        //end of if
    }
    //end of loop on food

    //if hit another rover
      test =  this.r*2.0;
      for (var rk=0;rk<rovers.length;rk++) {
       if (rk != this.id) {
        dist = Math.hypot((rovers[rk].x - this.x), (rovers[rk].y - this.y));
        if (dist <= test) {
            new_reward -= 1;
            no_change = false;
        }
       } //end of if on not self
     } //end of loop on other rovers
            

    //now for borders
    if (this.x > myGameArea.canvas.width - 5 || this.x < 5) {
        if (this.velocity > 0.0) {
            new_reward += -2;
            no_change = false;
            this.velocity = 0.0;
        }
    }
    if (this.y > myGameArea.canvas.height - 2 || this.y < 5) {
        if (this.velocity > 0.0) {
            new_reward += -2;
            no_change = false;
            this.velocity = 0.0;
        }
    }
    //end of if

    if (no_change) {
        new_reward+= 1;
    }
    return new_reward;
}
//end of get_reward

function reset_rover_positions(rovers) {
    sum = 0;
    best = -9999;
    worst = 9999;

    for (var nn = 0; nn < num_rovers; nn++) {
        rovers[nn].reset_position();

        r = rovers[nn].reward;
        if (r > best) {
            best = r;
        }
        if (r < worst) {
            worst = r;
        }
        sum += r
        rovers[nn].reward = 0;
    }
    //end of loop
    console.log("SUM: \t", sum, "\tBEST:\t", best, "\tWORST:\t", worst);
}

Rover.prototype.reset_position = function() {
    this.x = width / 2 + getRandomInt(-5, 5);
    this.y = height / 2 + getRandomInt(-5, 5);
    junk = getRandomInt(0, 4)
    this.angle = junk * Math.PI / 2;
    this.velocity = 2.0;
}

