setTimeout(() => {
  console.log(1);
}, 0);
console.log(2);
const p = new Promise((resolve) => {
  console.log(3);
  resolve();
})
  .then(() => {
    console.log(4);
  })
  .then(() => {
    console.log(5);
  });
console.log(6);

//Ans : 2, 3, 6, 4, 5, 1,
//https://juejin.cn/post/7016298598883131423#heading-11
