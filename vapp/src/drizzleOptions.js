import Shapes from './contracts/Shapes.json';

const options = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:7545'
    }
  },
  contracts: [Shapes],
  events: {
    Shapes: ['TokenMinted', 'TokenBurned', 'ShapeTypeAdded', 'ShapeTypeDeactivated', 'EtherCollected']
  },
  polls: {
    accounts: 15000
  }
}

export default options
