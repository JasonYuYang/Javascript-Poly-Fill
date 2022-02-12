/*
//https://juejin.cn/post/7018337760687685669#heading-14
JS实现一个带并发限制的异步调度器Scheduler，保证同时运行的任务最多有两个。
完善下面代码的Scheduler类，使以下程序能够正常输出：
class Scheduler {
  add(promiseCreator) { ... }
  // ...
}
   
const timeout = time => {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  }
})
  
const scheduler = new Scheduler()
  
const addTask = (time,order) => {
  scheduler.add(() => timeout(time).then(()=>console.log(order)))
}

addTask(1000, '1')
addTask(500, '2')
addTask(300, '3')
addTask(400, '4')

// output: 2 3 1 4
整个的完整执行流程：

起始1、2两个任务开始执行
500ms时，2任务执行完毕，输出2，任务3开始执行
800ms时，3任务执行完毕，输出3，任务4开始执行
1000ms时，1任务执行完毕，输出1，此时只剩下4任务在执行
1200ms时，4任务执行完毕，输出4
*/

//解析
// 看完题目之后，大概会这几个问题存在

// 如何才能保证同时只有2个任务在处于执行中？
// 当某个任务执行结束之后，下一步如何知道应该执行哪个任务？

// 问题1：只需要用一个计数器来控制即可，每开始一个任务计数器+1，结束之后计数器-1，保证计数器一定<=2。
// 问题2：按照题目要求，任务的执行是有顺序的，只是任务的结束时间是不确定的，所以下一个任务一定是按照这样的顺序来
// 任务1 => 任务2 => 任务3 => 任务4
// 利用数组队列的性质，将任务挨个推入队列，前面的任务执行结束之后，将队首的任务取出来执行即可。

class Scheduler {
  constructor() {
    this.queue = [];
    this.maxCount = 2;
    this.curCount = 0;
  }
  add(promiseCreator) {
    this.queue.push(promiseCreator);
    this.runQueuePromise();
  }
  runQueuePromise() {
    while (this.queue.length && this.curCount < this.maxCount) {
      const curQueuePromise = this.queue.shift();
      this.curCount++;
      curQueuePromise().then(() => {
        this.curCount--;
        this.runQueuePromise();
      });
    }
  }
}

const timeout = time => {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
};

const scheduler = new Scheduler();

const addTask = (time, order) => {
  scheduler.add(() => timeout(time).then(() => console.log(order)));
};
