import PinataSDK from "@pinata/sdk";
import fs from "fs";

const PINATA_JWT = process.env.PINATA_JWT;
const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
});


async function createPublicGroup(name) {
  const group = await pinata.groups.create({
    name,
    isPublic: true,
  });
  console.log("Public group created:", group);
  return group.id;
}

async function uploadFileToPublicGroup(filePath, groupId) {
  const fileStream = fs.createReadStream(filePath);

  const upload = await pinata.upload.file(fileStream, {
    group: groupId,
  });

  console.log("Uploaded file:", upload);
  return upload.cid; //public cid it is
}


function getPublicFileUrl(cid) {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

async function listPublicGroupFiles(groupId) {
  const files = await pinata.groups.files(groupId);
  console.log("Files in group:", files);
  return files;
}


/*
    Function calls for accesinf these funcn
  Create public group
  const groupId = await createPublicGroup("AgentVCsPublic");

  Upload file
  const cid = await uploadFileToPublicGroup("./vc.json", groupId);

  Get file via IPFS gateway
  const fileUrl = getPublicFileUrl(cid);
  console.log("Public file available at:", fileUrl);

  List all files in group
  const files = await listPublicGroupFiles(groupId);
  console.log("All files in public group:", files);
  
*/