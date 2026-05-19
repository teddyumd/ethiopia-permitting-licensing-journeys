import type { PlcNode } from '$lib/types';

export const RESPONSIBLE_LEVELS = [
	{ id: 'federal-national', label: 'Federal / National' },
	{ id: 'addis-ababa-city', label: 'Addis Ababa City Administration' },
	{ id: 'sub-city-woreda', label: 'Sub-city / Woreda Office' },
	{ id: 'sector-regulator', label: 'Sector Regulator' },
	{ id: 'private-non-government', label: 'Private / Non-government Actor' },
	{ id: 'applicant-internal', label: 'Applicant / Internal Action' },
	{ id: 'to-be-verified', label: 'To Be Verified' }
] as const;

export type ResponsibleLevelId = (typeof RESPONSIBLE_LEVELS)[number]['id'];

export function getResponsibleLevel(node: PlcNode): ResponsibleLevelId {
	const agency = (node.agency ?? '').toLowerCase();

	if (agency.includes('to be verified') || agency.includes('tbd')) {
		return 'to-be-verified';
	}

	if (
		agency.includes('applicant') ||
		agency.includes('founder') ||
		agency.includes('owner') ||
		agency.includes('internal action') ||
		agency.includes('seller') ||
		agency.includes('buyer') ||
		agency.includes('heir')
	) {
		return 'applicant-internal';
	}

	if (
		agency.includes('national id') ||
		agency.includes('fayda') ||
		agency.includes('ministry') ||
		agency.includes('motri') ||
		agency.includes('immigration') ||
		agency.includes('federal police') ||
		agency.includes('efda') ||
		agency.includes('ethiopian construction authority') ||
		agency.includes('ethiopian food and drug authority') ||
		agency.includes('document authentication') ||
		agency.includes('dars') ||
		agency.includes('social security')
	) {
		return 'federal-national';
	}

	if (
		agency.includes('addis ababa city') ||
		agency.includes('addis ababa revenue') ||
		agency.includes('addis ababa trade') ||
		agency.includes('addis ababa health') ||
		agency.includes('addis ababa tourism') ||
		agency.includes('addis ababa food')
	) {
		return 'addis-ababa-city';
	}

	if (
		agency.includes('sub-city') ||
		agency.includes('woreda') ||
		agency.includes('local tax office') ||
		agency.includes('local municipality')
	) {
		return 'sub-city-woreda';
	}

	if (
		agency.includes('bank') ||
		agency.includes('insurance') ||
		agency.includes('utility') ||
		agency.includes('vendor') ||
		agency.includes('provider') ||
		agency.includes('broker') ||
		agency.includes('driving school')
	) {
		return 'private-non-government';
	}

	if (
		agency.includes('coc') ||
		agency.includes('regulator') ||
		agency.includes('authority') ||
		agency.includes('licensing')
	) {
		return 'sector-regulator';
	}

	if (node.jurisdiction === 'federal') return 'federal-national';
	if (node.jurisdiction === 'state') return 'sector-regulator';
	return 'sub-city-woreda';
}

export function getResponsibleLevelLabel(node: PlcNode) {
	const level = getResponsibleLevel(node);
	return RESPONSIBLE_LEVELS.find((item) => item.id === level)?.label ?? 'To Be Verified';
}
