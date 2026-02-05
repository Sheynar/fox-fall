import type { useIntelInstance } from '@/lib/intel-instance';
import type { IntelDocument } from '@packages/data/dist/intel';

export async function updatePartialDocument(
	intelInstance: ReturnType<typeof useIntelInstance>,
	documentId: number,
	updateData: Partial<IntelDocument>
) {
	const response = await intelInstance.authenticatedFetch(
		`/api/v1/instance/${encodeURIComponent(intelInstance.instanceId.value)}/document/id/${encodeURIComponent(documentId)}`,
		{
			method: 'POST',
			body: JSON.stringify(updateData),
		}
	);
	if (!response.ok) {
		throw new Error('Failed to update document. ' + (await response.text()));
	}
}
