// ============================================================
// AYNA BOOK — UHD WEBRTC ENGINE
// File: js/ayna-webrtc.js
//
// High Quality:
// - HD / UHD camera preference
// - High quality Opus audio
// - Echo cancellation
// - Noise suppression
// - Auto gain control
// - Adaptive video bitrate
// - Hardware-friendly codec preference
// - WebRTC statistics
//
// IMPORTANT:
// WebRTC quality depends on device, camera, browser and network.
// This file does NOT guarantee 4K/8K on every phone.
// ============================================================

import { auth, database } from "../firebase-init.js";

import {
  ref,
  set,
  remove,
  onValue,
  onDisconnect
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";


// ============================================================
// CONFIG
// ============================================================

const CONFIG = {

  // Preferred video resolution
  UHD_WIDTH: 3840,
  UHD_HEIGHT: 2160,

  // Fallback resolution
  HD_WIDTH: 1920,
  HD_HEIGHT: 1080,

  // Preferred frame rate
  FPS: 30,

  // Video bitrate range
  MIN_VIDEO_BITRATE: 1000000,
  MAX_VIDEO_BITRATE: 12000000,

  // Audio bitrate
  AUDIO_BITRATE: 128000,

  // Audio sample rate
  AUDIO_SAMPLE_RATE: 48000,

  // STUN servers
  ICE_SERVERS: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302"
      ]
    }
  ]
};


// ============================================================
// STATE
// ============================================================

let localStream = null;
let remoteStream = null;

let peerConnection = null;

let currentCallId = null;
let currentPeerId = null;

let caller = false;

let signalListeners = [];


// ============================================================
// ELEMENTS
// ============================================================

let localVideo = null;
let remoteVideo = null;

let callStatus = null;


// ============================================================
// INITIALIZE UI
// ============================================================

export function initAYNAWebRTC(options = {}) {

  localVideo =
    options.localVideo ||
    document.getElementById("localVideo");

  remoteVideo =
    options.remoteVideo ||
    document.getElementById("remoteVideo");

  callStatus =
    options.callStatus ||
    document.getElementById("callStatus");

  console.log(
    "AYNA BOOK UHD WebRTC initialized."
  );
}


// ============================================================
// STATUS
// ============================================================

function status(message) {

  if (callStatus) {
    callStatus.textContent = message;
  }

  console.log(
    "[AYNA WebRTC]",
    message
  );
}


// ============================================================
// CHECK WEBRTC
// ============================================================

export function isWebRTCSupported() {

  return !!(
    window.RTCPeerConnection &&
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  );
}


// ============================================================
// GET MEDIA
// ============================================================

export async function getUHDMedia({
  video = true,
  audio = true
} = {}) {

  if (!isWebRTCSupported()) {

    throw new Error(
      "এই browser WebRTC support করে না।"
    );
  }

  status(
    "🎥 Camera এবং microphone প্রস্তুত হচ্ছে..."
  );

  const videoConstraints = {

    width: {
      ideal: CONFIG.UHD_WIDTH,
      min: 1280
    },

    height: {
      ideal: CONFIG.UHD_HEIGHT,
      min: 720
    },

    frameRate: {
      ideal: CONFIG.FPS,
      max: 60
    },

    facingMode: "user"
  };

  const audioConstraints = {

    sampleRate: {
      ideal: CONFIG.AUDIO_SAMPLE_RATE
    },

    channelCount: {
      ideal: 2
    },

    sampleSize: {
      ideal: 16
    },

    echoCancellation: true,

    noiseSuppression: true,

    autoGainControl: true
  };

  try {

    localStream =
      await navigator.mediaDevices.getUserMedia({

        video:
          video
            ? videoConstraints
            : false,

        audio:
          audio
            ? audioConstraints
            : false
      });

  } catch (firstError) {

    console.warn(
      "UHD camera unavailable. Trying HD fallback.",
      firstError
    );

    try {

      localStream =
        await navigator.mediaDevices.getUserMedia({

          video:
            video
              ? {
                  width: {
                    ideal: CONFIG.HD_WIDTH
                  },

                  height: {
                    ideal: CONFIG.HD_HEIGHT
                  },

                  frameRate: {
                    ideal: 30,
                    max: 60
                  },

                  facingMode: "user"
                }
              : false,

          audio:
            audio
              ? audioConstraints
              : false
        });

    } catch (secondError) {

      console.error(
        "Camera/microphone error:",
        secondError
      );

      throw secondError;
    }
  }

  if (localVideo && localStream) {

    localVideo.srcObject =
      localStream;

    localVideo.autoplay = true;
    localVideo.playsInline = true;
    localVideo.muted = true;

    try {
      await localVideo.play();
    } catch (error) {
      console.warn(
        "Local video autoplay blocked.",
        error
      );
    }
  }

  // Apply track settings
  optimizeLocalTracks();

  status(
    "🟢 Camera ও microphone চালু"
  );

  return localStream;
}


