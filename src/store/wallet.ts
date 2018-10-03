import { AccountHttp, MosaicHttp, NamespaceHttp, MosaicService, Address, SimpleWallet, Password, NetworkType } from 'nem2-sdk';
import { filter, mergeMap } from 'rxjs/operators';
import localForage from 'localforage';

export default {
    namespaced: true,
    state: {
        address: '',
        balance: 0,
    },
    getters: {
        address(state: any): string {
            return state.address;
        },
        balance(state: any): number {
            return state.balance;
        },
    },
    mutations: {
        setAddress(state: any, address: any) {
            state.address = address;
        },
        setBalance(state: any, balance: number) {
            state.balance = balance;
        },
    },
    actions: {
        async loadWallet({ commit }) { 
            let key = 'wallet';
            let result:any = await localForage.getItem(key);
            if (result !== null) {
                commit('setAddress', result.address);
                const API_URL = 'http://catapult-test.44uk.net:3000';
                const accountHttp = new AccountHttp(API_URL);
                const mosaicHttp = new MosaicHttp(API_URL);
                const namespaceHttp = new NamespaceHttp(API_URL);
                const mosaicService = new MosaicService(accountHttp, mosaicHttp, namespaceHttp);
                mosaicService.mosaicsAmountViewFromAddress(Address.createFromRawAddress(result.address)).pipe(
                    mergeMap(_ => _),
                    filter(mo => mo.fullName() === 'nem:xem')
                ).subscribe(data => {
                    commit('setBalance', data.amount.lower / 10**6);
                });
            } else {
                // ここでウォレットを作成する
                const wallet = SimpleWallet.create('wallet', new Password('password'), NetworkType.MIJIN_TEST);
                const walletInfo = {
                    address: wallet.address.address,
                    privateKey: wallet.encryptedPrivateKey.encryptedKey,
                }
                let key = 'wallet';
                let result:any = await localForage.setItem(key, walletInfo);
                commit('setAddress', walletInfo.address);
            }
        }
    },
}
