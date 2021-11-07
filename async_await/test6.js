async function async1() {
  console.log(1);
  await async2();
  console.log(2);
}
async function async2() {
  console.log(3);
}

new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve();
    console.log(4);
  }, 1000);
})
  .then(() => {
    console.log(5);
    new Promise((resolve, reject) => {
      setTimeout(() => {
        async1();
        resolve();
        console.log(6);
      }, 1000);
    })
      .then(() => {
        console.log(7);
      })
      .then(() => {
        console.log(8);
      });
  })
  .then(() => {
    console.log(9);
  });
new Promise((resolve, reject) => {
  console.log(10);
  setTimeout(() => {
    resolve();
    console.log(11);
  }, 3000);
}).then(() => {
  console.log(12);
});

//Ans: 10, 4, 5, 9, 1, 3, 6, 2, 7, 8, 11, 12
//Promise 中的程式會直接執行，不會進入 microtask，then 中的程式才會進 microtask​
//async function 中 await 後的內容會進入 microtask
//https://pjchender.dev/javascript/note-event-loop-microtask/#async-function-%E4%B8%AD-await-%E5%BE%8C%E7%9A%84%E5%85%A7%E5%AE%B9%E6%9C%83%E9%80%B2%E5%85%A5-microtask