// ============================================================
// OPTIMIZE LOCAL TRACKS
// ============================================================

function optimizeLocalTracks() {

  if (!localStream) {
    return;
  }

  const videoTracks =
    localStream.getVideoTracks();

  for (const track of videoTracks) {

    try {

      const capabilities =
        track.getCapabilities?.();

      const constraints = {};

      if (
        capabilities?.width?.max
      ) {

        constraints.width = {
          ideal: Math.min(
            CONFIG.UHD_WIDTH,
            capabilities.width.max
          )
        };
      }

      if (
        capabilities?.height?.max
      ) {

        constraints.height = {
          ideal: Math.min(
            CONFIG.UHD_HEIGHT,
            capabilities.height.max
          )
        };
      }

      if (
        capabilities?.frameRate?.max
      ) {

        constraints.frameRate = {
          ideal: Math.min(
            CONFIG.FPS,
            capabilities.frameRate.max
          )
        };
      }

      if (
        Object.keys(constraints).length
      ) {

        track.applyConstraints(
          constraints
        ).catch(() => {});
      }

    } catch (error) {

      console.warn(
        "Video optimization skipped.",
        error
      );
    }
  }


  const audioTracks =
    localStream.getAudioTracks();

  for (const track of audioTracks) {

    try {

      track.applyConstraints({

        echoCancellation: true,

        noiseSuppression: true,

        autoGainControl: true

      }).catch(() => {});

    } catch (error) {

      console.warn(
        "Audio optimization skipped.",
        error
      );
    }
  }
}


// ============================================================
// CREATE PEER CONNECTION
// ============================================================

function createPeerConnection() {

  peerConnection =
    new RTCPeerConnection({

      iceServers:
        CONFIG.ICE_SERVERS,

      bundlePolicy:
        "max-bundle",

      rtcpMuxPolicy:
        "require"
    });


  // ----------------------------------------------------------
  // Add local tracks
  // ----------------------------------------------------------

  if (localStream) {

    for (
      const track of localStream.getTracks()
    ) {

      peerConnection.addTrack(
        track,
        localStream
      );
    }
  }


  // ----------------------------------------------------------
  // Remote stream
  // ----------------------------------------------------------

  remoteStream =
    new MediaStream();

  if (remoteVideo) {

    remoteVideo.srcObject =
      remoteStream;

    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
  }


  peerConnection.addEventListener(
    "track",
    event => {

      for (
        const track of event.streams[0]?.getTracks() || []
      ) {

        remoteStream.addTrack(
          track
        );
      }

      if (remoteVideo) {

        remoteVideo.srcObject =
          remoteStream;

        remoteVideo.play()
          .catch(() => {});
      }

      status(
        "🟢 Remote audio/video connected"
      );
    }
  );


  // ----------------------------------------------------------
  // ICE candidate
  // ----------------------------------------------------------

  peerConnection.addEventListener(
    "icecandidate",
    async event => {

      if (
        !event.candidate ||
        !currentCallId ||
        !auth.currentUser
      ) {
        return;
      }

      const candidatePath =
        `calls/${currentCallId}/candidates/${auth.currentUser.uid}`;

      const candidateRef =
        ref(
          database,
          candidatePath
        );

      await set(
        candidateRef,
        event.candidate.toJSON()
      );
    }
  );


  // ----------------------------------------------------------
  // Connection state
  // ----------------------------------------------------------

  peerConnection.addEventListener(
    "connectionstatechange",
    () => {

      const state =
        peerConnection.connectionState;

      if (state === "connected") {

        status(
          "🟢 UHD call connected"
        );

      } else if (state === "connecting") {

        status(
          "🔄 Call connecting..."
        );

      } else if (state === "disconnected") {

        status(
          "🟡 Network disconnected"
        );

      } else if (state === "failed") {

        status(
          "🔴 Call connection failed"
        );

      } else if (state === "closed") {

        status(
          "⚫ Call ended"
        );
      }
    }
  );


  // ----------------------------------------------------------
  // ICE connection state
  // ----------------------------------------------------------

  peerConnection.addEventListener(
    "iceconnectionstatechange",
    () => {

      console.log(
        "ICE:",
        peerConnection.iceConnectionState
      );
    }
  );


  return peerConnection;
}


// ============================================================
// PREFER HIGH QUALITY CODECS
// ============================================================

