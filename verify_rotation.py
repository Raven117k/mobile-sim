
import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        path = os.path.abspath('simulator.html')
        await page.goto(f'file://{path}')
        await page.click('#rotateRight')
        await asyncio.sleep(1)
        await page.screenshot(path='verification.png')
        await browser.close()

asyncio.run(main())
