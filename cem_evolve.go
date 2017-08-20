package main

//cross-entropy method optimisation


import (
	"fmt"
	"math"
	"math/rand"
	"sort"
	"time"
)

func getRandomFloat64(min float64, max float64) float64 {
	return 0.0 + (rand.Float64() * (max - min)) + min
}

func getRandomInt(min int, max int) int {
	return rand.Intn(max-min) + min
}

func select_genomes(team Team) {
	var learn_rate float64
	learn_rate = .20
	sum := 0
	fmt.Println("sum ", sum)
	for ir := 0; ir < team.Num_rovers; ir++ {
		sum += team.Rovers[ir].Score
	}
	fmt.Println("sum ", sum)

	sort.Sort(ScoreSorter(team.Rovers))
	fmt.Println("BEST SCORE ", team.Rovers[0].Score)
	fmt.Println("WRST SCORE ", team.Rovers[team.Num_rovers-1].Score)
	for ir := 0; ir < team.Num_rovers; ir++ {
		team.Rovers[ir].Score = 0
	}

	elite_cut := int(float32(len(team.Rovers)) * .3)
	fmt.Println("elite cut is : ", elite_cut)

	glen := len(team.Rovers[0].Genome)
	for ig := 0; ig < glen; ig++ {
		m := 0.0
		s := 0.0
		mold := 0.0
		n := 0.0
		x := 0.0
		for ie := 0; ie < elite_cut; ie++ {
			n++
			x = float64(team.Rovers[ie].Genome[ig])
			m = mold + (x-mold)/n
			s = s + (x-mold)*(x-m)
			mold = m
		} //end of loop on ie

		s = s / (n - 1.0)
		sd := math.Sqrt(s)
		if sd < .5 {
			sd = 2.0 * rand.NormFloat64()
			//fmt.Println("oops ig,m,sd,s now: ",ig,m,sd,s)
		}
		for iall := 0; iall < team.Num_rovers; iall++ {
			new_g := rand.NormFloat64()*sd + m
			old_g := team.Rovers[iall].Genome[ig]
			team.Rovers[iall].Genome[ig] = (1.0-learn_rate)*old_g + learn_rate*new_g
		} //end of loop on iall
	} //end of loop on ig
} //end of select

func mutate_genomes(team Team) {
	num_spots := len(team.Rovers[0].Genome)
	for im := 4; im < team.Num_rovers; im++ {
		team.Rovers[im].Genome = team.Rovers[0].Genome
		for ispot := 0; ispot < num_spots; ispot++ {
			team.Rovers[im].Genome[ispot] = rand.NormFloat64() *
				team.Rovers[im].Genome[ispot]
		} //end of loop on ispot
	} //end of loop on num_rovers

	for isk := 0; isk < team.Num_rovers; isk++ {
		team.Rovers[isk].Score = 0
	}
} //end of mutate func

func make_new_weights(team Team) {

	for i := 0; i < team.Num_rovers; i++ {
		index := 0
		var new_weights [][]float64
		new_weights = make_weight_matrix(team.Rovers[i].Genome, 0, team.Num_inputs, team.Num_hidden)

		team.Rovers[i].Input_hidden_weights = new_weights

		//RNN got an extra hidden layer---
		index = team.Num_inputs * team.Num_hidden
		team.Rovers[i].Hidden_hidden_weights =
			make_weight_matrix(team.Rovers[i].Genome, index, team.Num_hidden, team.Num_hidden)

		index += team.Num_hidden * team.Num_hidden
		team.Rovers[i].Hidden_output_weights =
			make_weight_matrix(team.Rovers[i].Genome, index, team.Num_hidden, team.Num_outputs)

	} //end of for loop on num_rovers
} //end of make_new_weights

// ScoreSorter sorts rovers by score
type ScoreSorter []Rover

func (a ScoreSorter) Len() int           { return len(a) }
func (a ScoreSorter) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ScoreSorter) Less(i, j int) bool { return a[i].Score > a[j].Score }

func make_weight_matrix(genome []float64, start_index int, from_size int, to_size int) [][]float64 {

	kspot := start_index
	var new_mat [][]float64
	for ii := start_index; ii < (start_index + from_size); ii++ {
		var junk []float64
		for jj := 0; jj < to_size; jj++ {
			junk = append(junk, genome[kspot])
			kspot++
		} //end of loop on jj
		new_mat = append(new_mat, junk)
	} //end of loop on from length

	return new_mat
} //end of make_weight_matrix

func make_rovers(team Team) []Rover {

	length_of_genome := team.Num_inputs * team.Num_hidden
	length_of_genome += team.Num_hidden * team.Num_hidden
	length_of_genome += team.Num_hidden * team.Num_outputs
	var rovers []Rover
	var means []float64
	var sds []float64

	rand.Seed(time.Now().UTC().UnixNano())

	for il := 0; il < length_of_genome; il++ {
		means = append(means, getRandomFloat64(-100.0, 100.0))
		sds = append(sds, getRandomFloat64(1, 200))
	}

	for i := 0; i < team.Num_rovers; i++ {
		var rover Rover
		var genome []float64

		for j := 0; j < length_of_genome; j++ {
			sample := rand.NormFloat64()*sds[j] + means[j]
			genome = append(genome, sample)
		} //end of loop on length of genome

		rover.Genome = genome
		rover.Score = 0
		for ijk := 0; ijk < team.Num_hidden; ijk++ {
			rover.Old_hidden_layer = append(rover.Old_hidden_layer, 0.0)
		}
		rovers = append(rovers, rover)
	} //end of for loop on num_rovers
	return rovers
} //end of make_rovers
