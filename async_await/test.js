console.log(1);
setTimeout(() => {
  console.log(2);
  Promise.resolve().then(() => {
    console.log(3);
  });
});
console.log(4);
new Promise((resolve, reject) => {
  console.log(5);
  resolve();
}).then(() => {
  console.log(6);
  setTimeout(() => {
    console.log(7);
  });
});
console.log(8);

//Ans: 1, 4, 5, 8, 6, 2, 3, 7
//https://juejin.cn/post/7016298598883131423#heading-8