function preferHighQualityCodecs() {

  if (!peerConnection) {
    return;
  }

  const senders =
    peerConnection.getSenders();

  for (const sender of senders) {

    const track =
      sender.track;

    if (!track) {
      continue;
    }

    if (
      track.kind === "video" &&
      sender.getCapabilities
    ) {

      const capabilities =
        RTCRtpSender.getCapabilities(
          "video"
        );

      if (
        capabilities?.codecs
      ) {

        const codecs =
          capabilities.codecs;

        const preferred =
          codecs.sort(
            (a, b) => {

              const aName =
                a.mimeType.toLowerCase();

              const bName =
                b.mimeType.toLowerCase();

              // Prefer VP9 / AV1 / VP8 / H264
              const score = name => {

                if (
                  name.includes("av1")
                ) return 5;

                if (
                  name.includes("vp9")
                ) return 4;

                if (
                  name.includes("vp8")
                ) return 3;

                if (
                  name.includes("h264")
                ) return 2;

                return 1;
              };

              return score(bName) -
                     score(aName);
            }
          );

        try {

          sender.setCodecPreferences(
            preferred
          );

        } catch (error) {

          console.warn(
            "Codec preference unavailable.",
            error
          );
        }
      }
    }
  }
}


// ============================================================
// SET VIDEO BITRATE
// ============================================================

async function optimizeVideoSender() {

  if (!peerConnection) {
    return;
  }

  const senders =
    peerConnection.getSenders();

  for (const sender of senders) {

    if (
      !sender.track ||
      sender.track.kind !== "video"
    ) {
      continue;
    }

    try {

      const parameters =
        sender.getParameters();

      if (
        !parameters.encodings ||
        !parameters.encodings.length
      ) {
        continue;
      }

      for (
        const encoding of parameters.encodings
      ) {

        encoding.maxBitrate =
          CONFIG.MAX_VIDEO_BITRATE;

        encoding.minBitrate =
          CONFIG.MIN_VIDEO_BITRATE;

        encoding.maxFramerate =
          CONFIG.FPS;

        encoding.scaleResolutionDownBy =
          1;
      }

      await sender.setParameters(
        parameters
      );

      console.log(
        "UHD video bitrate configured."
      );

    } catch (error) {

      console.warn(
        "Could not set video bitrate.",
        error
      );
    }
  }
}


// ============================================================
// CALL QUALITY SETTINGS
// ============================================================

async function optimizeCallQuality() {

  preferHighQualityCodecs();

  await optimizeVideoSender();

  const senders =
    peerConnection?.getSenders() || [];

  for (const sender of senders) {

    if (
      sender.track?.kind !== "audio"
    ) {
      continue;
    }

    try {

      const parameters =
        sender.getParameters();

      if (
        parameters.encodings?.length
      ) {

        for (
          const encoding of parameters.encodings
        ) {

          encoding.maxBitrate =
            CONFIG.AUDIO_BITRATE;
        }

        await sender.setParameters(
          parameters
        );
      }

    } catch (error) {

      console.warn(
        "Audio bitrate optimization skipped.",
        error
      );
    }
  }
}


// ============================================================
// START CALL
// ============================================================

export async function startCall(
  peerId,
  callId,
  videoCall = true
) {

  if (!auth.currentUser) {

    throw new Error(
      "Login required."
    );
  }

  currentPeerId =
    peerId;

  currentCallId =
    callId;

  caller = true;

  await getUHDMedia({
    video: videoCall,
    audio: true
  });

  createPeerConnection();

  await optimizeCallQuality();

  const offer =
    await peerConnection.createOffer({

      offerToReceiveAudio: true,

      offerToReceiveVideo:
        videoCall,

      voiceActivityDetection: true
    });

  await peerConnection.setLocalDescription(
    offer
  );

  const callRef =
    ref(
      database,
      `calls/${callId}`
    );

  await set(
    callRef,
    {

      callerId:
        auth.currentUser.uid,

      receiverId:
        peerId,

      type:
        videoCall
          ? "video"
          : "audio",

      offer: {
        type: offer.type,
        sdp: offer.sdp
      },

      createdAt:
        Date.now(),

      status:
        "ringing"
    }
  );

  await onDisconnect(
    callRef
  ).remove();

  status(
    videoCall
      ? "📹 Video call ringing..."
      : "🎧 Audio call ringing..."
  );

  return callId;
}


// ============================================================
// ACCEPT CALL
// ============================================================

