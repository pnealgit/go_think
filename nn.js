//brains = [];
function make_brains() {
   console.log('nn make_brains ',genomes);

   for(var i=0;i<num_rovers;i++) {
       brain = new Brain(i);
       brains[i] = brain;
   } //end of loop
} //end of function

function make_new_weights() {
   for(var ii = 0; ii < num_rovers;ii++) {
       brains[ii].make_weight_matrices();
   }
} //end of function
 
function Brain(i) {
    this.id = i;
    this.num_inputs = num_inputs;
    this.num_hidden = num_hidden;
    this.num_outputs = num_outputs;
    this.input_layer = [];
    this.hidden_layer = [];
    this.output_layer = [];
    this.input_to_hidden_weights = [];
    this.hidden_to_output_weights = [];

    this.make_weight_matrix = function(k,from_length,to_length) {
        g = genomes[this.id];
        new_mat = [];
        for (i = 0;i<from_length;i++) {
           junk = [];
           for (j = 0;j<to_length;j++) {
              junk[j] = g[k];
              k+= 1;
           } //end of loop on inputs
       new_mat[i] = junk;
       }//end of loop 
       return new_mat;
    } //end of function

    this.make_weight_matrices = function() {
        k = 0; 
        this.input_to_hidden_weights = 
           this.make_weight_matrix(k,this.num_inputs,this.num_hidden);

        k = this.num_inputs*this.num_hidden;
        this.hidden_to_output_weights = 
           this.make_weight_matrix(k,this.num_hidden,this.num_outputs);

    } //end of this.make_weight_matrices

    this.make_weight_matrices();

    this.make_layer = function(from_layer,from_to_weight_matrix) {
        //from layer is 1 x c
        //from_to_weight_matrix is c x x
        //new_layer is 1 x x
        new_layer = [];
        to_len = from_to_weight_matrix[0].length;
        from_len = from_layer.length;
        //console.log('from len',from_len,' to_len ',to_len);

        for(i=0;i<to_len;i++) {
            sum = 0.0;
            for(j=0;j<from_len;j++) {
                sum += from_layer[j] * from_to_weight_matrix[j][i];
            }
            new_layer[i] =  1.0/(1.0+Math.exp(-1.0*sum))
        } //end of loop on i
    
        return new_layer
    } //end of make_layer


    this.think = function(state) {
        //console.log('nn think state',state);
        this.input_layer = state;
        this.hidden_layer = this.make_layer(this.input_layer,this.input_to_hidden_weights);

        //console.log('hidden layer',this.hidden_layer); 
        this.output_layer = this.make_layer(this.hidden_layer,this.hidden_to_output_weights);
        //console.log('output layer ',this.output_layer);
        new_angle = this.output_layer[0]* Math.PI*2.0;
        //console.log("NN ANGLE = ",new_angle )
        return  new_angle;
} //end of think

} //end of brain object

