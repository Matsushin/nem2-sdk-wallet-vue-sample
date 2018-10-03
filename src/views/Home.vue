<template>
  <div class="home">
    <Wallet />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Wallet from '@/components/Wallet.vue';

@Component({
  components: {
    Wallet,
  },
})
export default class Home extends Vue {}
</script>
