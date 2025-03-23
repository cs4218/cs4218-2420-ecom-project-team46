import { test, expect } from '@playwright/test';

test.use({ storageState: "playwright-storage/user.json" });

test('Cart Page test', async ({ page }) => {
  await page.goto('/');
  await page.locator('.card-name-price > button:nth-child(2)').first().click();
  await page.getByRole('link', { name: 'Cart' }).click();

  // expect visibility of components
  await expect(page.getByText('Textbook', { exact: true })).toBeVisible();
  await expect(page.getByText('A comprehensive textbook')).toBeVisible();
  await expect(page.getByText('Price : 79.99')).toBeVisible();

  await expect(page.getByRole('heading', { name: 'Total : $79.99' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Computing Drive' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Paying with Card' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Paying with PayPal' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Make Payment' })).toBeVisible();

  // pay
  await page.getByRole('button', { name: 'Paying with Card' }).click();
  await page.locator('iframe[name="braintree-hosted-field-number"]').contentFrame().getByRole('textbox', { name: 'Credit Card Number' }).fill('4111111111111111');
  await page.locator('iframe[name="braintree-hosted-field-expirationDate"]').contentFrame().getByRole('textbox', { name: 'Expiration Date' }).click();
  await page.locator('iframe[name="braintree-hosted-field-expirationDate"]').contentFrame().getByRole('textbox', { name: 'Expiration Date' }).fill('0430');
  await page.getByRole('button', { name: 'Make Payment' }).click();

  // expect orders to be visible
  await expect(page.getByRole('heading', { name: 'All Orders' })).toBeVisible();
  await expect(page.getByText('Textbook')).toBeVisible();
  await expect(page.getByText('A comprehensive textbook')).toBeVisible();
  await expect(page.getByText('Price : 79.99')).toBeVisible();
});

test('Can pay with PayPal account', async ({ page }) => {
  await page.goto('/');
  await page.locator('.card-name-price > button:nth-child(2)').first().click();
  await page.getByRole('link', { name: 'Cart' }).click();

  await expect(page.getByRole('button', { name: 'Paying with PayPal' })).toBeVisible();
  await page.getByRole('button', { name: 'Paying with PayPal' }).click();
  await expect(page.locator('iframe[name="xcomponent__ppbutton__min__pmrhk2leei5centdhaygcnlggqyteirmej2gczzchirhaylzobqwyllcov2hi33oeiwcey3pnvyg63tfnz2faylsmvxhiir2pmrhezlgei5ce5dpoarh2lbcojsw4zdfojigc4tfnz2ceot3ejzgkzrchirhi33qej6syitqojxxa4zchj5se5dzobsseorcojqxoirmej3gc3dvmurdu6zcmvxhmir2ejzwc3temjxxqirmejzxi6lmmurdu6zcnrqwezlmei5cey3imvrww33voqrh2lbcmnxw23ljoqrduztbnrzwklbcobqxs3lfnz2ceot3ejpv65dzobsv6xzchirf6x3govxgg5djn5xf6xzcpuwce33oif2xi2dpojuxuzjchj5sex27or4xazk7l4rduis7l5thk3tdoruw63s7l4rh2lbcn5xek4tsn5zceot3ejpv65dzobsv6xzchirf6x3govxgg5djn5xf6xzcpuwceztvnzsgs3thei5hwitbnrwg653fmqrduw25fqrgi2ltmfwgy33xmvsceos3ej3gk3tnn4rcyitjorqxkirmejrwc4teeiwce2lemvqwyirmejswy5rcfqrgeylomnxw45dbmn2celbcm5uxe33qmf4selbconxwm33soqrcyitfobzselbcnv4weylonmrcyitqgi2celbcpjuw24dmmvzcelbcmjwgs2zcfqrg2ylynfwwcirmejrg63dforxselbcn54hq3zcfqrg2zlsmnqwi33qmftw6irmejrxezlenf2cexjmejzgk3lfnvrgk4tfmqrduwzcobqxs4dbnqrf2lbcojsw2zlnmjsxeir2pmrf6x3upfygkx27ei5cex27mz2w4y3unfxw4x27ej6x2lbcmrxw2yljnyrduitmn5rwc3din5zxiortgaydairmejzwk43tnfxw4skeei5ce5ljmrptoylfhbsgcnjwge2f63leoe3g22tfgzxgi3jcfqrge5luorxw4u3fonzws33ojfcceorcovuwix3cheyton3fmy2wezc7nvshcntnnjutm3tuourcyitsmvxgizlsmvsee5luorxw44zchirhaylzobqwyirmejzxi33smftwkskeei5ce5ljmrptmylcguydoyzwgzsv63leoe3g25dzgzwxi5jcfqrg2zlumerdu635fqrgk3tbmjwgkttboruxmzkdnbswg23pov2ceotgmfwhgzjmejrwy2lfnz2ceot3puwce43povzggzjchirg2yloovqwyirmejyhezlgmv2gg2cmn5tws3rchjtgc3dtmuwce5lqmrqxizkdnruwk3tuinxw4ztjm52xeylunfxw4ir2orzhkzjmejqxk5diinxwizjchircelbcn5xfezlomrsxeir2pmrf6x3upfygkx27ei5cex27mz2w4y3unfxw4x27ej6syitpnzbwc3tdmvwceot3ejpv65dzobsv6xzchirf6x3govxgg5djn5xf6xzcpuwce33oinwgsy3lei5hwis7l52hs4dfl5pseorcl5pwm5lomn2gs33ol5pse7jmejxw4utfonuxuzjchj5sex27or4xazk7l4rduis7l5thk3tdoruw63s7l4rh2lbcnrxwgylmmurduitfnzpuoqrcfqrgy33hjrsxmzlmei5ce53bojxcelbcmf3wc2lukbxxa5lqijzgszdhmurdu6zcl5pxi6lqmvpv6ir2ejpv6ztvnzrxi2lpnzpv6it5fqrgozlukbqwozkvojwceot3ejpv65dzobsv6xzchirf6x3govxgg5djn5xf6xzcpuwce5dfon2ceot3ejqwg5djn5xceorcmnugky3ln52xiit5fqrhk2leei5ceobxmvqwgndbgjrtiirmej3gk4ttnfxw4ir2ejwws3rcpv6syitdnbuwyzcen5wwc2loei5ce2duoryhgorpf53xo5zoonqw4zdcn54c44dbpfygc3bomnxw2irmejuwiir2ei2wioddgiydsnzqharcyiten5wwc2loei5ce2duorydulzpnrxwgylmnbxxg5b2gmydambcpu__"]').contentFrame().getByRole('button', { name: 'PayPal Checkout' })).toBeVisible();
});

test('Cart page can redirect to profile page', async ({ page }) => {
  await page.goto('http://localhost:3000/cart');
  await expect(page.getByRole('button', { name: 'Update Address' })).toBeVisible();
  await page.getByRole('button', { name: 'Update Address' }).click();
  await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toBeVisible();
});