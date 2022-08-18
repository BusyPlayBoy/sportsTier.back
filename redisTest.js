import redis from "redis";
import readline from "node:readline";

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

const pub = redis.createClient();
pub.connect();

// (async function () {
//   await pub.zAdd("test",{score:100, value:"a"});
//   await pub.zAdd("test",{score:150,value:"bcd"});
//   console.log(await pub.zRangeByScoreWithScores("test",0,160));
//   for(let player of await pub.zRangeWithScores("test",0,-1)){
//     console.log(player);
//   }
//   //console.log(list);
//   await pub.quit();
// })();

// (async function(){
//     console.log("result:", await main());
// })();

// rl.on("line", (input) => {
//   pub.publish("test", input);
// });

// function main() {
//     const sub = redis.createClient();
//     sub.connect();
//     return new Promise ((resolve)=>{
//         sub.subscribe("test",(response)=>{
//             console.log("=>",response);
//             if (response==="close"){
//                 sub.unsubscribe("test");
//                 sub.quit();
//                 resolve(response);
//             }
//         });
//     })
// }
