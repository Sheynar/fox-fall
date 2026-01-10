export async function requestFile(accept: string) {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = accept;
	const blob = await new Promise<Blob>((resolve, reject) => {
		input.onchange = (event) => {
			const file = (event.target! as HTMLInputElement).files![0];
			resolve(file);
		};
		input.onclose = () => {
			reject(new Error('User closed the file picker'));
		};
		input.click();
	});
	return blob;
}
