const state = {
  userShapeTokens: []
};

const getters = {
  getUserShapeTokens(state) {
    return state.userShapeTokens;
  }
};

const actions = {
  async fetchUserShapeTokens({ commit, rootState }) {
    let drizzleInstance = rootState.drizzle.drizzleInstance;
    // let web3 = drizzleInstance.web3;
    let currentUser = rootState.accounts.activeAccount;

    let userTokensList = [];
    
    // check how many tokens the user holds
    let tokensAmount = await drizzleInstance.contracts.Shapes.methods.balanceOf(currentUser).call();

    for (let i=0; i < tokensAmount; i++) {
      let tokenId = await drizzleInstance.contracts.Shapes.methods.tokenOfOwnerByIndex(currentUser, i).call();
      
      let typeId = await drizzleInstance.contracts.Shapes.methods.getShapeTypeIdOfToken(tokenId).call();
      
      userTokensList.push({tokenId, typeId});
    }

    commit("setUserShapeTokensList", userTokensList);
  }
}

const mutations = {
  setUserShapeTokensList(state, tList) {
    state.userShapeTokens = tList;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
