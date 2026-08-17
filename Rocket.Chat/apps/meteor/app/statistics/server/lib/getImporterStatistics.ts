import { settings } from '../../../settings/server';

export function getImporterStatistics(): Record<string, unknown> {
	return {
		totalCSVImportedUsers: settings.get('CSV_Importer_Count'),
		totalHipchatEnterpriseImportedUsers: settings.get('Hipchat_Enterprise_Importer_Count'),
	};
}
