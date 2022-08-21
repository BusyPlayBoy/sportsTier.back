class emailToSocketID {
  constructor() {
    this.hashMap = {};
  }
  static sharedInstance() {
    if (!this.emailToSocketID) this.emailToSocketID = new emailToSocketID();
    return this.emailToSocketID;
  }
  getAll() {
    return { ...this.hashMap };
  }
  getSocketID(email) {
    return this.hashMap[email];
  }
  setSocketID(email, socektID) {
    this.hashMap[email] = socektID;
  }
  deleteSocketID(email) {
    delete this.hashMap[email];
  }
}

class roomListSingleton {
  constructor() {
    this.list = {};
    this.roomFlag = {};
  }
  // 싱글톤 디자인
  static sharedInstance() {
    if (!this.roomListSingleton) this.roomListSingleton = new roomListSingleton();
    return this.roomListSingleton;
  }
  getAll() {
    return { ...this.list };
  }
  getRoom(roomId) {
    return this.list[roomId];
  }
  addRoom(roomId) {
    if (this.isRoomExisted(roomId)) return false;
    this.list[roomId] = {};
    this.roomFlag[roomId] = true;
    return true;
  }
  delRoom(roomId) {
    if (!this.isRoomExisted(roomId)) return false;
    if (this.roomFlag[roomId]) this.roomFlag[roomId] = false;
    else {
      delete this.roomFlag[roomId];
      delete this.list[roomId];
    }
    return true;
  }
  isRoomExisted(roomId) {
    return !!this.list.hasOwnProperty(roomId);
  }
  roomSize(roomId) {
    return Object.keys(this.list[roomId]).length;
  }
  entryPlayer(roomId, player) {
    if (!this.isRoomExisted(roomId) || this.list[roomId].hasOwnProperty(player) || this.roomSize(roomId) >= 2)
      return false;
    this.list[roomId][player]=[];
    return true;
  }
  exitPlayer(roomId, player) {
    if (!this.isRoomExisted(roomId) || !this.list[roomId].has(player)) return false;
    delete this.list[roomId][player];
    return true;
  }
}

export { emailToSocketID,roomListSingleton };
