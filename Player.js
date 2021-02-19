class Player {
  VERSION() {
    return "0.2";
  }

  betRequest(gameState, bet) {
    try {
      const { players, in_action, current_buy_in, minimum_raise, small_blind } = gameState;

      const us = this.getOurPlayer(gameState);

      const callAmount = current_buy_in - us.bet;

      const currentBuyIn = current_buy_in - us.bet + minimum_raise;

      const haveWeAlreadyBet = us.bet > small_blind;

      const betOrNot = this.doWeHaveAGoodHand(gameState["community_cards"], us["hole_cards"]);

      haveWeAlreadyBet ? bet(callAmount) : betOrNot ? bet(currentBuyIn) : bet(0);
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

  showdown(gameState) {}
}

module.exports = Player;
