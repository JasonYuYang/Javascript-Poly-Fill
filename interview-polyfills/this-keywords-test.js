var obj = {
  hi: function () {
    console.log(this);
    return () => {
      console.log(this);
    };
  },
  sayHi: function () {
    return function () {
      console.log(this);
      return () => {
        console.log(this);
      };
    };
  },
  say: () => {
    console.log(this);
  },
};
let hi = obj.hi(); //输出obj对象
hi(); //输出obj对象
let sayHi = obj.sayHi();
let fun1 = sayHi(); //输出window
fun1(); //输出window
obj.say(); //输出window

//https://juejin.cn/post/6844903805587619854#heading-7
