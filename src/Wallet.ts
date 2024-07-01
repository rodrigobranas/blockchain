import { ec as EC } from "elliptic";
import Transaction from "./Transaction";
const ec = new EC("secp256k1");

export default class Wallet {

	constructor (readonly key: EC.KeyPair, private privateKey: string, readonly publicKey: string) {
	}

	static setup () {
		const key = ec.genKeyPair();
		const privateKey = key.getPrivate("hex");
		const publicKey = key.getPublic("hex");
		return new Wallet(key, privateKey, publicKey);
	}

	sign (transaction: Transaction) {
		const hashTx = transaction.calculateHash();
		const signature = (this.key.sign(hashTx, "base64")).toDER("hex");
		transaction.sign(signature);
	}
}
