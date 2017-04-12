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
    this.x = getRandomInt(50,myGameArea.canvas.width-50);
    this.y = getRandomInt(50,myGameArea.canvas.height-50);
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
        lox = 50;
        hix = Math.floor(myGameArea.canvas.width-50);
        this.x = getRandomInt(lox,hix);
        loy = 50;
        hiy = Math.floor(myGameArea.canvas.height-50);
        this.y = getRandomInt(loy,hiy);
    }


} //end of food function  

function make_foods(num_foods) {
    for(i = 0;i<num_foods;i++) {
        foods[i] = new Food(i*50,i*40);
    }
}//end of function make_foods

