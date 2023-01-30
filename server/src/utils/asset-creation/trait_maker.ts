import express, { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { log, logError, logWarning } from "../testing/color_console";
const projectFolder = "../../../shared-data"
const traitPath = path.join(__dirname, projectFolder, "traits.json");
fs.access(traitPath, (err: any) => {
  if (err) {
    logWarning('File does not exist')
    return false;
  } else {
    console.log('File exists')
    return true;
  }
})
let traits: [];
fs.readFile(traitPath, (err, data) => {
  if (err) {
    logError(`Failed parsing of ${traitPath}`)
    console.log(err);
    throw err;
  }
  traits = JSON.parse(data.toString());
  console.log(traits)
})
const traitMaker: Router = express.Router()
traitMaker.get("/:name", (req: Request, res: Response) => {
  //console.log("request")
  const name = req.params.name;
  if (name === "all") {
    res.status(200).json({ traits: traits });
  }
})

traitMaker.post("/:name", (req: Request, res: Response) => {
  const name = req.params.name;
  //check if trait name already exists
})

export default traitMaker;