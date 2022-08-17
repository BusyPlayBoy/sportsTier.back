import http from "node:http";
import readline from "node:readline";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("login? or signup?: ", (method) => {
  if (method==="login") login()
  else if(method==="signup") signup()
});


function login() {
  rl.question("{email} {password} plz: ", (input) => {
    let [email, password] = input.split(" ");
    const body = JSON.stringify({ email, password });
    const req = http.request(
      {
        port: 3000,
        host: "localhost",
        path: "/account/login",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      (res) => {
        res.setEncoding("utf-8");
        res.on("data", (data) => {
          console.log(data);
          //console.log(JSON.parse(data));
        });
      }
    );
    console.log(body);
    req.write(body);
    req.end();
  });
}

function signup() {
  rl.question("{email} {password} {nickname} plz: ", (input) => {
    let [email, password, nickname] = input.split(" ");
    let allowNotice = true;
    const body = JSON.stringify({
      email,
      password,
      nickname,
      allowNotice,
    });
    const req = http.request(
      {
        port: 3000,
        host: "localhost",
        path: "/account/signup",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      (res) => {
        res.setEncoding("utf-8");
        res.on("data", (data) => {
          console.log(data);
          //console.log(JSON.parse(data));
        });
      }
    );
    console.log(body);
    req.write(body);
    req.end();
  });
}
