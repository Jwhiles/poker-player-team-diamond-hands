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

      const ourHand = (gameState["community_cards"]).concat(us["hole_cards"])

      const goodHand = this.doWeHaveAGoodHand(gameState["community_cards"], us["hole_cards"]);

      const haveAStraight = this.doWeHaveStraight(ourHand);

      if (haveAStraight) {
        return bet(100000000)
      }

      if (haveWeAlreadyBet && goodHand) {
        return bet(currentBuyIn + minimum_raise);
      }

      if (haveWeAlreadyBet) {
        bet(callAmount) 
      }

      if (goodHand) {
        return bet(currentBuyIn);
      }

      if (callAmount === minimum_raise && minimum_raise < 30) {
        bet(callAmount);
      }

      return bet(0);
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

  doWeHaveStraight(hand) {
    if (hand.length < 5) {
      return false;
    }

    const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const indexes = hand.map(card => ranks.indexOf(card.rank));

    indexes.sort((a, b) => a - b);

    return indexes.reduce(
      ({ isStraight, prev }, current) => {
        if (prev === null) {
          return { isStraight, prev: current };
        } else if (current - 1 === prev) {
          return { isStraight, prev: current };
        } else {
          return { isStraight: false, prev: current };
        }
      },
      { isStraight: true, prev: null }
    ).isStraight;
  }

  getHighestCard(communityCards, privateCards) {
    const allCards = communityCards.concat(privateCards);

    return allCards.reduce((result, card) => {
      if (result === null) {
        return card;
      }

      if (betterThan(card, result)) {
        return card;
      }

      return result;
    }, null);
  }

  getHandType(communityCards, privateCards) {}

  showdown(gameState) {}
}

const handTypes = [
  "straightFlush",
  "four",
  "fullHouse",
  "flush",
  "straight",
  "three",
  "twoPair",
  "pair",
  "highCard",
];

const betterThan = (cardOne, cardTwo) => {
  const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

  return ranks.indexOf(cardOne.rank) >= ranks.indexOf(cardTwo.rank);
};

module.exports = Player;
