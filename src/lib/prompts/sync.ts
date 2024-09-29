export const promptSync = () => {
	const newServerIp = prompt(
		'Enter server adress:',
		new URL(window.location.href).searchParams.get('serverAddress') ||
			window.location.hostname
	);
	if (!newServerIp) return;
	const newServerCode = prompt(
		'Enter sync code:',
		new URL(window.location.href).searchParams.get('code') || undefined
	);
	if (!newServerCode) return;
	const newSearch = `?serverAddress=${encodeURIComponent(newServerIp)}&code=${encodeURIComponent(newServerCode)}`;
	if (newSearch === location.search) {
		location.reload();
	} else {
		location.search = newSearch;
	}
};