export async function acceptCall(
  callId,
  videoCall = true
) {

  if (!auth.currentUser) {

    throw new Error(
      "Login required."
    );
  }

  currentCallId =
    callId;

  caller = false;

  await getUHDMedia({
    video: videoCall,
    audio: true
  });

  createPeerConnection();

  const callRef =
    ref(
      database,
      `calls/${callId}`
    );

  const snapshot =
    await new Promise(
      resolve => {

        const unsubscribe =
          onValue(
            callRef,
            snap => {

              unsubscribe();

              resolve(snap);
            },
            {
              onlyOnce: true
            }
          );
      }
    );

  const call =
    snapshot.val();

  if (!call?.offer) {

    throw new Error(
      "Call offer পাওয়া যায়নি।"
    );
  }

  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(
      call.offer
    )
  );

  const answer =
    await peerConnection.createAnswer();

  await peerConnection.setLocalDescription(
    answer
  );

  await set(
    callRef,
    {

      ...call,

      answer: {
        type: answer.type,
        sdp: answer.sdp
      },

      status:
        "connected"
    }
  );

  await optimizeCallQuality();

  status(
    videoCall
      ? "🟢 Video call connected"
      : "🟢 Audio call connected"
  );
}


// ============================================================
// END CALL
// ============================================================

export async function endCall() {

  if (peerConnection) {

    peerConnection.close();

    peerConnection = null;
  }

  if (localStream) {

    for (
      const track of localStream.getTracks()
    ) {

      track.stop();
    }

    localStream = null;
  }

  if (remoteStream) {

    for (
      const track of remoteStream.getTracks()
    ) {

      track.stop();
    }

    remoteStream = null;
  }

  if (
    currentCallId &&
    database
  ) {

    try {

      await remove(
        ref(
          database,
          `calls/${currentCallId}`
        )
      );

    } catch (error) {

      console.warn(
        "Could not remove call.",
        error
      );
    }
  }

  if (localVideo) {

    localVideo.srcObject =
      null;
  }

  if (remoteVideo) {

    remoteVideo.srcObject =
      null;
  }

  currentCallId = null;
  currentPeerId = null;

  caller = false;

  status(
    "📴 Call ended"
  );
}


// ============================================================
// CAMERA ON / OFF
// ============================================================

export function toggleCamera(enabled) {

  if (!localStream) {
    return;
  }

  for (
    const track of
    localStream.getVideoTracks()
  ) {

    track.enabled =
      enabled;
  }
}


// ============================================================
// MICROPHONE ON / OFF
// ============================================================

export function toggleMicrophone(enabled) {

  if (!localStream) {
    return;
  }

  for (
    const track of
    localStream.getAudioTracks()
  ) {

    track.enabled =
      enabled;
  }
}


// ============================================================
// SWITCH CAMERA
// ============================================================

export async function switchCamera(
  facingMode = "environment"
) {

  if (!localStream) {
    return;
  }

  const videoTrack =
    localStream.getVideoTracks()[0];

  if (!videoTrack) {
    return;
  }

  try {

    await videoTrack.applyConstraints({
      facingMode
    });

  } catch (error) {

    console.warn(
      "Camera switching failed.",
      error
    );
  }
}


// ============================================================
// GET LOCAL STREAM
// ============================================================

export function getLocalStream() {

  return localStream;
}


// ============================================================
// GET REMOTE STREAM
// ============================================================

export function getRemoteStream() {

  return remoteStream;
}


// ============================================================
// GET CALL STATISTICS
// ============================================================

export async function getCallStats() {

  if (!peerConnection) {
    return null;
  }

  const stats =
    await peerConnection.getStats();

  const result = {

    video: null,

    audio: null,

    bitrate: 0,

    packetsLost: 0,

    packetsReceived: 0,

    packetsSent: 0
  };

  stats.forEach(report => {

    if (
      report.type === "inbound-rtp"
    ) {

      if (
        report.kind === "video"
      ) {

        result.video = {

          width:
            report.frameWidth || 0,

          height:
            report.frameHeight || 0,

          framesPerSecond:
            report.framesPerSecond || 0,

          packetsLost:
            report.packetsLost || 0
        };

        result.packetsReceived +=
          report.packetsReceived || 0;

        result.packetsLost +=
          report.packetsLost || 0;
      }

      if (
        report.kind === "audio"
      ) {

        result.audio = {

          packetsLost:
            report.packetsLost || 0,

          packetsReceived:
            report.packetsReceived || 0
        };
      }
    }

    if (
      report.type === "outbound-rtp"
    ) {

      if (
        report.kind === "video"
      ) {

        result.packetsSent +=
          report.packetsSent || 0;
      }
    }
  });

  return result;
}


// ============================================================
// PERIODIC QUALITY MONITOR
// ============================================================

export function startQualityMonitor(
  callback = null
) {

  const timer =
    setInterval(
      async () => {

        if (!peerConnection) {
          return;
        }

        try {

          const stats =
            await getCallStats();

          if (callback) {
            callback(stats);
          }

        } catch (error) {

          console.warn(
            "Quality monitor error:",
            error
          );
        }

      },
      3000
    );

  return () => {
    clearInterval(timer);
  };
}


// ============================================================
// EXPORT CONFIG
// ============================================================

export const AYNA_WEBRTC_CONFIG =
  CONFIG;