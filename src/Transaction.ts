import crypto from "crypto";
import { ec as EC } from "elliptic";
const ec = new EC("secp256k1");

export default class Transaction {
	signature?: string;

	constructor (readonly fromAddress: string | null, readonly toAddress: string, readonly amount: number) {
	}

	calculateHash () {
		return crypto.createHash("sha256").update(this.fromAddress + this.toAddress + this.amount).digest("hex");
	}

	sign (signature: string) {
		const hashTx = this.calculateHash();
		this.signature = signature;
	}

	isValid () {
		if (this.fromAddress === null) return true;
		if (!this.signature || this.signature.length === 0) return false;
		const publicKey = ec.keyFromPublic(this.fromAddress, "hex");
		return publicKey.verify(this.calculateHash(), this.signature);
	}
}