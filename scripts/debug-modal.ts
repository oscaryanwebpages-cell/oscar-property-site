import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // 监听控制台消息
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text());
    }
  });

  // 监听请求失败
  page.on('requestfailed', request => {
    console.log('❌ Request Failed:', request.url(), request.failure().errorText);
  });

  console.log('🌐 Opening page...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // 等待listing卡片加载
  await page.waitForSelector('[class*="group"]', { timeout: 5000 });
  console.log('✅ Page loaded');

  // 截图首页
  await page.screenshot({ path: 'debug-homepage.png', fullPage: true });
  console.log('📸 Homepage screenshot saved to debug-homepage.png');

  // 点击第一个listing卡片
  console.log('🖱️ Clicking first listing card...');
  const firstCard = await page.locator('[class*="group"]').first();
  await firstCard.click();

  // 等待modal出现
  await page.waitForTimeout(1000);

  // 检查modal是否存在
  const modalExists = await page.locator('[class*="fixed inset-0"]').count() > 0;
  console.log('Modal exists in DOM:', modalExists);

  // 检查modal是否可见
  const modalVisible = await page.locator('[class*="fixed inset-0"]').isVisible();
  console.log('Modal is visible:', modalVisible);

  // 截图modal状态
  await page.screenshot({ path: 'debug-modal.png', fullPage: true });
  console.log('📸 Modal screenshot saved to debug-modal.png');

  // 获取页面HTML（modal部分）
  const modalHTML = await page.locator('body').innerHTML();
  console.log('Page contains listing-detail:', modalHTML.includes('listing-detail'));

  // 检查Google Maps加载状态
  const googleMapsLoaded = await page.evaluate(() => {
    return typeof window.google !== 'undefined';
  });
  console.log('Google Maps loaded:', googleMapsLoaded);

  // 保持浏览器打开以便检查
  console.log('\n✨ Browser will stay open for 30 seconds. Check the modal manually.');
  console.log('Press Ctrl+C to close early.');

  await page.waitForTimeout(30000);
  await browser.close();
})();
