const state = {
  allShapeTypes: []
};

const getters = {
  getAllShapeTypes(state) {
    return state.allShapeTypes;
  }
};

const actions = {
  async fetchAllShapeTypes({ commit, rootState }) {
    let drizzleInstance = rootState.drizzle.drizzleInstance;
    let web3 = drizzleInstance.web3;

    let shapeTypesCount = await drizzleInstance.contracts.Shapes.methods.getShapeTypesArrayLength().call();

    let allShapeTypesList = [];

    for (let i=0; i < shapeTypesCount; i++) {
      // get shape data
      let currentShape = await drizzleInstance.contracts.Shapes.methods.getShapeTypeByIndex(i).call();

      let typeId = currentShape[0];
      let name = web3.utils.hexToUtf8(currentShape[1]);
      let symbol = web3.utils.hexToUtf8(currentShape[2]);
      let supply = currentShape[3];
      let priceWei = currentShape[4];
      let priceEth = web3.utils.fromWei(currentShape[4], "ether");
      let active = currentShape[5];

      allShapeTypesList.push({typeId, name, symbol, supply, priceWei, priceEth, active});
    }

    commit("setAllShapeTypesList", allShapeTypesList);
  }
};

const mutations = {
  setAllShapeTypesList(state, aTypes) {
    state.allShapeTypes = aTypes;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
