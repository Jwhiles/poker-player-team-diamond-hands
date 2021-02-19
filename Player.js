const tiers = [
  new Set(["AA", "KK", "AKs", "QQ", "AK"]),
  new Set(["JJ", "1010", "99"]),
  new Set(["88", "77", "AQs", "AQ"]),
  new Set(["66", "55", "44", "33", "22", "AJs", "ATs", "A9s", "A8s"]),
  new Set(["A7s", "A6s", "A5s", "A4s", "A3s", "A2s", "KQs", "KQ"]),
  new Set(["QJs", "JTs", "T9s", "98s", "87s", "76s", "65s"]),
];

class Player {
  VERSION() {
    return "0.2";
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
    // Are we looking at two cards?
    // Look which tier the hand falls into
    // depending on the tier, either call, raise, or fold

    // Are we looking at more cards

    try {
      const us = this.getOurPlayer(gameState);

      const { players, in_action, current_buy_in, minimum_raise, small_blind } = gameState;

      const callAmount = current_buy_in - us.bet;

      const currentBuyIn = current_buy_in - us.bet + minimum_raise;

      const haveWeAlreadyBet = us.bet > small_blind;

      const ourHand = gameState["community_cards"].concat(us["hole_cards"]);

      const goodHand = this.pairsOrWhatever(gameState["community_cards"], us["hole_cards"]);

      const flush = this.doWeHaveAFlush(ourHand);
      const haveAStraight = this.doWeHaveStraight(ourHand);

      const numberOfCards = ourHand.length;

      if (gameState["community_cards"].length === 0) {
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
  pairsOrWhatever(communityCards, privateCards) {
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
