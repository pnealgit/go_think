function reset_food_positions() {
   for(var fnn=0; fnn <num_foods;fnn++) {
         foods[fnn].reset_position();
   } //end of loop
}


function update_foods() {
   for(var ik=0; ik <num_foods;ik++) {
       foods[ik].update();
   }
}
 
function Food(x,y) {

    this.x = x;
    this.y = y;
    this.r = 15;
    this.color = 'green';

    this.update = function() {
        ctx = myGameArea.context;
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r,0,2*Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#ff0000';
        ctx.stroke();
        ctx.closePath();
     } //end of food update

    this.reset_position = function() {
      //this.r = 15;
    } //end of reset

} //end of food function  

function make_foods(num_foods) {
 
    x = 0;
    y = 0;
    centerx = width/2
    centery = height/2
    circ_radius = 100
 
    w = width-100;
    h = height-100;
    r = 15; //radius of food

    delta_radians = (2.0*Math.PI)*(1.0/num_foods)
    fangle = 0;
    for (var fknt =0;fknt<num_foods;fknt++) {
        py = centery + circ_radius*Math.sin(fangle)+Math.random()*2.0
        px = centerx + circ_radius*Math.cos(fangle)+Math.random()*2.0
        foods[fknt] = new Food(px,py);
        fangle += delta_radians
    }
}//end of function make_foods

