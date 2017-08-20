package main

func mat_mult(a[]float64, b[][]float64) []float64 {
	//a is from layer is 1 row by c columns
	//b is from_to_weight_matrix is c rows  by x columns
	//c is new_layer is 1 row  by x columns

	var c []float64
	to_len := len(b[0])
	from_len := len(a)
	var sum float64

	for ia := 0; ia < to_len; ia++ {
		sum = 0.0
		for jb := 0; jb < from_len; jb++ {
			sum += a[jb] * b[jb][ia]
		}
		c = append(c, sum)
	} //end of loop on ia
	return c
} //end of mat_mult
