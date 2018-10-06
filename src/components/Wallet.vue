<template>
  <div class="wallet">
    <div v-if="address != ''">
        <h2 class="mt-5 mb-2">アカウント情報</h2>
        <p>アドレス：{{address}}</p>
        <p>
            残高：{{ balance }} xem
            <v-btn fab small flat @click="getBalance()" :loading="isLoading"><v-icon>cached</v-icon></v-btn>
        </p>
        <div v-for="(item, index) in validation" :key="index" class="errorLabel">
            <div v-if="item!==true">{{ item }}</div>
        </div>
        <h2 class="mt-5 mb-2">送金</h2>
            <v-text-field
                label="送金先"
                v-model="toAddress"
                :counter="40"
                required
                placeholder="例. NBHWRG6STRXL2FGLEEB2UOUCBAQ27OSGDTO44UFC"
            ></v-text-field>
            <v-text-field
                label="XEM"
                v-model="toAmount"
                type="number"
                required
            ></v-text-field>
        <v-text-field
            label="メッセージ"
            v-model="toMessage"
            :counter="1024"
            placeholder="例. ありがとう"
        ></v-text-field>
        <v-flex>
            <v-btn color="blue" class="white--text" @click="tapSend()">XEMを送金する</v-btn>
        </v-flex>
        <h2 class="mt-5 mb-2">送金結果</h2>
        <div v-if="successMessage != ''">
            <v-alert
            :value="true"
            type="success"
            >
            成功：{{successMessage}}
            </v-alert>
        </div>
        <div v-if="errorMessage != ''">
            <v-alert
            :value="true"
            type="error"
            >
            失敗：{{errorMessage}}
            </v-alert>
        </div>
    </div>
    <div v-else>
        <div class="mt-5 ml-5">
            <v-progress-circular
                indeterminate
                color="primary"
            ></v-progress-circular>
        </div>
        <p class="mt-5">ウォレット情報を作成または取得中...</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
  data: () => ({
    rules: {
      senderAddrLimit: (value: string) => (value && (value.length === 46 || value.length === 40)) || '送金先アドレス(-除く)は40文字です。',
      senderAddrInput: (value: string) => {
        const pattern = /^[a-zA-Z0-9-]+$/;
        return pattern.test(value) || '送金先の入力が不正です';
      },
      amountLimit: (value: number) => (value >= 0) || '数量を入力してください',
      amountInput: (value: string) => {
        const pattern = /^[0-9.]+$/;
        return (pattern.test(value) && !isNaN(Number(value))) || '数量の入力が不正です';
      },
      messageRules: (value: string) => (value.length <= 1024) || 'メッセージの最大文字数が超えています。',
    },
  }),
  computed: {
      ...mapGetters({ address: 'wallet/address', balance: 'wallet/balance', successMessage: 'wallet/message', errorMessage: 'wallet/error' }),
  },
})
export default class Wallet extends Vue {
    private isLoading: boolean = false;
    private toAmount: number = 0;
    private toAddress: string = '';
    private toMessage: string = '';
    private validation: any[] = [];

    private async created() {
        await this.$store.dispatch('wallet/loadOrCreateWallet');
        this.getBalance();
    }

    private async getBalance() {
        this.isLoading = true;
        await this.$store.dispatch('wallet/getBalance');
        this.isLoading = false;
    }

    private tapSend() {
        if (this.isValidation() === true) {
            const payload = {
                toAddress: this.toAddress,
                toAmount: this.toAmount,
                toMessage: this.toMessage,
            };
            this.$store.dispatch('wallet/sendXem', payload);
        }
    }

    private isValidation() {
        this.validation = [];
        this.validation.push(this.$data.rules.senderAddrLimit(this.toAddress));
        this.validation.push(this.$data.rules.senderAddrInput(this.toAddress));
        this.validation.push(this.$data.rules.amountLimit(this.toAmount));
        this.validation.push(this.$data.rules.amountInput(this.toAmount));
        this.validation.push(this.$data.rules.messageRules(this.toMessage));
        let isError: boolean = false;
        this.validation.forEach((obj: any) => {
            if (obj !== true) { isError = true; }
        });
        return !isError;
    }
}
</script>
<style scoped>
.wallet {
  word-break: break-all;
}
.errorLabel {
  color: red;
}
</style>