import express, { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { log, logError, logWarning } from "../testing/color_console";
import traitMaker from "./trait_maker";
const assetMaker: Router = express.Router({ mergeParams: true })
const assetMakerPath = path.join(__dirname, "../../../../asset-maker/build");
assetMaker.use(express.static(assetMakerPath))
assetMaker.use("/traits", traitMaker);
assetMaker.get("/", (req: Request, res: Response) => {
  //TODO check this is a verified asset creator
  res.sendFile(path.join(assetMakerPath, "/index.html"));
})


export default assetMaker