import type { useIntelInstance } from '@/lib/intel-instance';
import type { IntelIcon } from '@packages/data/dist/intel';

export async function updatePartialIcon(
	intelInstance: ReturnType<typeof useIntelInstance>,
	iconId: number,
	updateData: Partial<IntelIcon>
) {
	const response = await intelInstance.authenticatedFetch(
		`/api/v1/instance/${encodeURIComponent(intelInstance.instanceId.value)}/icon/id/${encodeURIComponent(iconId)}`,
		{
			method: 'POST',
			body: JSON.stringify(updateData),
		}
	);
	if (!response.ok) {
		throw new Error('Failed to update icon. ' + (await response.text()));
	}
}
