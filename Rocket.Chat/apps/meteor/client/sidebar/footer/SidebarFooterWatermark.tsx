import { Box } from '@rocket.chat/fuselage';

/**
 * D-Origin white-label watermark (replaces Rocket.Chat "Powered by" / plan badge).
 */
export const SidebarFooterWatermark = () => {
	return (
		<Box pi={16} pbe={8}>
			<Box fontScale='micro' color='hint' pbe={4}>
				powered by beathah
			</Box>
		</Box>
	);
};
