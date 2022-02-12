function instanceOf(constructor, instance) {
  let cp = constructor.prototype;
  let ip = instance.__proto__;

  while (ip) {
    if (cp === ip) {
      return true;
    }
    cp = cp.__proto__;
  }
  return false;
}
//https://stackoverflow.com/questions/9959727/proto-vs-prototype-in-javascript?page=2&tab=oldest#tab-top
