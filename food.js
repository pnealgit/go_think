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
      //this.x = start + (ix*deltax);
      //this.y = start + (iy*deltay);
      //this.r = 15;
    } //end of reset

} //end of food function  

Food.prototype.make_food_cells = function (num_foods) {
    //this will fall apart depending on 
    // num foods and size of window
    for(var ixc = 0;ixc<10;ixc++) {
        cc = []; 
        for(var ixy = 0;ixy<10;ixy++) {
          cc[ixy] = false;
        }
        this.food_cells[ixc] = cc;
    }
    console.log('food cells', this.food_cells);

} //end of make_food_cells
    
num_foods = 40;
 
function make_foods(num_foods) {
 
    x = 0;
    y = 0;
     
    w = width;
    h = height;
    //divide area into 40 cells and put a food 
    // in the middle of each  cell up to the limit of numfoods
    r = 15; //radius of food
    start = (2*r)+10; //adjust for radius of food
    deltax = (w-start) /8;
    deltay = (h-start) /5;
    console.log('w,h,dx,dy',w,h,deltax,deltay);
 
    fknt = 0;
    for(ix = 0;ix<8;ix++) {
    px = start + (ix*deltax);
    for(iy = 0;iy<5;iy++) {
      py = start + (iy*deltay);
      foods[fknt] = new Food(px,py);
      fknt++;
    }
    }
}//end of function make_foods

