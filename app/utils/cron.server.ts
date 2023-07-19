import cron from 'node-cron'
import { updateSources } from '~/utils/sources.server.ts'

export function init() {
	cron.schedule(
		'0 5 * * *',
		async () => {
			console.log(`${new Date().toISOString()}: Scheduled update sources cron`)
			await updateSources()
		},
		{
			name: 'update-sources',
			timezone: 'Europe/Bucharest',
		},
	)
}
