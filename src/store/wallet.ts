import { AccountHttp, MosaicHttp, NamespaceHttp, MosaicService, Address, XEM, PlainMessage, TransactionHttp,
        SimpleWallet, Password, NetworkType, Account, TransferTransaction, Deadline } from 'nem2-sdk';
import { filter, mergeMap } from 'rxjs/operators';
import localForage from 'localforage';

const API_URL = 'http://catapult-test.44uk.net:3000/';

export default {
    namespaced: true,
    state: {
        address: '',
        privateKey: '',
        balance: 0,
        message: '',
        error: '',
    },
    getters: {
        address(state: any): string {
            return state.address;
        },
        balance(state: any): number {
            return state.balance;
        },
        message(state: any): string {
            return state.message;
        },
        error(state: any): string {
            return state.error;
        },
    },
    mutations: {
        setAddress(state: any, address: string) {
            state.address = address;
        },
        setPrivateKey(state: any, privateKey: string) {
            state.privateKey = privateKey;
        },
        setBalance(state: any, balance: number) {
            state.balance = balance;
        },
        setMessage(state: any, message: any) {
            state.message = message;
        },
        setError(state: any, error: any) {
            state.error = error;
        },
    },
    actions: {
        async loadWallet({ commit }) { 
            let key = 'wallet';
            let result:any = await localForage.getItem(key);
            if (result !== null) {
                commit('setAddress', result.address);
                commit('setPrivateKey', result.privateKey);
                const accountHttp = new AccountHttp(API_URL);
                const mosaicHttp = new MosaicHttp(API_URL);
                const namespaceHttp = new NamespaceHttp(API_URL);
                const mosaicService = new MosaicService(accountHttp, mosaicHttp, namespaceHttp);
                mosaicService.mosaicsAmountViewFromAddress(Address.createFromRawAddress(result.address)).pipe(
                    mergeMap(_ => _),
                    filter(mo => mo.fullName() === 'nem:xem')
                ).subscribe((data) => {
                    commit('setBalance', data.amount.lower / 10 ** 6);
                });
            } else {
                const password = new Password('password');
                const wallet = SimpleWallet.create('wallet', password, NetworkType.MIJIN_TEST);
                const walletInfo = {
                    address: wallet.address.address,
                    privateKey: wallet.encryptedPrivateKey.decrypt(password),
                };
                let key = 'wallet';
                await localForage.setItem(key, walletInfo);
                commit('setAddress', walletInfo.address);
                commit('setPrivateKey', walletInfo.privateKey);
            }
        },
        sendXem({ commit }, payload: any) {
            const transferTransaction = TransferTransaction.create(
                Deadline.create(),
                Address.createFromRawAddress(payload.toAddress),
                [XEM.createRelative(parseInt(payload.toAmount, 10))],
                PlainMessage.create(payload.toMessage),
                NetworkType.MIJIN_TEST,
            );
            const account = Account.createFromPrivateKey(this.state.wallet.privateKey, NetworkType.MIJIN_TEST);
            const signedTransaction = account.sign(transferTransaction);
            const transactionHttp = new TransactionHttp(API_URL);
            transactionHttp.announce(signedTransaction).subscribe(
                res => {
                    commit('setMessage', res.message);
                },
                err => {
                    commit('setError', err.toString());
                }
            );
        },
    },
}
