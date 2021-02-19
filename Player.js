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

      const goodHand = this.doWeHaveAGoodHand(gameState["community_cards"], us["hole_cards"]);

      if (haveWeAlreadyBet && goodHand) {
        return bet(currentBuyIn + minimum_raise);
      }

      if (haveWeAlreadyBet) {
        maybe = Math.floor(Math.random() * 2)

        return maybe ? bet(callAmount) : bet(0);
      }

      if (goodHand) {
        return bet(currentBuyIn) 
      }

      return bet(0)
    } catch (e) {
      console.log(e);
      return bet(0);
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
