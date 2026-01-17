import { chromium } from "playwright";
import { GoogleMeetSelectors } from "./selectors.ts";
import * as fs from "fs";
import { summarization } from "../summarization/summarization.ts";
interface MeetingDetailObject {
  text: string[];
  startTime: Date;
  endTime: Date;
  meetingDuration: number;
}
const meetingLink = "https://meet.google.com/aoy-hgwg-mqn";
const screenWidth = 1920;
const screenHeight = 1080;
const meetingDetail: MeetingDetailObject = {
  text: [],
  startTime: new Date(),
  endTime: new Date(),
  meetingDuration: 60,
};
const startTime = Date.now();
export const playwrightBot = async (meetingLink: string) => {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    args: [
      "--disable-blink-features=AutomationControlled",
      `--window-size=${screenWidth},${screenHeight}`,
    ],
  });
  try {
    const meetingTime = 60 * 60 * 1000;
    const waitingTime = 10 * 10 * 1000;
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on('dialog', async dialog => {
      console.log("dialog", dialog);
      await dialog.dismiss();
    })
    await page.goto(meetingLink);
    await page.locator(GoogleMeetSelectors.withoutMicAndCamera).click();
    await page.locator(GoogleMeetSelectors.nameInput).fill("Note taking bot");
    await page.locator(GoogleMeetSelectors.askToJoinButton).click();
    await page
      .locator(GoogleMeetSelectors.captionButton)
      .waitFor({ state: "visible", timeout: waitingTime });
    await page.locator(GoogleMeetSelectors.captionButton).click();
    const captureCaption = setInterval(async () => {
      const captionText: string = await page
        .locator(GoogleMeetSelectors.captions)
        .innerText();
      console.log("this is the meetingDetails", meetingDetail);
      if (meetingDetail.text.length === 0) {
        meetingDetail.text.push(captionText);
      } else if (
        captionText.length > 0 &&
        meetingDetail.text[meetingDetail.text.length - 1] !== captionText
      ) {
        meetingDetail.text.push(captionText);
      }
      const layouts = [
        GoogleMeetSelectors.TopLayout,
        GoogleMeetSelectors.bottomLayout,
      ];
      let count = 0;
      let totalParticipant;
      for (const layout of layouts) {
        if ((await page.locator(layout).count()) > 0) {
          console.log("inside is calling bro")
          totalParticipant = await page.locator(layout).innerText();
          console.log("inside the for loop", totalParticipant);
          break;
        }
        count++;
      }
      console.log("total participant", totalParticipant);
      if (parseInt(totalParticipant!) === 1 || parseInt(totalParticipant!) === undefined) {
        meetingEnd(captureCaption, meetingInterval);
        await context.close();
        await browser.close();
      }
      console.log(captionText);
    }, 1500);
    const meetingInterval = setTimeout(async () => {
      meetingEnd(captureCaption, meetingInterval);
      await context.close();
      await browser.close();
    }, meetingTime);
  } catch (error: unknown) {
    console.log(error);
  }
};
export const meetingEnd = async (captureCaption: any, meetingInterval: any) => {
  clearInterval(captureCaption);
  clearTimeout(meetingInterval)
  const endTime = Date.now();
  const totalTime = Math.floor((endTime - startTime) / (1000 * 60));
  meetingDetail.meetingDuration = totalTime;
  meetingDetail.endTime = new Date();
  
  console.log("total time take", totalTime, "minutes");
  console.log("it is closing");
  
  const outputPath = "D:/super30/meeting-bot/output.txt";
  fs.writeFileSync(outputPath, JSON.stringify(meetingDetail, null, 2), "utf-8");
  try {
    const summary = await summarization(JSON.stringify(meetingDetail));
    console.log("MEETING SUMMARY:");
    console.log(summary);
  } catch (error: any) {
    console.log("Summarization failed:", error.message);
    console.log(" Raw transcript saved to file anyway");
  }
  
  console.log("stored successfully");
};

playwrightBot(meetingLink);
