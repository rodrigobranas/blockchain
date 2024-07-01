import Transaction from "./Transaction";
import * as bip39 from "bip39";
import { ec as EC } from "elliptic";
const ec = new EC("secp256k1");

export default class Wallet {

	constructor (readonly key: EC.KeyPair, readonly seed: string, readonly privateKey: string, readonly publicKey: string) {
	}

	static setup () {
		const seed = bip39.generateMnemonic();
		const key = ec.genKeyPair({
			entropy: seed
		});
		const privateKey = key.getPrivate("hex");
		const publicKey = key.getPublic("hex");
		return new Wallet(key, seed, privateKey, publicKey);
	}

	static restore (seed: string) {
		const key = ec.genKeyPair({
			entropy: seed
		});
		const privateKey = key.getPrivate("hex");
		const publicKey = key.getPublic("hex");
		return new Wallet(key, seed, privateKey, publicKey);
	}

	sign (transaction: Transaction) {
		const hashTx = transaction.calculateHash();
		const signature = (this.key.sign(hashTx, "base64")).toDER("hex");
		transaction.sign(signature);
	}
}
