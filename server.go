// Copyright 2015 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// +build ignore

package main

import (
	"flag"
	"log"
        "fmt"
        "sort"
	"net/http"
        "strings"
        "math/rand"
        "math"
        "encoding/json"
	"github.com/gorilla/websocket"
)

type Update_record struct {
    Color     string
    Id        int
    Reward    int
    State     []float32
}

type Angle_record struct {
    Color     string
    Id        int
    Angle     float32
}
type Team struct {
    Team_name string
    Color       string
    Num_rovers  int
    Num_inputs  int
    Num_hidden  int
    Num_outputs int
    Rovers     []Rover
}

type Rover struct {
    Genome               []float32
    Input_hidden_weights [][]float32
    Hidden_output_weights[][]float32
    Score                int
}

var red_team Team
var blue_team Team
var rover Rover

var update_record Update_record

var addr = flag.String("addr", "localhost:8081", "http service address")

var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
    CheckOrigin: func(r *http.Request) bool {
        return true
    },
}

func think(update_record Update_record) float32 {
    team := red_team
    if update_record.Color == "blue" {
       team = blue_team
    }
    team.Rovers[update_record.Id].Score += update_record.Reward
    var input_layer []float32
    var pi float32 
    input_layer = update_record.State
    var ihws  [][]float32

    ihws = team.Rovers[update_record.Id].Input_hidden_weights
    hidden_layer := make_layer(input_layer,ihws)

    var hows  [][]float32
    hows = team.Rovers[update_record.Id].Hidden_output_weights
    output_layer := make_layer(hidden_layer,hows)


    pi = float32(math.Pi)
    new_angle := output_layer[0] * pi * 2.0
    return new_angle 
} //end of think

func make_layer(from_layer []float32,from_to_weight_matrix [][]float32) []float32 {
      //from layer is 1 x c
      //from_to_weight_matrix is c x x
      //new_layer is 1 x x

      var new_layer []float32
      to_len := len(from_to_weight_matrix[0])
      from_len := len(from_layer)

      var sum float32
      
      for ia:=0;ia<to_len;ia++  {
            sum = 0.0
            for jb :=0;jb <from_len;jb++ {
                sum += from_layer[jb] * from_to_weight_matrix[jb][ia]
            }
            fff :=  1.0/(1.0+math.Exp(-1.0*float64(sum)))
            new_layer =  append(new_layer,float32(fff))
        } //end of loop on i
        return new_layer
} //end of make_layer


func getRandomFloat32(min float32,max float32) float32{
    return 0.0 + (rand.Float32() * (max-min)) + min
}

func getRandomInt(min int,max int) int{
    return rand.Intn(max-min) + min
}

func select_genomes(team Team) {
    scores := make(map[int]int)
    for ir:=0;ir<team.Num_rovers;ir++ {
        scores[ir] = team.Rovers[ir].Score
        team.Rovers[ir].Score = 0
    }

    var rindex []int;
    var new_rovers []Rover

    for _, res := range sortedKeys(scores) {
                rindex = append(rindex,res)
    } //end of loop on res
fmt.Println("RINDEX IS ",rindex)

    //keep top 2
    spot:= 2
    for irk:=0;irk<team.Num_rovers;irk++ {
        iz := rindex[irk]
        rover = team.Rovers[iz]
        rover.Score = 0
        new_rovers = append(new_rovers,rover)
    }


    for irk1 :=spot;irk1<team.Num_rovers;irk1++ {
        i1 := getRandomInt(0,5)
        i2 := getRandomInt(0,team.Num_rovers)
        var s2 []float32
        s2 = crossover(team.Rovers[i1].Genome,team.Rovers[i2].Genome)
        new_rovers[irk1].Genome = s2
    } //end of lop on num_rovers


    team.Rovers = new_rovers

} //end of select


func crossover(g1 []float32,g2[]float32) ([]float32) {

    cspot := len(g1)/2

    var c1 []float32
    var c2 []float32
    c1a := g1[0:cspot]
    c1b := g1[cspot]
    c2a := g2[0:cspot]
    c2b := g2[cspot]
    c1 = append(c1a,c2b)
    c2 = append(c2a,c1b)
    duh := rand.Float32()
    if duh < .5 {

        return c1
    } 
    return c2
} //end of crossover
 
func mutate_genomes(team Team) {
    for im:=2;im<team.Num_rovers;im++ {
        //everybody but top 2 get mutation Rovers 0 just to get a length
        mspot := getRandomInt(0,len(team.Rovers[0].Genome))
        team.Rovers[im].Genome[mspot] = getRandomFloat32(-2.0,2.0)
    } //end of loop on num_roers
} //end of mutate func

func make_new_weights(team Team) {
    fmt.Println("in make_new_weights team color is ",team.Color)
 
    for i := 0; i< team.Num_rovers; i++ {
        team.Rovers[i].Input_hidden_weights = 
                  make_weight_matrix(team.Rovers[i].Genome,0,team.Num_inputs,team.Num_hidden)
        index :=  team.Num_inputs * team.Num_hidden
        team.Rovers[i].Hidden_output_weights = 
           make_weight_matrix(team.Rovers[i].Genome,index,team.Num_hidden,team.Num_outputs)
    } //end of for loop on num_rovers
} //end of make_new_weights 

