window.addEventListener('load', function (){

    var table = document.getElementById("myTable");
	for (var i=1; i<table.rows.length; i++){
		var row = table.rows[i];
		var str = row.cells[4].innerHTML;
		var res = str.split("%");
		var result = parseFloat(res[0]);
		//console.log(typeof(result));
		if (result < 0 ){
			row.cells[4].style.color="red";
		}else if (result > 0 && result < 1){
			row.cells[4].style.color="blue";
		}else if (result = 0){
			row.cells[4].style.color="purple";
		}
		else{
			row.cells[4].style.color="#48C223";
		}
	}

})


