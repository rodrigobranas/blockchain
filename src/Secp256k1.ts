import { ec as EC } from "elliptic";
const ec = new EC("secp256k1");

export default class Secp256k1 {

	generateKeys (seed: string) {
		const key = ec.genKeyPair({
			entropy: seed
		});
	}
}
