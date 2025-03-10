// File: src/controllers/agoraController.js
import pkg from 'agora-token';
import dotenv from 'dotenv';

dotenv.config();

const { RtcTokenBuilder, RtcRole } = pkg;

export const generateAgoraToken = (req, res) => {
  const { channelName, uid } = req.query;

  if (!channelName || !uid) {
    return res.status(400).json({ success: false, message: 'Channel name and UID are required' });
  }

  const appID = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, RtcRole.PUBLISHER, privilegeExpiredTs);

  res.json({ success: true, token });
};