class Player {
  static get VERSION() {
    return "0.2";
  }

  betRequest(gameState, bet) {
    try {
      const { players, in_action, current_buy_in, minimum_raise } = gameState;

      const callAmount = current_buy_in - players[in_action]["bet"];

      const currentBuyIn = current_buy_in - players[in_action]["bet"] + minimum_raise;

      const us = this.getOurPlayer(gameState);

      const haveWeAlreadyBet = us.bet > 0;

      const betOrNot = this.doWeHaveAGoodHand(gameState['community_cards'], us["hole_cards"]);

      haveWeAlreadyBet ? bet(currentBuyIn) : betOrNot ? bet(currentBuyIn) : bet(0);
    } catch (e) {
      console.log(e);
      bet(0);
    }
  }

  getOurPlayer(gameState) {
    return gameState.players.find(player => {
      return player.name === "Team Diamond Hands";
    });
  }

  // be wary of community card
  doWeHaveAGoodHand(communityCards, privateCards) {
    const allCards = communityCards.concat(privateCards);

    const ranks = allCards.reduce((acc, card) => {
      if (acc[card.rank]) {
        acc[card.rank] += 1;
      } else {
        acc[card.rank] = 1;
      }
      return acc;
    }, {});

    let goodHand = false;

    for (const rank in ranks) {
      if (ranks[rank] >= 2) {
        goodHand = true;
      }
    }

    return goodHand;
  }

  static showdown(gameState) {}
}

module.exports = Player;
