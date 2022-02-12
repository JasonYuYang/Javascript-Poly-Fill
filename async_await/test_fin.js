async function async1() {
  console.log('async1 start');
  await async2();

  console.log('async1 end');
}

async function async2() {
  console.log('async start');
  return new Promise((resolve, reject) => {
    resolve();
    console.log('async2 promise');
  });
}

console.log('script start');
setTimeout(() => {
  console.log('setTimeout');
}, 0);

async1();

new Promise(resolve => {
  console.log('promise1');
  resolve();
})
  .then(() => {
    console.log('promise2');
  })
  .then(() => {
    console.log('promise3');
  });
console.log('script end');

// script start
// async1 start
// async start
// async2 promise
// promise1
// script end
// 注意promise2
// 注意promise3
// 注意async1 end
// setTimeout
////一般來說會寫成
//async1 end,promise2,promuise3
//要注意背起來!! 當await後面回傳promisec或是thenable object要注意延遲兩個task再換他

//原因1 :await會把後面回傳的值v,轉成new Promise((resolve)=>{resolve(v)})
//https://juejin.cn/post/6844903762478235656#heading-10

// async function async1() {
//   console.log('async1 start');
//   await async2();

//   console.log('async1 end');
// }
//////////////轉化成////////////
// function async1() {
//   console.log('async1 start');
//   return new Promise(resolve => resolve(async2())).then(() => {
//     console.log('async1 end');
//   });
// }

//原因2:
// 當new Promise(resolve => {
//     resolve(v);
//   }).then((v)=>{
//       console.log(v)
//   });
// v為promise時
// 推迟原因：浏览器会创建一个 PromiseResolveThenableJob 去处理这个 Promise 实例，这是一个微任务。
// 等到下次循环到来这个微任务会执行，也就是PromiseResolveThenableJob 执行中的时候，因为这个Promise 实例是fulfilled状态，所以又会注册一个它的.then()回调
// 又等一次循环到这个Promise 实例它的.then()回调执行后，才会注册下面的这个.then(),于是就被推迟了两个时序
//https://segmentfault.com/a/1190000020980101
//https://juejin.cn/post/6844903762478235656#heading-12
