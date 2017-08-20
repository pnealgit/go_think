
Rover.prototype.make_sensors = function() {
console.log("num sensors : ",this.num_sensors);

    for (var ns = 0; ns < this.num_sensors; ns++) {
        var s = new Sensor();
        this.sensors.push(s);
    }
} //end of make_sensors

function Sensor() {
      this.xpos = 0;
      this.ypos = 0;
} //end of sensor 

Rover.prototype.set_sensor_positions = function() {


    var tangle = this.angle- this.delta_radians;
    var sensor_spacing = this.antenna_length / this.num_sensors_per_antenna;
    var knt = 0;
    var sr = this.r+this.antenna_length;
    //going from the end in
    for (var is=0;is<this.num_sensors_per_antenna;is++) {
      sr -= sensor_spacing * is;
      for (var ia =0;ia<this.num_antennae;ia++) {
        //going towards center so first num_antennas are the ends of antennas
        this.sensors[knt].ypos = this.y + (sr * Math.sin(tangle));
        this.sensors[knt].xpos = this.x + (sr * Math.cos(tangle));
        tangle += this.delta_radians;
        knt++;
      } 
    }
} 

Rover.prototype.get_sensor_data = function(id) {
    this.state = [];

    var status = 0;
    //food 
    for (var s=0;s<this.num_sensors;s++) {
        status = 0;
        xp = this.sensors[s].xpos;
        yp = this.sensors[s].ypos;
        status = check_food(xp,yp);
        this.state.push(status);
    } //end of loop on sensors

    //other rovers
    for (var s=0;s<this.num_sensors;s++) {
        xp = this.sensors[s].xpos;
        yp = this.sensors[s].ypos;
        status = check_other_rovers(id,xp,yp);
        this.state.push(status);
    } //end of loop on sensors


    //now for borders
    for (var ss =0;ss<this.num_sensors;ss++) {
        status = 0;
        s = this.sensors[ss]; 
        if ((s.xpos > myGameArea.canvas.width - 2 || s.xpos< 5) || (s.ypos > myGameArea.canvas.height - 2 || s.ypos < 5)) {
            status = 1;
        }
        this.state.push(status);
    } //end of loop on sensors
    this.state.push(this.x/width)
    this.state.push(this.y/height)
}
//end of get_sensor_data function



function check_food(xp,yp) {
        var status = 0;
        for (var i = 0; i < num_foods; i++) {
            f = foods[i];
            test = f.r;
            dist = Math.hypot((f.x - xp), (f.y - yp));
            if (dist <= test) {
                status = 1;
                break;
            } //end if food if
        } //end of loop on food
        return status;
}

function check_other_rovers(id,xp,yp) {
        var status = 0;
        for (var i = 0; i < num_rovers; i++) {
           if(i != id) { 
            rvr = rovers[i];
            test = rvr.r;
            dist = Math.hypot((rvr.x - xp), (rvr.y - yp));
            if (dist <= test) {
                status = 1;
                break;
            } //end of if on distance
           } //end of if on not same rover
        } //end of loop on rovers
        return status;
}

