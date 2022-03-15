function instanceOf(father, child) {
  let fp = father.prototype;
  let cp = child.__proto__;

  while (cp) {
    if (fp === cp) {
      return true;
    }
    cp = cp.__proto__;
  }
  return false;
}
//https://stackoverflow.com/questions/9959727/proto-vs-prototype-in-javascript?page=2&tab=oldest#tab-top
