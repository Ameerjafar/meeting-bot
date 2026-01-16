import { chromium, selectors } from "playwright";
import { GoogleMeetSelectors } from "./selectors.ts";
import * as fs from 'fs';
import { summarization } from "../summarization/summarization.ts";
import { payloadTooLargeResponseErrorDataFromJSON } from "@openrouter/sdk/models";
const meetingLink = "https://meet.google.com/aoy-hgwg-mqn"
const screenWidth = 1920;  
const screenHeight = 1080;
const allText: string[] = [];
export const playwrightBot = async (meetingLink: string) => {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    args: ["--disable-blink-features=AutomationControlled", `--window-size=${screenWidth},${screenHeight}`],
  });
  try {
    const meetingTime =  160 * 1000;
    const waitingTime = 90 * 1000;
    const context = await browser.newContext({

    });
    const page = await context.newPage();
    page.on('dialog', async dialog => {
      await dialog.dismiss();
    })
    await page.goto(meetingLink);
    await page.locator(GoogleMeetSelectors.withoutMicAndCamera).click();
    await page.locator(GoogleMeetSelectors.nameInput).fill("Note taking bot");
    await page.locator(GoogleMeetSelectors.askToJoinButton).click();
    await page.locator(GoogleMeetSelectors.captionButton).waitFor({state: "visible", timeout: waitingTime});
    const layouts = [GoogleMeetSelectors.seeTotalLayoutOne, GoogleMeetSelectors.seeTotalLayoutTwo];
    for(const layout of layouts) {
      let count = 0;
      if(await page.locator(layout).count() > 0) {
        console.log("layout", count)
        await page.locator(layout).click();
        break;
      }
      count++;
    }
    await page.locator(GoogleMeetSelectors.captionButton).click();
    const captureCaption = setInterval(async () => {

        const captionText: string = await page.locator(GoogleMeetSelectors.captions).innerText();
        if(allText.length === 0) {
            allText.push(captionText)
        }
        else if(captionText.length > 0 && allText[allText.length - 1] !== captionText) {
            allText.push(captionText);
        }
        const totalParticipant = await page.locator(GoogleMeetSelectors.totalParticiPants).innerText();
        console.log("total participant", totalParticipant)
        if(parseInt(totalParticipant) === 1) {
          meetingEnd(captureCaption)
          await context.close()
          await browser.close();
        }
        console.log(captionText)
    }, 1500)
    setTimeout(async () => {
      meetingEnd(captureCaption)
      await context.close()
      await browser.close();
    }, meetingTime)
  } catch (error: unknown) {
    console.log(error)
  }
};
export const meetingEnd = async (captureCaption: any) => {
  console.log("it is closing"); 
  const fileContent = allText.join('\n');
  const outputPath = 'D:/super30/meeting-bot/output.txt';
  fs.writeFileSync(outputPath, fileContent, 'utf-8')
  summarization(allText.toString())
  console.log("this is the summarization", summarization)
  console.log('stored successfully');
  clearInterval(captureCaption)
}
playwrightBot(meetingLink);
