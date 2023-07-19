import cron from 'node-cron'
import { updateSources } from '~/utils/sources.server.ts'

export function init() {
	cron.schedule(
		'0 22 * * *',
		async () => {
			console.log(`${new Date().toISOString()}: Scheduled update sources cron`)
			await updateSources()
		},
		{
			name: 'update-sources',
			runOnInit: true,
			timezone: 'Europe/Bucharest',
		},
	)
}
