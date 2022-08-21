import rpsUser from "../../models/user/rps.js";
const sportsId = {
  rps: 1,
};

Object.freeze(sportsId);

async function adjustAfterMatch(player, result, playerElo, opponentElo) {
  let rpsPlayer = await rpsUser.findOne({ email: player });
  let match = rpsPlayer.match;

  let weight;
  switch (true) {
    case match < 10:
      weight = 50;
      break;
    case 10 <= match && match < 30:
      weight = 30;
      break;
    case 30 <= match && match < 1400:
      weight = 20;
      break;
    default:
      weight = 10;
  }

  if (result === -1) result = 0;
  else if (result === 0) result = 0.5;

  let expectedWinProbability = 1 / (1 + 10 ** ((opponentElo - playerElo) / 400));
  let newEloRating = Math.round(playerElo + weight * (result - expectedWinProbability));
  let update = { eloRating: newEloRating, match: match + 1 };
  if (result === 1) update.win = rpsPlayer.win + 1;
  await rpsUser.findOneAndUpdate({ email: player }, update);
}

export { sportsId, adjustAfterMatch };
