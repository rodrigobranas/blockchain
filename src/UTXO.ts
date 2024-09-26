import crypto from "crypto";

export default class UTXO {
	id: string;
	blockHash?: string;

	constructor (readonly owner: string, readonly amount: number) {
		this.id = crypto.randomUUID();
	}

	setBlockHash (blockHash: string) {
		this.blockHash = blockHash;
	}
}
