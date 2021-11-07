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

new Promise((resolve) => {
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
