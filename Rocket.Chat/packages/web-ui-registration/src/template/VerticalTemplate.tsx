import { Box } from '@rocket.chat/fuselage';
import { VerticalWizardLayout, VerticalWizardLayoutTitle, VerticalWizardLayoutFooter } from '@rocket.chat/layout';
import { useSetting, useAssetWithDarkModePath } from '@rocket.chat/ui-contexts';
import type { ReactNode } from 'react';

import LoginPoweredBy from '../components/LoginPoweredBy';
import LoginSwitchLanguageFooter from '../components/LoginSwitchLanguageFooter';
import LoginTerms from '../components/LoginTerms';
import { RegisterTitle } from '../components/RegisterTitle';

const VerticalTemplate = ({ children }: { children: ReactNode }) => {
	const hideLogo = useSetting('Layout_Login_Hide_Logo', false);
	const customLogo = useAssetWithDarkModePath('logo');
	const customBackground = useAssetWithDarkModePath('background');

	const logo =
		hideLogo ? (
			<></>
		) : customLogo ? (
			<Box is='img' maxHeight='x40' mi='neg-x8' src={customLogo} alt='D-Origin' />
		) : (
			<Box fontScale='h4' color='font-default' mi='neg-x8'>
				D-Origin
			</Box>
		);

	return (
		<VerticalWizardLayout background={customBackground} logo={logo}>
			<VerticalWizardLayoutTitle>
				<RegisterTitle />
			</VerticalWizardLayoutTitle>
			<LoginPoweredBy />
			{children}
			<VerticalWizardLayoutFooter>
				<LoginTerms />
				<LoginSwitchLanguageFooter />
			</VerticalWizardLayoutFooter>
		</VerticalWizardLayout>
	);
};

export default VerticalTemplate;
