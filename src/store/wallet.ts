import { AccountHttp, MosaicHttp, NamespaceHttp, MosaicService, Address, XEM, PlainMessage, TransactionHttp,
        SimpleWallet, Password, NetworkType, Account, TransferTransaction, Deadline } from 'nem2-sdk';
import { filter, mergeMap } from 'rxjs/operators';
import * as localForage from 'localforage';

const API_URL = 'http://catapult48gh23s.xyz:3000';
const WALLET_KEY = 'wallet';
interface Wallet {
    address: string;
    privateKey: string;
}

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
        setWallet(state: any, wallet: Wallet) {
            state.address = wallet.address;
            state.privateKey = wallet.privateKey;
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
        async loadOrCreateWallet({ dispatch, commit }: { dispatch: any, commit: any }) {
            const walletInfo: Wallet | {} = await localForage.getItem(WALLET_KEY);
            if (walletInfo !== null) {
                commit('setWallet', walletInfo);
            } else {
                dispatch('createWallet');
            }
        },
        async createWallet({ commit }: { commit: any }) {
            const password = new Password('password');
            const wallet = SimpleWallet.create(WALLET_KEY, password, NetworkType.MIJIN_TEST);
            const encryptedPrivateKey: any = wallet.encryptedPrivateKey;
            const walletInfo = {
                address: wallet.address.plain(),
                privateKey: encryptedPrivateKey.decrypt(password),
            };
            localForage.setItem(WALLET_KEY, walletInfo);
            commit('setWallet', walletInfo);
        },
        async getBalance({ commit }: { commit: any }, address: string) {
            const accountHttp = new AccountHttp(API_URL);
            const mosaicHttp = new MosaicHttp(API_URL);
            const namespaceHttp = new NamespaceHttp(API_URL);
            const mosaicService = new MosaicService(accountHttp, mosaicHttp, namespaceHttp);
            mosaicService.mosaicsAmountViewFromAddress(Address.createFromRawAddress(address)).pipe(
                mergeMap((_) => _),
                filter((mo) => mo.fullName() === 'nem:xem'),
            ).subscribe((data) => {
                commit('setBalance', data.amount.lower / 10 ** 6);
            });
        },
        sendXem({ commit }: { commit: any }, payload: any) {
            const transferTransaction = TransferTransaction.create(
                Deadline.create(),
                Address.createFromRawAddress(payload.toAddress),
                [XEM.createRelative(parseFloat(payload.toAmount))],
                PlainMessage.create(payload.toMessage),
                NetworkType.MIJIN_TEST,
            );
            const account = Account.createFromPrivateKey(payload.privateKey, NetworkType.MIJIN_TEST);
            const signedTransaction = account.sign(transferTransaction);
            const transactionHttp = new TransactionHttp(API_URL);
            transactionHttp.announce(signedTransaction).subscribe(
                (res) => {
                    commit('setMessage', res.message);
                },
                (err) => {
                    commit('setError', err.toString());
                },
            );
        },
    },
};
