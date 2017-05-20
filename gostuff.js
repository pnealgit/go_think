var Team = function(num_rovers, num_inputs, num_hidden, num_outputs) {
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
    this.x = width / 2 + getRandomInt(-2, 2);
    this.y = height / 2 + getRandomInt(-2, 2);
    this.r = 15;
    this.num_sensors = 8;
    this.velocity = 2.0;
    this.sensor_length = this.r + 20
    this.delta_radians = (2.0 * Math.PI) * (1.0 / this.num_sensors)

    this.epxs = [];
    this.epys = [];
    this.sensor_data = [];
    this.state = [];
    this.old_state = {};
    this.reward = 0.0;
    this.angle = 0.0
    this.last_food_x = 0.0;
    this.last_food_y = 0.0;

    this.dx = this.velocity * Math.cos(this.angle);
    this.dy = this.velocity * Math.sin(this.angle);

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

        //draw direction line
        tangle = this.angle;
        ctx.strokeStyle = '#0000FF';

        s = 0;
        y2 = this.sensor_length * Math.sin(tangle)
        x2 = this.sensor_length * Math.cos(tangle)
        ctx.beginPath();
        ctx.arc(this.x + x2, this.y + y2, 2, 0, 2 * Math.PI);
        ctx.fillStyle = "orange";
        ctx.fill();

        ctx.moveTo(this.x, this.y)
        this.epxs[s] = this.x + x2
        this.epys[s] = this.y + y2
        ctx.lineTo(this.epxs[s], this.epys[s])
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.strokeStyle = '#000000';

        for (s = 1; s < this.num_sensors; s++) {
            tangle += this.delta_radians;
            y2 = this.sensor_length * Math.sin(tangle)
            x2 = this.sensor_length * Math.cos(tangle)
            ctx.moveTo(this.x, this.y)
            this.epxs[s] = this.x + x2
            this.epys[s] = this.y + y2
            ctx.lineTo(this.epxs[s], this.epys[s])
        }
        //end of loop on sensors
        ctx.stroke();
        ctx.closePath();
    }
    //end of rover draw

}
//end of Rover function

Rover.prototype.get_sensor_data = function() {
    food_sensed = [0, 0, 0, 0, 0, 0, 0, 0]
    wall_sensed = [0, 0, 0, 0, 0, 0, 0, 0]

    //food 
    for (s = 0; s < this.num_sensors; s++) {
        for (i = 0; i < num_foods; i++) {
            f = foods[i];
            dist = Math.hypot((f.x - this.epxs[s]), (f.y - this.epys[s]));
            test = f.r;
            if (dist <= test) {
                food_sensed[s] = 1;
            }
        }
        //end of loop on food
    }
    //end of loop on sensors

    //now for borders
    for (s = 0; s < this.num_sensors; s++) {
        if ((this.epxs[s] > myGameArea.canvas.width - 2 || this.epxs[s] < 5) || (this.epys[s] > myGameArea.canvas.height - 2 || this.epys[s] < 5)) {
            wall_sensed[s] = 1;
        }
    }
    //end of loop on sensors

    this.state = food_sensed.concat(wall_sensed);
}
//end of get_sensor_data function

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

        rovers[i].get_sensor_data();

        //get a little reward for seeing food
        for (var isn = 0; isn < rovers[i].num_sensors; isn++) {
            my_data['reward'] += rovers[i].state[isn];
        }

        rrr = rovers[i].get_reward();
        rovers[i].state.push(rovers[i].last_food_x)
        rovers[i].state.push(rovers[i].last_food_y)

        my_data['state'] = rovers[i].state
        my_data['reward'] = rrr

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
    //food
    no_change = true;
    new_reward = 0;
    this.state[16] = 0;
    for (ij = 0; ij < num_foods; ij++) {
        dist = Math.hypot((foods[ij].x - this.x), (foods[ij].y - this.y));
        test = foods[ij].r + this.r;
        if (dist <= test) {
            new_reward += 30;
            no_change = false;
            this.last_food_x = this.x / width
            this.last_food_y = this.y / height
            this.state[16] = 1;
        }
        //end of if
    }
    //end of loop on food

    //now for borders
    if (this.x > myGameArea.canvas.width - 5 || this.x < 5) {
        if (this.velocity > 0.0) {
            new_reward += -2;
            no_change = false;
            this.velocity = 0.0;
        }
    }
    if (this.y > myGameArea.canvas.height - 2 || this.y < 5) {
        //if (this.velocity > 0.0) {
        new_reward += -2;
        no_change = false;
        this.velocity = 0.0;
        //}
    }
    //end of if

    if (no_change) {//    new_reward+= -1
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
    this.x = width / 2 + getRandomInt(-2, 2);
    this.y = height / 2 + getRandomInt(-2, 2);
    junk = getRandomInt(0, 4)
    this.angle = junk * Math.PI / 2;
    this.velocity = 2.0;
}

