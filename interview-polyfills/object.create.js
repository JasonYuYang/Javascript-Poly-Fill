if (!Object.create) {
  Object.create = function (o) {
    const F = function () {};
    F.prototype = o;
    return new F();
  };
}
///custom create
const create = (prop, props) => {
  if (!['object', 'function'].includes(typeof prop)) {
    throw new TypeError(`Object prototype may only be an Object or null: ${prop}`);
  }
  // 创建构造函数
  const Ctor = function () {};
  // 赋值原型
  Ctor.prototype = prop;
  // 创建实例
  const obj = new Ctor();
  // 支持第二个参数
  if (props) {
    Object.defineProperties(obj, props);
  }
  // 支持空原型
  if (prop === null) {
    obj.__proto__ = null;
  }

  return obj;
};

// 用前面的例子做测试
const person = {
  showName() {
    console.log(this.name);
  },
};
const me2 = create(person);

me2.name = '前端胖头鱼';
me2.showName(); // 前端胖头鱼

const emptyObj2 = create(null);
console.log(emptyObj2);

const props = {
  // foo会成为所创建对象的数据属性
  foo: {
    writable: true,
    configurable: true,
    value: 'hello',
  },
  // bar会成为所创建对象的访问器属性
  bar: {
    configurable: false,
    get: function () {
      return 10;
    },
    set: function (value) {
      console.log('Setting `o.bar` to', value);
    },
  },
};
let o2 = create(Object.prototype, props); // 请看下面的截图
// 无法修改
o2.bar = '前端胖头鱼';

console.log(o2.foo); // hello
console.log(o2.bar); // 10

///OLOO
const Workshop = {
  setTeacher(teacher) {
    this.teacher = teacher;
  },
  ask(question) {
    console.log(this.teacher, question);
  },
};
const AnotherWorkshop = Object.assign(Object.create(Workshop), {
  speakUp(msg) {
    this.ask(msg.toUpperCase());
  },
});

let JSRecentParts = Object.create(AnotherWorkshop);
JSRecentParts.setTeacher('Kyle');
JSRecentParts.speakUp("But isn't that clear?");
