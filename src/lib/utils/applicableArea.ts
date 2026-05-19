import type { PlcNode } from '$lib/types';

export const APPLICABLE_AREAS = [
	{ id: 'national-federal', label: 'National / Federal' },
	{ id: 'addis-ababa', label: 'Addis Ababa' },
	{ id: 'dire-dawa', label: 'Dire Dawa' },
	{ id: 'afar', label: 'Afar' },
	{ id: 'amhara', label: 'Amhara' },
	{ id: 'benishangul-gumuz', label: 'Benishangul-Gumuz' },
	{ id: 'central-ethiopia', label: 'Central Ethiopia' },
	{ id: 'gambela', label: 'Gambela' },
	{ id: 'harari', label: 'Harari' },
	{ id: 'oromia', label: 'Oromia' },
	{ id: 'sidama', label: 'Sidama' },
	{ id: 'somali', label: 'Somali' },
	{ id: 'south-ethiopia', label: 'South Ethiopia' },
	{ id: 'south-west-ethiopia', label: 'South West Ethiopia' },
	{ id: 'tigray', label: 'Tigray' },
	{ id: 'verification-needed', label: 'Area-specific verification needed' }
] as const;

export type ApplicableAreaId = (typeof APPLICABLE_AREAS)[number]['id'];

const areaLabels = new Map<ApplicableAreaId, string>(
	APPLICABLE_AREAS.map((area) => [area.id, area.label])
);

function agencyText(node: PlcNode) {
	return (node.agency ?? '').toLowerCase();
}

export function getStepApplicableArea(node: PlcNode): ApplicableAreaId {
	const agency = agencyText(node);

	if (
		agency.includes('addis ababa') ||
		agency.includes('aafda') ||
		agency.includes('aawsa')
	) {
		return 'addis-ababa';
	}

	if (agency.includes('dire dawa')) return 'dire-dawa';
	if (agency.includes('afar')) return 'afar';
	if (agency.includes('amhara')) return 'amhara';
	if (agency.includes('benishangul')) return 'benishangul-gumuz';
	if (agency.includes('central ethiopia')) return 'central-ethiopia';
	if (agency.includes('gambela')) return 'gambela';
	if (agency.includes('harari')) return 'harari';
	if (agency.includes('oromia')) return 'oromia';
	if (agency.includes('sidama')) return 'sidama';
	if (agency.includes('somali')) return 'somali';
	if (agency.includes('south west')) return 'south-west-ethiopia';
	if (agency.includes('south ethiopia')) return 'south-ethiopia';
	if (agency.includes('tigray')) return 'tigray';

	if (
		agency.includes('national id') ||
		agency.includes('fayda') ||
		agency.includes('immigration') ||
		agency.includes('federal police') ||
		agency.includes('motri') ||
		agency.includes('ministry of trade') ||
		agency.includes('ministry of revenues') ||
		agency.includes('ministry of health') ||
		agency.includes('ministry') ||
		agency.includes('efda') ||
		agency.includes('ethiopian food and drug authority') ||
		agency.includes('ethiopian construction authority') ||
		agency.includes('eca') ||
		agency.includes('dars') ||
		agency.includes('document authentication')
	) {
		return 'national-federal';
	}

	return 'verification-needed';
}

export function getApplicableAreaLabel(area: ApplicableAreaId) {
	return areaLabels.get(area) ?? 'Area-specific verification needed';
}

export function getStepApplicableAreaLabel(node: PlcNode) {
	return getApplicableAreaLabel(getStepApplicableArea(node));
}

export function getJourneyApplicableArea(nodes: PlcNode[]): ApplicableAreaId {
	const areas = new Set(nodes.map(getStepApplicableArea));

	if (areas.has('addis-ababa')) return 'addis-ababa';

	const regionalAreas = [...areas].filter((area) =>
		area !== 'national-federal' && area !== 'verification-needed'
	);
	if (regionalAreas.length === 1) return regionalAreas[0];
	if (regionalAreas.length > 1) return 'verification-needed';

	if (areas.has('national-federal') && areas.size === 1) return 'national-federal';
	if (areas.has('national-federal') && areas.has('verification-needed')) return 'national-federal';

	return 'verification-needed';
}

export function getJourneyApplicableAreaLabel(nodes: PlcNode[]) {
	return getApplicableAreaLabel(getJourneyApplicableArea(nodes));
}
