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
    Color     string
    Num_rovers int
    Num_input  int
    Num_hidden int
    Num_output int
}
var red_team Team
var blue_team Team

var update_record Update_record


var addr = flag.String("addr", "localhost:8081", "http service address")

var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
    CheckOrigin: func(r *http.Request) bool {
        return true
    },
}

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

		log.Printf("recv: %s", message)
                junk:= string(message)
                //fmt.Println("junk: ",junk)
                 
                if strings.Contains(junk,"red_team") {
                   fmt.Println("RED TEAM!!");
                   jerr := json.Unmarshal(message,&red_team)
                   if jerr != nil {
                      fmt.Println("error on redteam unmarshal")
                   } //end of if on jerr
                }  //end of if on red

                if strings.Contains(junk,"blue_team") {
                   fmt.Println("BLUE TEAM!!");
                   jerr := json.Unmarshal(message,&blue_team)
                   if jerr != nil {
                      fmt.Println("error on blueteam unmarshal")
                   } //end of if on jerr
                }  //end of if on blue 

                if strings.Contains(junk,"state") {
                   //fmt.Println("STATE!!");
                   jerr := json.Unmarshal(message,&update_record)
                   if jerr != nil {
                      fmt.Println("error on blueteam unmarshal")
                   } //end of if on jerr
                   //fmt.Println("update: ",update_record.Color)
                   //fmt.Println("update: ",update_record.Id)
                   //fmt.Println("update: ",update_record.State)
                }  //end of if on state 

                if strings.Contains(junk,"num_episodes") {
                   fmt.Println("NUM EPISODES!!")
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


