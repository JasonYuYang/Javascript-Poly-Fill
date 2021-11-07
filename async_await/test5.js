async function async1() {
  console.log(1);
  await async2();
  console.log(2);
}
async function async2() {
  console.log(3);
}
console.log(4);
setTimeout(function () {
  console.log(5);
});
async1();
new Promise(function (resolve, reject) {
  console.log(6);
  resolve();
}).then(function () {
  console.log(7);
});
console.log(8);

//Ans: 4, 1, 3, 6, 8, 2, 7, 5
//https://juejin.cn/post/7016298598883131423#heading-21
