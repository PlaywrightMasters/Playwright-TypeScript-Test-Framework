import { testConfig } from '../../testConfig';
import test from '@lib/BaseTest';
import { expect } from '@playwright/test';

test(`Generate and verify HAR file for Login Page.`, async ({ page, loginPage, webActions }) => {
    test.skip(!testConfig.username || !testConfig.password, "Set TEST_USERNAME and TEST_PASSWORD for login examples.");
    // To record HAR file use below line where "update:true"
    // This line creates a directory named har and stores all the har related files in it.
    await page.routeFromHAR(test.info().outputPath('loginPage.har'), { update: true });

    // Once you record the har file you can uncomment the below line for Network Replay with update:false
    //The below line uses the har file from the recoded directory.
    // await page.routeFromHAR('har/loginPage.har',{update:false});
    await loginPage.navigateToURL();
    await webActions.clickByText('Book Store Application');
    await loginPage.clickOnLoginMainButton();
    await loginPage.loginToApplication();
    await expect(loginPage.BOOKS_SEARCH_BOX).toBeVisible();
});
