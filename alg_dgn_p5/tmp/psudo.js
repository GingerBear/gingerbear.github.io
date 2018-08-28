// q1

function merge_sort(list) {
	if list.length <= 1 
		return list
	}
	var left = [], mid = [], right = []
	// divide into three
	var div1 = int(list.length / 3), div2 = int(list.length*2 / 3)
	foreach list from first to div1
		left.push(list[i])

	foreach list from div1 to div2
		mid.push(list[i])

	foreach list from div2 to last
		right.push(list[i])	

	left = merge_sort(left)
	mid = merge_sort(mid)
	right = merge_sort(right)

	return merge(left, mid, right)
}

function merge(left, mid, right) {
	var result = []
	while(left.length > 0 || mid.length > 0 || right.length > 0) {
		result.push(min(left.first(), mid.first(), right.first()))
		remove min(left.first(), mid.first(), right.first()) from its list
	}
	return result
}

// q2

nodes = a ajacency matrix
path = []
// recursively travel all nodes
function EulerTrail(u) {
	foreach neighbor v of u{
		remove edge[u][v]
		EulerTrail(v)
	}
	// put traveled node to path
	path[count++] = u
}
count = 0
EulerTrail(start)

if path contain all nodes
	connectivity = true
else
	connectivity = false

// check only two odd
foreach neighbor of each nodes
	if neighbor.lenght is odd
		oddNum++

if oddNum == 2
	onlyTwoOdd = true
else
	onlyTwoOdd = false

if onlyTwoOdd and connectivity
	graph exist Euler Path

// q3

board = 4 x 4 x 4 matrix

lastHand = {
	p: 2,	// player of lastest hand
	x: 1,	// position of the hand
	y: 3, 
	z: 0
}
function checkWin(lastHand){

	// init win on each row to true
	ifRowOnX = true
	ifRowOnY = true
	ifRowOnZ = true
	ifRowOnXY = true
	ifRowOnXZ = true
	ifRowOnYZ = true
	ifRowOnXYZ = true

	foreach node in board
		if node on X axis of lastHand and node != lastHand.p
			ifRowOnX = false
		if node on Y axis of lastHand and node != lastHand.p
			ifRowOnY = false
		if node on Z axis of lastHand and node != lastHand.p
			ifRowOnZ = false
		if node on XY axis of lastHand and node != lastHand.p
			ifRowOnXY = false
		if node on XZ axis of lastHand and node != lastHand.p
			ifRowOnXZ = false
		if node on YZ axis of lastHand and node != lastHand.p
			ifRowOnYZ = false
		if node on XYZ axis of lastHand and node != lastHand.p
			ifRowOnXYZ = false

	// if one of direction in a row, this hand win
	if ifRowOnX = true or ifRowOnY = true or ifRowOnZ = true or ifRowOnXY = true or ifRowOnXZ = true or ifRowOnYZ = true or ifRowOnXYZ = true
		lastHand.p win
}

// q4

// fix the first item, rotate other clock-wise
function rotate(arr){
	var tmpArr1 =[], tmpArr2 = []
	for(var i = 0 i < arr[0].length i++){
		if i == 0
			tmpArr1[i] = arr[0][i]
			tmpArr2[i] = arr[1][i+1]
		// set exception for len 2
		else if i == 1 && arr[0].length <= 2
			tmpArr1[i] = arr[1][i-1]
			tmpArr2[i] = arr[0][i]
		else if i == 1
			tmpArr1[i] = arr[1][i-1]
			tmpArr2[i] = arr[1][i+1]
		else if i == arr[0].length - 1
			tmpArr1[i] = arr[0][i-1]
			tmpArr2[i] = arr[0][i]
		else
			tmpArr1[i] = arr[0][i-1]
			tmpArr2[i] = arr[1][i+1]			
		
	}
	return [tmpArr1, tmpArr2]
}

// Schedule A
function scheduleA(N) {
	players = pow(2,N) players array 
	n = players.length
	row1 = first half of player array
	row2 = second half of players array
	for i from 0 to n-1
		for j from 0 to n
			if row1 contain j
				day[i].push(players[row2.indexOf(j)])
			else if row2 contain j
				day[i].push(players[row1.indexOf(j)])
		tmpArr = rotate([row1, row2]);
		row1 = tmpArr[0];
		row2 = tmpArr[1];
	return day;
}

// Schedule B
function scheduleB(N) {
	players = N players array 
	n = players.length
	row1 = first half of player array
	row2 = second half of players array
	if N is odd
		row.push(n)
		players.push('-');

	for i from 0 to n-1
		for j from 0 to n (if N is odd to n-1)
			if row1 contain j
				day[i].push(players[row2.indexOf(j)])
			else if row2 contain j
				day[i].push(players[row1.indexOf(j)])
		tmpArr = rotate([row1, row2]);
		row1 = tmpArr[0];
		row2 = tmpArr[1];
	return day;
}