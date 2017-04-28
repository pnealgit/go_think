// Copyright 2015 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// +build ignore

package main

import (
	"flag"
	"log"
        "fmt"
	"net/http"
        "strings"
        "math/rand"
        "encoding/json"
	"github.com/gorilla/websocket"
)

type Update_record struct {
    Color     string
    Id        int
    State     []int
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

func getRandomFloat32(min float32,max float32) float32{
    return 0.0 + (rand.Float32() * (max-min)) + min
}

func getRandomInt(min int,max int) int{
    return rand.Intn(max-min) + min
}

func select_genomes(team Team) {
    fmt.Println("in select team color is ",team.Color)
}

func mutate_genomes(team Team) {
    fmt.Println("in mutate team color is ",team.Color)
}

func make_new_weights(team Team) {
    fmt.Println("in make_new_weights team color is ",team.Color)
}

func make_weight_matrix(genome []float32,from_length int,to_length int) [][]float32 {

    kspot:= 0
    var new_mat [][]float32
    for ii:=0;ii<from_length;ii++ {
        junk :=make([]float32,to_length)

        for jj:=0;jj<to_length;jj++ {
            junk[jj] = genome[kspot]
            kspot++
        } //end of loop on jj
        new_mat = append(new_mat,junk)
    } //end of loop on from length
    return new_mat
} //end of make_weight_matrix

func make_rovers(team Team) {
    fmt.Println("in make_rovers")
    fmt.Println("team name ",team.Team_name);
    length_of_genome := team.Num_inputs*team.Num_hidden 
    length_of_genome += team.Num_hidden*team.Num_outputs
    fmt.Println("Lenght GENOME ",length_of_genome);

    for i := 0; i< team.Num_rovers; i++ {
        var rover Rover
        //rover.Genome = []float32
        for j:=0;j<length_of_genome;j++ {
          rover.Genome[j] =  getRandomFloat32(-2.0,2.0)
        } //end of loop on length of genome
      
        to := team.Num_inputs * team.Num_hidden
        g:= rover.Genome[0:to]
        rover.Input_hidden_weights = make_weight_matrix(g,0,to)

        from := to
        to = to + team.Num_hidden * team.Num_outputs
        g = rover.Genome[from:to]
        rover.Hidden_output_weights = 
           make_weight_matrix(g,from,to)
        rover.Score = 0
        team.Rovers= append(team.Rovers,rover)
    } //end of for loop on num_rovers
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
                   make_rovers(red_team)
                }  //end of if on red

                if strings.Contains(junk,"blue_team") {
                   fmt.Println("BLUE TEAM!!");
                   jerr := json.Unmarshal(message,&blue_team)
                   if jerr != nil {
                      fmt.Println("error on blueteam unmarshal")
                   } //end of if on jerr
                   make_rovers(blue_team)

                }  //end of if on blue 

                if strings.Contains(junk,"state") {
                   jerr := json.Unmarshal(message,&update_record)
                   if jerr != nil {
                      fmt.Println("error on update unmarshal")
                   } //end of if on jerr
                   //fmt.Println("update: ",update_record.Color)
                   //fmt.Println("update: ",update_record.Id)
                   //fmt.Println("update: ",update_record.State)
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


