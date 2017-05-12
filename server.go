package main

import (
	"flag"
	"log"
        "fmt"
        "sort"
	"net/http"
        "strings"
        "math/rand"
        "encoding/json"
	"github.com/gorilla/websocket"
)

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
    Hidden_hidden_weights [][]float32
    Hidden_output_weights [][]float32
    Old_hidden_layer      []float32
    Score                int
}

var red_team Team
var blue_team Team
var rover Rover

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
    //new_team := team

    sum := 0
    for ir:=0;ir<team.Num_rovers;ir++ {
        sum+= team.Rovers[ir].Score
    }
    fmt.Println(team.Team_name," sum ",sum)
    sort.Sort(ScoreSorter(team.Rovers))
    fmt.Println("BEST SCORE FOR ",team.Team_name,": ",team.Rovers[0].Score)
    fmt.Println("WRST SCORE FOR ",team.Team_name,": ",team.Rovers[team.Num_rovers-1].Score)

} //end of select



func mutate_genomes(team Team) {
    num_spots := len(team.Rovers[0].Genome)
    for im:=4;im<team.Num_rovers;im++ {
      team.Rovers[im].Genome = team.Rovers[0].Genome
      for ispot:=0;ispot<num_spots;ispot++ {
         team.Rovers[im].Genome[ispot] = float32(rand.NormFloat64()) * 
              team.Rovers[im].Genome[ispot]
      } //end of loop on ispot
    } //end of loop on num_rovers
    
    for isk:=0; isk< team.Num_rovers;isk++ {
       team.Rovers[isk].Score = 0
    }
} //end of mutate func

func make_new_weights(team Team) {

    for i := 0; i< team.Num_rovers; i++ {
        index := 0
        var new_weights [][]float32
        new_weights = make_weight_matrix(team.Rovers[i].Genome,0,team.Num_inputs,team.Num_hidden)
        team.Rovers[i].Input_hidden_weights = new_weights

        //RNN got an extra hidden layer---
        index = team.Num_inputs * team.Num_hidden
        team.Rovers[i].Hidden_hidden_weights = 
           make_weight_matrix(team.Rovers[i].Genome,index,team.Num_hidden,team.Num_hidden)

        index+= team.Num_hidden * team.Num_hidden
        team.Rovers[i].Hidden_output_weights = 
           make_weight_matrix(team.Rovers[i].Genome,index,team.Num_hidden,team.Num_outputs)

    } //end of for loop on num_rovers
} //end of make_new_weights 

// ScoreSorter sorts rovers by score
type ScoreSorter []Rover

func (a ScoreSorter) Len() int           { return len(a) }
func (a ScoreSorter) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ScoreSorter) Less(i, j int) bool { return a[i].Score > a[j].Score }



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
    length_of_genome += team.Num_hidden*team.Num_hidden
    length_of_genome += team.Num_hidden*team.Num_outputs
    var rovers []Rover

    for i := 0; i< team.Num_rovers; i++ {
        var rover Rover
        var genome []float32

        for j:=0;j<length_of_genome;j++ {
          genome =  append(genome,getRandomFloat32(-2.0,2.0))
        } //end of loop on length of genome
        rover.Genome = genome
        rover.Score = 0
        for ijk :=0;ijk<team.Num_hidden;ijk++ {
            rover.Old_hidden_layer = append(rover.Old_hidden_layer,0.0)
        }
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
                 
                if strings.Contains(junk,"make_red_team") {
                   fmt.Println("RED TEAM!!");
                   jerr := json.Unmarshal(message,&red_team)
                   if jerr != nil {
                      fmt.Println("error on redteam unmarshal")
                   } //end of if on jerr
                   red_team.Rovers = make_rovers(red_team)
                   make_new_weights(red_team)
                }  //end of if on red

                if strings.Contains(junk,"make_blue_team") {
                   jerr := json.Unmarshal(message,&blue_team)
                   if jerr != nil {
                      fmt.Println("error on blueteam unmarshal")
                   } //end of if on jerr
                   blue_team.Rovers = make_rovers(blue_team)
                   make_new_weights(blue_team)

                }  //end of if on blue 

                if strings.Contains(junk,"red_team_state") {
                   message = do_updates(red_team,message)
                }

                if strings.Contains(junk,"blue_team_state") {
                   message = do_updates(blue_team,message)
		   err = c.WriteMessage(mt, message)
		   if err != nil {
			log.Println("write:", err)
			break
		   } //end of if on write
                }
 
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

        fmt.Println("listening on 8081")
	log.Fatal(http.ListenAndServe(*addr, nil))
} //end of main


