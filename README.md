# go_think
This is a variant of the 'think' repository. It has a go backend where every genome has
a concurrent neural network.

It stil is not working... A few more days ... 

April 28,2017 - Finally figured out unmarshalling. Threw all the setup
code into the 'onopen' for the websocket. 

Things to do:

1. Get the genomes generated on the Go side
2. Get the neural network weights generated on the Go side
3. Get the select/crossover working on the Go side
4. Get the mutation working on the Go side
5. Get the 'Think' working that sends back the angle to the rover.

April 29,2017 - Ok. Got everything working. At least I get an 'angle' back.

Things to do:

1. Get a line graph going to compare sum of rewards at each epoch

OOOPS !! Sort is fucked up. Gotta fix that ...grr - hate select and crossover


May 2, 2017 Cleaned up some code. Made select work. checked make_new_weights

May 12, 2017 Still not converging. Threw out crossover. Made separate file 
    do_updates.go for some of the code

May 20, 2017 Did a lot of work. Move from a GA to the cross-entropy method. Pretty printed the go files. Messed with the rewards. Made the food a circle.

August 9, 2017.. In the last few weeks:

    1. Shortened the sensor range
    2. Added in x,y data to the environment
    3. Other stuff. 
    
August 20, 2017 Broke out some code into new modules

