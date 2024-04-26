import { Peer } from 'peerjs';

export const _getPeer = async () => {
	const peer = new Peer();
	await new Promise<string>((resolve, reject) => {
		peer.once('open', (id) => resolve(id));
		peer.once('error', reject);
	});
	return peer;
};

export const getPeer = async () => {
	while (true) {
		try {
			return await _getPeer();
		} catch (e) {
			console.error('Failed to get peer:', e);
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}
};
