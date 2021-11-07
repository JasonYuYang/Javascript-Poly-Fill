new Promise((resolve, reject) => {
  console.log(1);
  resolve();
})
  .then(() => {
    console.log(2);
    // 多了个return
    return new Promise((resolve, reject) => {
      console.log(3);
      resolve();
    })
      .then(() => {
        console.log(4);
      })
      .then(() => {
        // 相当于return了这个then的执行返回Promise
        console.log(5);
      });
  })
  .then(() => {
    console.log(6);
  });

//Ans : 1, 2, 3, 4, 5, 6
//https://juejin.cn/post/7016298598883131423#heading-17
