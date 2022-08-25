import RpsMatchMaker from "../models/match/rps.js";

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
 * 매칭된 이용자들을 접속시키는 room의 현황을 관리하는 클래스, 이후 각 종목마다 해당 클래스를 상속한 뒤 싱글톤 객체로 만들어서 이용
 */
class roomListSingleton {
  constructor() {
    this.list = {};
    this.roomFlag = {};
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
    if (
      !this.isRoomExisted(roomId) ||
      this.list[roomId].hasOwnProperty(player) ||
      this.roomSize(roomId) >= 2
    )
      return false;
    this.list[roomId][player] = [];
    return true;
  }
  exitPlayer(roomId, player) {
    if (!this.isRoomExisted(roomId) || !this.list[roomId].has(player)) return false;
    delete this.list[roomId][player];
    return true;
  }
}

class rpsRoomListSingleton extends roomListSingleton {
  constructor() {
    super();
  }
  /**
   * 코드 전체에 단 하나 존재하는 rpsRoomListSingleton 객체 반환
   */
  static sharedInstance() {
    if (!this.rpsRoomListSingleton) this.rpsRoomListSingleton = new rpsRoomListSingleton();
    return this.rpsRoomListSingleton;
  }
  recordRoundResult(roomId, player, hand) {
    this.list[roomId][player].push(hand);
  }
  async recordMatchResult(roomId, player, point) {
    if (this.roomFlag[roomId]) return;
    let match = this.getRoom(roomId);
    let newMatch = new RpsMatchMaker();
    let players = Object.keys(match);
    players.forEach((p, idx) => {
      if (idx === 0) {
        newMatch.player1 = p;
        newMatch.player1Record = match[p];
      } else if (idx === 1) {
        newMatch.player2 = p;
        newMatch.player2Record = match[p];
      }
    });
    if (point === 0) newMatch.winner = 0;
    else if (point > 0) newMatch.winner = players.findIndex((val) => val === player) + 1;
    else newMatch.winner = players.findIndex((val) => val !== player) + 1;
    console.log(newMatch);
    await newMatch.save();
  }
}

const roomListMap = {
  rps: rpsRoomListSingleton.sharedInstance(),
};
Object.freeze(roomListMap);

export { nicknameToSocketID, roomListMap };
