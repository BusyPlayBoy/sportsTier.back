class nicknameToSocketID {
  constructor() {
    this.hashMap = {};
  }
  static sharedInstance() {
    if (!this.nicknameToSocketID) this.nicknameToSocketID = new nicknameToSocketID();
    return this.nicknameToSocketID;
  }
  getAll() {
    return { ...this.hashMap };
  }
  getSocketID(nickname) {
    return this.hashMap[nickname];
  }
  setSocketID(nickname, socektID) {
    this.hashMap[nickname] = socektID;
  }
  deleteSocketID(nickname) {
    delete this.hashMap[nickname];
  }
}
/**
 * 매칭된 이용자들을 접속시키는 room의 현황을 관리하는 싱글톤 객체
 */
class roomListSingleton {
  constructor() {
    this.list = {};
    this.roomFlag = {};
  }
  /**
   * 코드 전체에 단 하나 존재하는 roomListSingleton 객체 반환
   * @returns {roomListSingleton} roomListSingleton 객체
   */
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

export { nicknameToSocketID,roomListSingleton };
