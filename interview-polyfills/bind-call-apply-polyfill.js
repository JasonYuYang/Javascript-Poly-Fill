//juejin.cn/post/6844903906279964686#heading-1

Function.prototype.myCall = function (ctx, ...args) {
  // 简单处理未传ctx上下文，或者传的是null和undefined等场景
  if (!ctx) {
    ctx = typeof window !== undefined ? window : global;
  }
  // 暴力处理 ctx有可能传非对象
  ctx = Object(ctx);
  // 用Symbol生成唯一的key
  const fnName = Symbol();
  // 这里的this，即要调用的函数
  ctx[fnName] = this;
  // 将args展开，并且调用fnName函数，此时fnName函数内部的this也就是ctx了
  //感覺像這樣
  // const ctx ={
  //   fnName:function(){
  //當function裡面的this由於ctx.fnName(...args)隱式調用所以this即ctx
  //     console.log(this);
  //   }
  // }
  let result = ctx[fnName](...args);
  // 用完之后，将fnName从上下文ctx中删除
  delete ctx[fnName];
  return result;
};

// 唯一的区别在这里，不需要...args变成数组
Function.prototype.myApply = function (ctx, args) {
  if (!ctx) {
    ctx = typeof window !== 'undefined' ? window : global;
  }

  ctx = Object(ctx);

  const fnName = Symbol();

  ctx[fnName] = this;
  // 将args参数数组，展开为多个参数，供函数调用
  const result = ctx[fnName](...args);

  delete ctx[fnName];

  return result;
};

//Bind 手寫思路
//拷贝源函数:

// 通过变量储存源函数
// 使用Object.create复制源函数的prototype给fToBind

// 返回拷贝的函数
// 调用拷贝的函数：

// new调用判断：通过instanceof判断函数是否通过new调用，来决定绑定的context
// 绑定this+传递参数
// 返回源函数的执行结果

Function.prototype.myBind = function (objThis, ...args) {
  const thisFn = this;
  // 对返回的函数 secondArgs 二次传参
  const bindFn = function (...secondArgs) {
    const isNew = this instanceof bindFn; // this是否是bindFn的实例 也就是返回的bindFn是否通过new调用
    const ctxThis = isNew ? this : objThis; // new调用就绑定到this上,否则就绑定到传入的objThis上
    return thisFn.call(ctxThis, ...args, ...secondArgs); // 用call调用源函数绑定this的指向并传递参数,返回执行结果
  };
  if (thisFn.prototype) {
    // 复制源函数的prototype给bindFn 一些情况下函数没有prototype，比如箭头函数
    bindFn.prototype = Object.create(thisFn.prototype);
  }
  return bindFn; // 返回拷贝的函数
};
