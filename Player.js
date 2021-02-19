class Player {
  static get VERSION() {
    return '0.1';
  }

  betRequest(gameState, bet) {
    const { players, in_action, current_buy_in, minimum_raise } = gameState

    const callAmount = current_buy_in - players[in_action]['bet']

    const currentBuyIn = current_buy_in - players[in_action]['bet'] + minimum_raise

    const betOrNot = Math.floor(Math.random() * 2)

    betOrNot ? bet(callAmount) : bet(0)
  }

  static showdown(gameState) {
  }
}

module.exports = Player;
