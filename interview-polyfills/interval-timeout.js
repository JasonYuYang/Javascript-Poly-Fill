// 综上所述，setInterval 有两个缺点：

// 使用 setInterval 时，某些间隔会被跳过；
// 可能多个定时器会连续执行；

// 可以这么理解：每个 setTimeout 产生的任务会直接 push 到任务队列中；而 setInterval 在每次把任务 push 到任务队列前，都要进行一下判断(看上次的任务是否仍在队列中，如果有则不添加，没有则添加)。

function myInterval(fn, delay) {
  let timeout = null;
  const interval = () => {
    fn();
    timeout = setTimeout(interval, delay);
  };
  setTimeout(interval, delay);
  return {
    cancel: () => {
      clearTimeout(timeout);
    },
  };
}

//https://juejin.cn/post/7018337760687685669#heading-31
function myTimeout(fn, delay) {
  let timeout = null;
  timeout = setInterval(() => {
    fn();
    clearInterval(timeout);
  }, delay);
}
