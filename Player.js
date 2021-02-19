const tiers = [
  new Set(["AA", "KK", "AKs", "QQ", "AK"]),
  new Set(["JJ", "1010", "99"]),
  new Set(["88", "77", "AQs", "AQ"]),
  new Set(["66", "55", "44", "33", "22", "AJs", "ATs", "A9s", "A8s"]),
  new Set(["A7s", "A6s", "A5s", "A4s", "A3s", "A2s", "KQs", "KQ"]),
  new Set(["QJs", "JTs", "T9s", "98s", "87s", "76s", "65s"]),
];

const allin = 10000000000;

class Player {
  VERSION() {
    return "0.2";
  }

  getTierOfHand(ourHand) {
    const flush = this.doWeHaveAFlush(ourHand);
    const straight = this.doWeHaveStraight(ourHand);
    const twoPair = this.doWeHaveTwoPair(ourHand);
    const pair = this.doWeHavePair(ourHand);
    const three = this.doWeHaveThreeOfAKind(ourHand);
    const four = this.doWeHaveFourOfAKind(ourHand);
    const fullHouse = this.doWeHaveFullHouse(ourHand);

    if (flush || four || fullHouse) {
      return 1;
    }

    if (twoPair || straight || three) {
      return 2;
    }

    if (pair) {
      return 3;
    }

    return 4;
  }

  // [{ rank: Rank, suit: Suit }] -> Tier (number from 1-7 7 is trash)
  getTierOfStartingHand([cardOne, cardTwo]) {
    const suited = cardOne.suit === cardTwo.suit;

    let code = betterThan(cardOne, cardTwo)
      ? cardOne.rank + cardTwo.rank
      : cardTwo.rank + cardOne.rank;

    if (suited) {
      code = code + "s";
    }

    for (const [i, v] of tiers.entries()) {
      if (v.has(code)) {
        return i + 1;
      }
    }

    return 7;
  }

  betRequest(gameState, bet) {
    try {
      const us = this.getOurPlayer(gameState);

      const { players, in_action, current_buy_in, minimum_raise, small_blind } = gameState;

      const callAmount = current_buy_in - us.bet;

      const currentBuyIn = current_buy_in - us.bet + minimum_raise;

      const haveWeAlreadyBet = us.bet > small_blind;

      const ourHand = gameState["community_cards"].concat(us["hole_cards"]);

      const flush = this.doWeHaveAFlush(ourHand);
      const haveAStraight = this.doWeHaveStraight(ourHand);

      const numberOfCards = ourHand.length;

      if (this.start(ourHand)) {
        const tier = this.getTierOfStartingHand(us["hole_cards"]);

        switch (tier) {
          case 1:
            return bet(100000000);
          case 2:
            return bet(currentBuyIn + minimum_raise + minimum_raise + minimum_raise);
          case 3:
            return bet(currentBuyIn + minimum_raise + minimum_raise);
          case 4:
            return bet(currentBuyIn + minimum_raise);
          case 5:
            return bet(callAmount);
          case 6:
            return bet(callAmount);
          case 7:
            return bet(0);
          default:
            return bet(0);
        }
      }

      const tier = this.getTierOfHand(ourHand);

      switch (tier) {
        case 1:
          return bet(allin);
        case 2:
          return bet(currentBuyIn + minimum_raise + minimum_raise);
        case 3:
          return bet(callAmount);
        default:
          return bet(0);
      }
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

  doWeHavePair(hand) {
    const ranks = hand.reduce((acc, card) => {
      if (acc[card.rank]) {
        acc[card.rank] += 1;
      } else {
        acc[card.rank] = 1;
      }
      return acc;
    }, {});

    let goodHand = false;

    let pairCount = 0;

    for (const rank in ranks) {
      if (ranks[rank] >= 2) {
        pairCount += 1;
      }
    }

    return pairCount === 1;
  }

  doWeHaveTwoPair(hand) {
    const ranks = hand.reduce((acc, card) => {
      if (acc[card.rank]) {
        acc[card.rank] += 1;
      } else {
        acc[card.rank] = 1;
      }
      return acc;
    }, {});

    let goodHand = false;

    let pairCount = 0;

    for (const rank in ranks) {
      if (ranks[rank] >= 2) {
        pairCount += 1;
      }
    }

    return pairCount >= 2;
  }

  doWeHaveThreeOfAKind(hand) {
    const ranks = hand.reduce((acc, card) => {
      if (acc[card.rank]) {
        acc[card.rank] += 1;
      } else {
        acc[card.rank] = 1;
      }
      return acc;
    }, {});

    let haveThree = false;

    for (const rank in ranks) {
      if (ranks[rank] === 3) {
        haveThree = true;
      }
    }

    return haveThree;
  }

  doWeHaveFourOfAKind(hand) {
    const ranks = hand.reduce((acc, card) => {
      if (acc[card.rank]) {
        acc[card.rank] += 1;
      } else {
        acc[card.rank] = 1;
      }
      return acc;
    }, {});

    let haveFour = false;

    for (const rank in ranks) {
      if (ranks[rank] >= 4) {
        haveFour = true;
      }
    }

    return haveFour;
  }

  doWeHaveFullHouse(hand) {
    const ranks = hand.reduce((acc, card) => {
      if (acc[card.rank]) {
        acc[card.rank] += 1;
      } else {
        acc[card.rank] = 1;
      }
      return acc;
    }, {});

    let haveThree = false;
    let haveTwo = false;

    for (const rank in ranks) {
      if (ranks[rank] === 3) {
        haveThree = true;
      }
      if (ranks[rank] === 2) {
        haveTwo = true;
      }
    }

    return haveThree && haveTwo;
  }

  start(hand) {
    return hand.length === 2;
  }

  end(hand) {
    return hand.length === 5;
  }

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
