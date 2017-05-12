package main
import (
    "fmt"
    "encoding/json"
    "math"
)
    
type Update_record struct {
  Id        int
  Reward    int
  State     []float32
}


func do_updates(team Team,message []byte) []byte {

    type Team_updates struct {
      Status    string
      Color     string
      All_recs   []Update_record
    }

    type Angle_record struct {
      Id        int
      Angle     float32
    }

    type Team_angles struct {
       Status        string
       Color         string
       Angle_records []Angle_record
    } 
    var update_record Update_record
    var team_updates  Team_updates 
    var team_angles  Team_angles
    var err error


    jerr := json.Unmarshal(message,&team_updates)
    if jerr != nil {
       fmt.Println("error on update unmarshal")
       panic(fmt.Sprintf("%s","ARRRGGGH"))
    } //end of if on jerr


    team_angles.Status = "Angles"
    team_angles.Color = team.Color
    for ir:=0;ir<len(team_updates.All_recs);ir++ {
        update_record = team_updates.All_recs[ir]

        var angle_record Angle_record
        angle_record.Angle = think(team,update_record)
        angle_record.Id = update_record.Id

        team_angles.Angle_records = append(team_angles.Angle_records,angle_record)
    } //end of loop on rovers
        
    message,err = json.Marshal(team_angles)
    if err != nil {
      fmt.Println("bad angles Marshal")
    }
    return message
}  //end of do_update


func think(team Team,update_record Update_record) float32 {
    team.Rovers[update_record.Id].Score += update_record.Reward
    var input_layer []float32
    var pi float32 
    input_layer = update_record.State
    var ihws  [][]float32
    var hhws  [][]float32
    var ohlayer []float32

    ihws = team.Rovers[update_record.Id].Input_hidden_weights
    hhws = team.Rovers[update_record.Id].Hidden_hidden_weights
    ohlayer = team.Rovers[update_record.Id].Old_hidden_layer

    junk1 := mat_mult_layer(input_layer,ihws)
    junk2 := mat_mult_layer(ohlayer,hhws)
    junk12:= vec_add(junk1,junk2)
    hidden_layer := normalize_layer(junk12)
    team.Rovers[update_record.Id].Old_hidden_layer = hidden_layer
    
    var hows  [][]float32
    hows = team.Rovers[update_record.Id].Hidden_output_weights
    junk3 := mat_mult_layer(hidden_layer,hows)
    output_layer := normalize_layer(junk3) 

    pi = float32(math.Pi)
    new_angle := output_layer[0] * pi * 2.0
    return new_angle 
} //end of think

func vec_add(vec1 []float32, vec2 []float32) []float32 {
    var sum_vec []float32
    for ivv :=0;ivv < len(vec1);ivv++ {
        sum_vec = append(sum_vec,vec1[ivv] + vec2[ivv])
    }
    return sum_vec
} //end of vec_add

func  normalize_layer(vec1 []float32) []float32 {
    var norm_vec []float32
    var n float64

    for ivv :=0;ivv < len(vec1);ivv++ {
   
        n =  1.0/(1.0+math.Exp(-1.0*float64(vec1[ivv])))
        norm_vec = append(norm_vec,float32(n))
    }
    return norm_vec
} //end of normalize func


func mat_mult_layer(from_layer []float32,from_to_weight_matrix [][]float32) []float32 {
      //from layer is 1 row by c columns
      //from_to_weight_matrix is c rows  by x columns
      //new_layer is 1 row  by x columns

      var new_layer []float32
      to_len := len(from_to_weight_matrix[0])
      from_len := len(from_layer)

      var sum float32
      
      for ia:=0;ia<to_len;ia++  {
            sum = 0.0
            for jb :=0;jb <from_len;jb++ {
                sum += from_layer[jb] * from_to_weight_matrix[jb][ia]
            }
//            fff :=  1.0/(1.0+math.Exp(-1.0*float64(sum)))
            new_layer =  append(new_layer,float32(sum))
        } //end of loop on i
        return new_layer
} //end of make_layer

