const Player = require("./player");

const exampleGameState = {
  tournament_id: "550d1d68cd7bd10003000003", // Id of the current tournament

  game_id: "550da1cb2d909006e90004b1", // Id of the current sit'n'go game. You can use this to link a
  // sequence of game states together for logging purposes, or to
  // make sure that the same strategy is played for an entire game

  round: 0, // Index of the current round within a sit'n'go

  bet_index: 0, // Index of the betting opportunity within a round

  small_blind: 10, // The small blind in the current round. The big blind is twice the
  //     small blind

  current_buy_in: 320, // The amount of the largest current bet from any one player

  pot: 400, // The size of the pot (sum of the player bets)

  minimum_raise: 240, // Minimum raise amount. To raise you have to return at least:
  //     current_buy_in - players[in_action][bet] + minimum_raise

  dealer: 1, // The index of the player on the dealer button in this round
  //     The first player is (dealer+1)%(players.length)

  orbits: 7, // Number of orbits completed. (The number of times the dealer
  //     button returned to the same player.)

  in_action: 1, // The index of your player, in the players array

  players: [
    // An array of the players. The order stays the same during the
    {
      //     entire tournament

      id: 0, // Id of the player (same as the index)

      name: "Team Diamond Hands", // Name specified in the tournament config

      status: "active", // Status of the player:
      //   - active: the player can make bets, and win the current pot
      //   - folded: the player folded, and gave up interest in
      //       the current pot. They can return in the next round.
      //   - out: the player lost all chips, and is out of this sit'n'go

      version: "Default random player", // Version identifier returned by the player

      stack: 1010, // Amount of chips still available for the player. (Not including
      //     the chips the player bet in this round.)

      bet: 320, // The amount of chips the player put into the pot
      hole_cards: [
        // The cards of the player. This is only visible for your own player
        //     except after showdown, when cards revealed are also included.
        {
          rank: "6", // Rank of the card. Possible values are numbers 2-10 and J,Q,K,A
          suit: "hearts", // Suit of the card. Possible values are: clubs,spades,hearts,diamonds
        },
        {
          rank: "K",
          suit: "spades",
        },
      ],
    },
    {
      id: 1, // Your own player looks similar, with one extension.
      name: "Bob",
      status: "active",
      version: "Default random player",
      stack: 1590,
      bet: 80,
    },
    {
      id: 2,
      name: "Chuck",
      status: "out",
      version: "Default random player",
      stack: 0,
      bet: 0,
    },
  ],
  community_cards: [
    // Finally the array of community cards.
    {
      rank: "4",
      suit: "spades",
    },
    {
      rank: "A",
      suit: "hearts",
    },
    {
      rank: "6",
      suit: "clubs",
    },
  ],
};

describe("test player", () => {
  const player = new Player();

  describe("bet request", () => {
    it("returns 0", () => {
      const bet = jest.fn();
      player.betRequest(exampleGameState, bet);
      expect(bet).toHaveBeenCalledWith(240);
    });
  });


  describe("get highest card", () => {
    it("returns the highest ranked card", () => {
      const privateCards = [{ rank: "10" }, { rank: "4" }];
      const community = [{ rank: "10" }, { rank: "5" }, { rank: "A" }];
      expect(player.getHighestCard(privateCards, community)).toEqual({ rank: "A" });
    });
  });

  describe("do we have a straight", () => {
    it("returns true if we have a straight", () => {
      const hand = [{ rank: "10" }, { rank: "9" }, { rank: "J" }, { rank: "Q" }, { rank: "K" }];
      expect(player.doWeHaveStraight(hand)).toEqual(true);
    });

    it("returns false if we do not have a straight", () => {
      const hand = [{ rank: "10" }, { rank: "8" }, { rank: "J" }, { rank: "Q" }, { rank: "K" }];
      expect(player.doWeHaveStraight(hand)).toEqual(false);
    });
  });

  describe("do we have a flush", () => {
    it("returns true if we have a flush", () => {
      const hand = [
        { rank: "10", suit: "hearts" },
        { rank: "9", suit: "hearts" },
        { rank: "J", suit: "hearts" },
        { rank: "Q", suit: "hearts" },
        { rank: "K", suit: "hearts" },
      ];
      expect(player.doWeHaveAFlush(hand)).toEqual(true);
    });

    it("returns false if we do not have a flush", () => {
      const hand = [
        { rank: "10", suit: "spades" },
        { rank: "9", suit: "hearts" },
        { rank: "J", suit: "hearts" },
        { rank: "Q", suit: "hearts" },
        { rank: "K", suit: "hearts" },
      ];
      expect(player.doWeHaveAFlush(hand)).toEqual(false);
    });
  });

  describe('do we have a twopair', () => {
    it("returns true if we do", () => {
      expect(
        player.doWeHaveTwoPair([
          { rank: "A", suit: "spades" },
          { rank: "A", suit: "hearts" },
          { rank: "10", suit: "spades" },
          { rank: "10", suit: "hearts" },
        ])
      ).toEqual(true);
    });

    it("returns true if there's a triple if we do not", () => {
      expect(
        player.doWeHaveTwoPair([
          { rank: "A", suit: "spades" },
          { rank: "A", suit: "hearts" },
          { rank: "10", suit: "spades" },
          { rank: "10", suit: "spades" },
          { rank: "10", suit: "hearts" },
        ])
      ).toEqual(true);
    });

    it("returns false if we do not", () => {
      expect(
        player.doWeHaveTwoPair([
          { rank: "A", suit: "spades" },
          { rank: "A", suit: "hearts" },
          { rank: "9", suit: "spades" },
          { rank: "10", suit: "hearts" },
        ])
      ).toEqual(false);
    });
  })

  describe("getTierOfStartingHand", () => {
    it("returns correct tier for two aces", () => {
      expect(
        player.getTierOfStartingHand([
          { rank: "A", suit: "spades" },
          { rank: "A", suit: "hearts" },
        ])
      ).toEqual(1);
    });

    it("returns correct tier for two aces", () => {
      expect(
        player.getTierOfStartingHand([
          { rank: "A", suit: "spades" },
          { rank: "J", suit: "spades" },
        ])
      ).toEqual(4);
    });
  });

  describe("getTierOfHand", () => {
    it("returns correct tier for pair", () => {
      expect(
        player.getTierOfHand([
          { rank: "A", suit: "spades" },
          { rank: "A", suit: "hearts" },
        ])
      ).toEqual(3);
    });

    it("returns correct tier for full house", () => {
      expect(
        player.getTierOfHand([
          { rank: "A", suit: "spades" },
          { rank: "A", suit: "hearts" },
          { rank: "2", suit: "spades" },
          { rank: "2", suit: "hearts" },
          { rank: "2", suit: "diamonds" },
        ])
      ).toEqual(1);
    });

    it("returns correct tier for bad hand", () => {
      expect(
        player.getTierOfHand([
          { rank: "Q", suit: "spades" },
          { rank: "A", suit: "hearts" },
          { rank: "5", suit: "spades" },
          { rank: "6", suit: "hearts" },
          { rank: "2", suit: "diamonds" },
        ])
      ).toEqual(4);
    });
  });
});
