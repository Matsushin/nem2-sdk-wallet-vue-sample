<template>
  <div class="wallet">
    <div v-if="address != ''">
        <p>アドレス：{{address}}</p>
        <p>残高：{{balance}} xem</p>
    </div>
    <div v-else>
        <p>ウォレット情報取得中...</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import localForage from 'localforage'

@Component({
  data: () => ({
  }),
  computed: {
      ...mapGetters({ address: 'wallet/address', balance: 'wallet/balance' }),
  }
})
export default class Wallet extends Vue {
    created() {
        this.$store.dispatch('wallet/loadWallet');
    }
}
</script>