package main

import (
	"encoding/json"
	"fmt"
	"math"
)

type Update_record struct {
	Id     int
	Reward int
	State  []float64
}

func do_updates(team Team, message []byte) []byte {

	type Team_updates struct {
		Status   string
		All_recs []Update_record
	}

	type Angle_record struct {
		Id    int
		Angle float64
	}

	type Team_angles struct {
		Status        string
		Angle_records []Angle_record
	}
	var update_record Update_record

	var team_updates Team_updates
	var team_angles Team_angles
	var err error

	jerr := json.Unmarshal(message, &team_updates)
	if jerr != nil {
		fmt.Println("error on update unmarshal")
		panic(fmt.Sprintf("%s", "ARRRGGGH"))
	} //end of if on jerr

	team_angles.Status = "Angles"
	for ir := 0; ir < len(team_updates.All_recs); ir++ {
		update_record = team_updates.All_recs[ir]
		var angle_record Angle_record
		angle_record.Angle = think(team, update_record)
		angle_record.Id = update_record.Id

		team_angles.Angle_records = append(team_angles.Angle_records, angle_record)
	} //end of loop on rovers

	message, err = json.Marshal(team_angles)
	if err != nil {
		fmt.Println("bad angles Marshal")
	}
	return message
} //end of do_update

func think(team Team, update_record Update_record) float64 {
	team.Rovers[update_record.Id].Score += update_record.Reward
	var input_layer []float64
	input_layer = update_record.State
		

	var ihws [][]float64
	var hhws [][]float64
	var ohlayer []float64

	ihws = team.Rovers[update_record.Id].Input_hidden_weights
	hhws = team.Rovers[update_record.Id].Hidden_hidden_weights
	ohlayer = team.Rovers[update_record.Id].Old_hidden_layer

	junk1 := mat_mult(input_layer, ihws)
	junk2 := mat_mult(ohlayer, hhws)

	junk12 := vec_add(junk1, junk2)
	hidden_layer := normalize_layer(junk12)
	team.Rovers[update_record.Id].Old_hidden_layer = hidden_layer

	var hows [][]float64
	hows = team.Rovers[update_record.Id].Hidden_output_weights
	junk3 := mat_mult(hidden_layer, hows)
	output_layer := normalize_layer(junk3)
	new_angle := get_max(output_layer)
	return new_angle
} //end of think

func get_max(olayer []float64) float64 {
	var omax float64
	var imax int
	omax = 0.0
	imax = 0
	for im := 0; im < len(olayer); im++ {
		if olayer[im] > omax {
			omax = olayer[im]
			imax = im
		} //end of if
	} //end of loop across olayer
	return float64(imax)

} //end of getMax

func vec_add(vec1 []float64, vec2 []float64) []float64 {
	var sum_vec []float64
	for ivv := 0; ivv < len(vec1); ivv++ {
		sum_vec = append(sum_vec, vec1[ivv]+vec2[ivv])
	}
	return sum_vec
} //end of vec_add

func normalize_layer(vec1 []float64) []float64 {
	var norm_vec []float64
	var n float64

	for ivv := 0; ivv < len(vec1); ivv++ {
		n = 1.0 / (1.0 + math.Exp(-1.0*vec1[ivv]))
		norm_vec = append(norm_vec, n)
	}
	return norm_vec
} //end of normalize func

