
function Genome() {
    gl = (num_inputs * num_hidden) + (num_hidden * num_outputs);
    genome = []
    for (j = 0;j<gl;j++) {
        genome[j] = getRandomFloat(-2,2);
    } //end of loop on j
    return genome;
}

function make_genomes(num_rovers) {
    for(var ii = 0;ii<num_rovers;ii++) {
        genomes[ii] = new Genome();
    }
}//end of function make_genomes

function select_genomes() {
    //console.log('select gneomes',genomes);
    var keys = [];
    new_genomes = [];
    keys = make_rewards();
    spot = 2;
    for(i=0;i<spot;i++) {
      iz = keys[i];
      new_genomes[i] = genomes[iz];
    }
    //like to fuck sexual reproduction -- just crank up mutation
    for (kk = spot;kk<num_rovers;kk++) {
        i1 = getRandomInt(0,5);
        i2 = getRandomInt(0,5);
        newbies = [];
        newbies = crossover(genomes[keys[i1]],genomes[keys[i2]]);
        new_genomes[kk] = newbies[0];
    }
    genomes = new_genomes;
} //end of select_genomes

function crossover(p1,p2) {
        cspot = Math.floor(p1.length/2);
        c1 = []
        c2 = []
        c1a = p1.slice(0,cspot)
        c1b = p1.slice(cspot);
        c2a = p2.slice(0,cspot)
        c2b = p2.slice(cspot);
        c1 = c1a.concat(c2b);
        c2 = c2a.concat(c1b);
        return [c1,c2];
    } //end of crossover

function make_rewards() {
    var sum = 0.0;
    var rewards = {};
    var new_rovers = [];
    for (var iii = 0;iii<num_rovers;iii++) {
       rid = rovers[iii].id;
       rewards[rid] = rovers[iii].reward;
       sum += rovers[iii].reward;
       rovers[iii].reward = 0;
    } //end of loop on num_rovers
    console.log("SUM REWARDS: ",sum);

    skeys = getSortedKeys(rewards);
    //console.log("rewards: ",rewards," skeys ; ",skeys);
    
    return skeys;
} //end of function

function getSortedKeys(obj) {
        var keys = []; for(var key in obj) keys.push(key);
        return keys.sort(function(a,b){return obj[b]-obj[a]});
}


function mutate_genomes() {
 
     gl = genomes[0].length;
     for(var ik=2;ik<num_rovers;ik++) {
         spot = getRandomInt(0,gl);
         new_weight = getRandomFloat(-2,2);
         //g = genomes[ik];
         genomes[ik][spot] = new_weight;
         //genomes[i] = genome;
     } //end of loop on new_rovers
} //end of function

