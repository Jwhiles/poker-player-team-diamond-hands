class Player {
  static get VERSION() {
    return '0.1';
  }

  betRequest(gameState, bet) {
    // const { players, current_buy_in }

    // const callAmount = current_buy_in - players[in_action][bet]

    const betOrNot = Math.floor(Math.random() * 2)

    betOrNot ? bet(100000000) : bet(0)
  }

  static showdown(gameState) {
  }
}

module.exports = Player;
