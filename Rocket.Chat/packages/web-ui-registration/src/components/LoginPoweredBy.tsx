import { Box } from '@rocket.chat/fuselage';

/**
 * D-Origin white-label login footer (replaces "Powered by Rocket.Chat").
 */
export const LoginPoweredBy = () => {
	return (
		<Box mbe={18} fontScale='c1' color='font-secondary-info'>
			D-Origin powered by beathah
		</Box>
	);
};

export default LoginPoweredBy;
