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

      const ourHand = gameState["community_cards"].concat(us["hole_cards"]);

      const goodHand = this.doWeHaveAGoodHand(gameState["community_cards"], us["hole_cards"]);


      const flush = this.doWeHaveAFlush(ourHand);
      const haveAStraight = this.doWeHaveStraight(ourHand);

      const numberOfCards = ourHand.length;

      if (flush && numberOfCards === 5) {
        return bet(100000000);
      }

      if (flush && numberOfCards === 4) {
        return bet(callAmount);
      }

      if (flush && numberOfCards === 3) {
        const maybe = Math.floor(Math.random * 2);

        return maybe ? bet(callAmount) : bet(0);
      }

      if (haveAStraight && numberOfCards === 5) {
        return bet(100000000);
      }

      if (haveAStraight && numberOfCards === 4) {
        return bet(callAmount);
      }

      if (haveAStraight && numberOfCards === 3) {
        const maybe = Math.floor(Math.random * 2);

        return maybe ? bet(callAmount) : bet(0);
      }

      if (haveWeAlreadyBet && goodHand) {
        return bet(currentBuyIn + minimum_raise);
      }

      if (haveWeAlreadyBet) {
        return bet(callAmount);
      }

      if (goodHand) {
        return bet(currentBuyIn);
      }

      if (callAmount === minimum_raise && minimum_raise < 30) {
        return bet(callAmount);
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

  doWeHaveAFlush(hand) {
    return hand.reduce(
      ({ isFlush, suit }, current) => {
        if (suit === null) {
          return { isFlush, suit: current.suit };
        } else if (suit === current.suit) {
          return { isFlush, suit };
        } else {
          return { isFlush: false, suit };
        }
      },
      { isFlush: true, suit: null }
    ).isFlush;
  }

  doWeHaveStraight(hand) {
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

const handTypes = {
  straightFlush: 100,
  four: 80,
  fullHouse: 70,
  flush: 60,
  straight: 50,
  three: 40,
  twoPair: 30,
  pair: 20,
  highCard: 10,
};

const betterThan = (cardOne, cardTwo) => {
  const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

  return ranks.indexOf(cardOne.rank) >= ranks.indexOf(cardTwo.rank);
};

module.exports = Player;
