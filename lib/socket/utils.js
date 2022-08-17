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

export { emailToSocketID };
