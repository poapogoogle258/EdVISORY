const tests = [1, 2,3,4,5,7];

function SecondMax(data) {
  if(data.length == 0){
    return 0
  }

  if(data.length == 1){
    return data[0]
  }

  let max = null;
  let answer = null;

  for (let i = 0; i < data.length; i++) {
    if (max == null || data[i] > max) {
      [max, answer] = [data[i], max];
    }
  }

  return answer
}

console.log(SecondMax(tests))


