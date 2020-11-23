<template>
    <div v-if="isDrizzleInitialized">
        <b-container class="mt-3">
            <b-row class="mt-4">
                <b-col md="4" offset-md="4" class="text-center">
                    <h1>Profile</h1>

                    <b-card class="mb-2">
                        <Gravatar class="img-fluid" :email="activeAccount" default-img="robohash" :size=200 />

                        <b-card-text class="mt-2">
                            <p>{{ activeAccount }}</p>
                            <p><strong>My ETH balance:</strong> {{ Number(getEthBalance).toFixed(4) }} ETH</p>
                        </b-card-text>

                        <router-link to="/minter">
                            <b-button variant="primary" href="/minter">Mint NFT tokens!</b-button>
                        </router-link>
                    </b-card>
                </b-col>
            </b-row>

            <div v-if="getTokensShapeData.length > 0">
                <hr>

                <h3 class="text-center mt-3">My ERC-721 tokens</h3>
            </div>

            <b-card-group deck class="row mt-4 text-center">
                <b-col class="mt-3" md="4" v-for="shape in getTokensShapeData" :key="shape.tokenId"> 
                        <b-card header-tag="header" footer-tag="footer">
                            <template #header>
                                <h6 class="mb-1">
                                    Shape #{{shape.tokenId}} 
                                    <b-badge v-if="!shape.active" variant="danger">deactivated</b-badge>
                                    </h6>
                            </template>

                            <b-card-title>{{shape.name}} ({{shape.symbol}})</b-card-title>

                            <b-card-text class="m-4">
                                <b-icon :icon="shape.name" animation="fade" :variant="shape.active ? 'primary' : 'danger'" font-scale="5"></b-icon>
                            </b-card-text>

                            <b-button href="#" variant="danger" @click="burnShape(shape)">
                                Burn
                            </b-button>
                        </b-card>
                </b-col>
            </b-card-group>
        </b-container>
    </div>

    <div v-else>Loading...</div>
</template>

<script>
import { mapGetters } from 'vuex';
import Gravatar from "vue-gravatar";

export default {
    name: "Profile",
    components: {
        Gravatar
    },
    computed: {
        ...mapGetters("accounts", ["activeAccount", "activeBalance"]),
        ...mapGetters("drizzle", ["isDrizzleInitialized", "drizzleInstance"]),
        ...mapGetters('contracts', ['getContractData', 'contractInstances']),
        ...mapGetters("minter", ["getAllShapeTypes"]),
        ...mapGetters('profile', ['getUserShapeTokens']),

        getEthBalance() {
            return this.drizzleInstance.web3.utils.fromWei(this.activeBalance, "ether");
        },
        getTokensShapeData() {
            let tokensList = [];
            for (let shapeToken of this.getUserShapeTokens) {
                for (let shapeType of this.getAllShapeTypes) {
                    if (shapeType.typeId === shapeToken.typeId) {
                        tokensList.push({
                            tokenId: shapeToken.tokenId,
                            typeId: shapeType.typeId,
                            name: shapeType.name,
                            symbol: shapeType.symbol,
                            priceWei: shapeType.priceWei,
                            priceEth: shapeType.priceEth,
                            supply: shapeType.supply,
                            active: shapeType.active
                        });
                    }
                }
            }
            return tokensList; 
        },
        userAccount() {
            return this.activeAccount
        }
    },
    created() {
        this.$store.dispatch("minter/fetchAllShapeTypes");
        this.$store.dispatch("profile/fetchUserShapeTokens");
    },
    methods: {
        burnShape(shape) {
            this.drizzleInstance.contracts["Shapes"].methods["burnByTokenId"].cacheSend(shape.tokenId);
        }
    }
}
</script>

<style>

</style>