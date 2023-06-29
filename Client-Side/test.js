// timeType = originalTime
let timeValue = 0;
// sendMsg(action: timeUpdate, type timType, time timeValue)
// timeType = new
// timeValue = 0
// startTime = current
// current - startTime
timeValue = Date.now();
console.log("time vlaue is", timeValue);
document.getElementById("btn").addEventListener("click", () => {
  let delta = Date.now() - timeValue;
  console.log(delta);
});