type sortedMap struct {
	m map[int]int
	s []int
}

func (sm *sortedMap) Len() int {
	return len(sm.m)
}

func (sm *sortedMap) Less(i, j int) bool {
	return sm.m[sm.s[i]] > sm.m[sm.s[j]]
}

func (sm *sortedMap) Swap(i, j int) {
	sm.s[i], sm.s[j] = sm.s[j], sm.s[i]
}

func sortedKeys(m map[int]int) []int {
	sm := new(sortedMap)
	sm.m = m
	sm.s = make([]int, len(m))
	i := 0
	for key, _ := range m {
		sm.s[i] = key
		i++
	}
	sort.Sort(sm)
	return sm.s
}


func make_weight_matrix(genome []float32,start_index int,from_size int,to_size int) [][]float32 {


    kspot:= start_index
    var new_mat [][]float32
    for ii:=start_index;ii<(start_index+from_size);ii++ {
        var junk []float32
        for jj:=0;jj<to_size;jj++ {
            junk = append(junk,genome[kspot])
            kspot++
        } //end of loop on jj
        new_mat = append(new_mat,junk)
    } //end of loop on from length

    return new_mat
} //end of make_weight_matrix

func make_rovers(team Team) []Rover {

    length_of_genome := team.Num_inputs*team.Num_hidden 
    length_of_genome += team.Num_hidden*team.Num_outputs
    var rovers []Rover

    for i := 0; i< team.Num_rovers; i++ {
        var rover Rover
        var genome []float32

        for j:=0;j<length_of_genome;j++ {
          genome =  append(genome,getRandomFloat32(-2.0,2.0))
        } //end of loop on length of genome
        rover.Genome = genome
 
        rover.Input_hidden_weights = 
                  make_weight_matrix(rover.Genome,0,team.Num_inputs,team.Num_hidden)
        index :=  team.Num_inputs * team.Num_hidden
        rover.Hidden_output_weights = 
           make_weight_matrix(rover.Genome,index,team.Num_hidden,team.Num_outputs)
        rover.Score = 0
        rovers = append(rovers,rover)


    } //end of for loop on num_rovers
   return rovers
} //end of make_rovers

func talk(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	defer c.Close()
	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		} //end of if on message err

		//log.Printf("recv: %s", message)
                junk:= string(message)
                //fmt.Println("junk: ",junk)
                 
                if strings.Contains(junk,"red_team") {
                   fmt.Println("RED TEAM!!");
                   jerr := json.Unmarshal(message,&red_team)
                   if jerr != nil {
                      fmt.Println("error on redteam unmarshal")
                   } //end of if on jerr
                   red_team.Rovers = make_rovers(red_team)

                }  //end of if on red

                if strings.Contains(junk,"blue_team") {
                   jerr := json.Unmarshal(message,&blue_team)
                   if jerr != nil {
                      fmt.Println("error on blueteam unmarshal")
                   } //end of if on jerr
                   blue_team.Rovers = make_rovers(blue_team)

                }  //end of if on blue 

                if strings.Contains(junk,"state") {
                   jerr := json.Unmarshal(message,&update_record)
                   if jerr != nil {
                      fmt.Println("error on update unmarshal")
                   } //end of if on jerr
                  
                   var angle_record Angle_record
                   angle_record.Angle = think(update_record)
                   angle_record.Color = update_record.Color
                   angle_record.Id = update_record.Id

                   message,err = json.Marshal(angle_record)
                   if err != nil {
                      fmt.Println("bad angle Marshal")
                   }
                   
                   err = c.WriteMessage(mt, message)
                   if err != nil {
                        log.Println("angle write:", err)
                        break
                   } //end of if on write
                }  //end of if on state 

                if strings.Contains(junk,"num_episodes") {
                   fmt.Println("NUM EPISODES!!")
                   select_genomes(red_team);
                   mutate_genomes(red_team);
                   make_new_weights(red_team);
                   select_genomes(blue_team);
                   mutate_genomes(blue_team);
                   make_new_weights(blue_team);
                }

                outmap := make(map[string]string)
                outmap["status"] = "ok"
                message,err = json.Marshal(outmap) 
		err = c.WriteMessage(mt, message)
		if err != nil {
			log.Println("write:", err)
			break
		} //end of if on write
	} //end of for loop
} //end of talk

func main() {
	flag.Parse()
	log.SetFlags(0)
	http.HandleFunc("/talk", talk)
        http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
                http.ServeFile(w, r, r.URL.Path[1:])
        })

        http.HandleFunc("food.js", func(w http.ResponseWriter, r *http.Request) {
                http.ServeFile(w, r, r.URL.Path[1:])
        })
        http.HandleFunc("game.js", func(w http.ResponseWriter, r *http.Request) {
                http.ServeFile(w, r, r.URL.Path[1:])
        })

        http.HandleFunc("gostuff.js", func(w http.ResponseWriter, r *http.Request) {
                http.ServeFile(w, r, r.URL.Path[1:])
        })

        fmt.Println("listening on 8081")
	log.Fatal(http.ListenAndServe(*addr, nil))
} //end of main


