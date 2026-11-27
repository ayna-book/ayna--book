// ============================================================
// AYNA BOOK — CALL MANAGER
// Audio Call + Video Call + Incoming Call + RTDB Signaling
// Firebase Web SDK 13.4.0
// ============================================================

import { auth, database } from "../firebase-init.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  ref,
  set,
  get,
  update,
  push,
  onValue,
  onChildAdded,
  remove,
  onDisconnect,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";


// ============================================================
// CONFIG
// ============================================================

const CALLS_PATH = "calls";

const ICE_SERVERS = [
  {
    urls: [
      "stun:stun.l.google.com:19302",
      "stun:stun1.l.google.com:19302"
    ]
  }
];

const RTC_CONFIG = {
  iceServers: ICE_SERVERS,
  bundlePolicy: "max-bundle",
  rtcpMuxPolicy: "require"
};


// ============================================================
// STATE
// ============================================================

let currentUser = null;

let peerConnection = null;
let localStream = null;
let remoteStream = null;

let currentCallId = null;
let currentPeerId = null;
let currentPeerName = "AYNA User";
let currentCallType = "audio";

let callEnded = false;

let remoteCandidateListener = null;
let answerListener = null;
let callStatusListener = null;


// ============================================================
// DOM
// ============================================================

const $ = (id) => document.getElementById(id);

const callPanel = $("callPanel");
const remoteVideo = $("remoteVideo");
const localVideo = $("localVideo");
const callAvatar = $("callAvatar");
const callAvatarName = $("callAvatarName");

const muteCallBtn = $("muteCallBtn");
const cameraCallBtn = $("cameraCallBtn");
const switchCameraBtn = $("switchCameraBtn");
const endCallBtn = $("endCallBtn");


// ============================================================
// AUTH
// ============================================================

onAuthStateChanged(auth, (user) => {

  currentUser = user || null;

  if (!user) {
    cleanupCall(false);
    return;
  }

  console.log("AYNA CALL: authenticated:", user.uid);

});


// ============================================================
// UI
// ============================================================

function showCallPanel(name = "AYNA User", videoCall = false) {

  if (callAvatarName) {
    callAvatarName.textContent = name;
  }

  if (callPanel) {
    callPanel.style.display = "flex";
  }

  if (localVideo) {
    localVideo.style.display = videoCall ? "block" : "none";
  }

  if (remoteVideo) {
    remoteVideo.style.display = videoCall ? "block" : "none";
  }

  if (cameraCallBtn) {
    cameraCallBtn.style.display = videoCall ? "inline-flex" : "none";
  }

  if (switchCameraBtn) {
    switchCameraBtn.style.display = videoCall ? "inline-flex" : "none";
  }
}


function hideCallPanel() {

  if (callPanel) {
    callPanel.style.display = "none";
  }

}


function setCallStatus(message) {

  const status =
    $("callStatus") ||
    $("chatStatus") ||
    $("call-status");

  if (status) {
    status.textContent = message;
  }

  console.log("AYNA CALL:", message);
}


// ============================================================
// MEDIA
// ============================================================

async function getMedia(videoCall) {

  if (!navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia) {

    throw new Error(
      "এই ব্রাউজারে Audio/Video Call সমর্থিত নয়।"
    );
  }


  const audioConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    channelCount: 2,
    sampleRate: 48000
  };


  if (!videoCall) {

    return navigator.mediaDevices.getUserMedia({
      audio: audioConstraints,
      video: false
    });

  }


  // প্রথমে HD/UHD চেষ্টা
  try {

    return await navigator.mediaDevices.getUserMedia({
      audio: audioConstraints,

      video: {
        width: {
          ideal: 3840,
          max: 3840
        },

        height: {
          ideal: 2160,
          max: 2160
        },

        frameRate: {
          ideal: 30,
          max: 60
        },

        facingMode: "user"
      }
    });

  } catch (error) {

    console.warn(
      "UHD camera unavailable, trying HD:",
      error
    );

  }


  // HD fallback
  return navigator.mediaDevices.getUserMedia({

    audio: audioConstraints,

    video: {
      width: {
        ideal: 1920,
        max: 1920
      },

      height: {
        ideal: 1080,
        max: 1080
      },

      frameRate: {
        ideal: 30,
        max: 30
      },

      facingMode: "user"
    }

  });

}


// ============================================================
// PEER CONNECTION
// ============================================================

function createPeerConnection(callId, peerId, videoCall) {

  const pc = new RTCPeerConnection(RTC_CONFIG);


  // ----------------------------------------------------------
  // Remote stream
  // ----------------------------------------------------------

  remoteStream = new MediaStream();

  if (remoteVideo) {
    remoteVideo.srcObject = remoteStream;
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
  }


  pc.ontrack = (event) => {

    console.log("AYNA CALL: remote track received");

    if (event.streams && event.streams[0]) {

      remoteStream = event.streams[0];

      if (remoteVideo) {
        remoteVideo.srcObject = remoteStream;

        remoteVideo.play().catch(() => {});
      }

      return;
    }


    if (event.track) {

      remoteStream.addTrack(event.track);

    }

  };


  // ----------------------------------------------------------
  // ICE candidate
  // ----------------------------------------------------------

  pc.onicecandidate = async (event) => {

    if (!event.candidate || !currentUser) {
      return;
    }

    try {

      const candidateRef = push(
        ref(
          database,
          `${CALLS_PATH}/${callId}/candidates/${currentUser.uid}`
        )
      );

      await set(candidateRef, {
        candidate: event.candidate.toJSON(),
        createdAt: serverTimestamp()
      });

    } catch (error) {

      console.error(
        "AYNA CALL ICE write error:",
        error
      );

    }

  };


  // ----------------------------------------------------------
  // Connection state
  // ----------------------------------------------------------

  pc.onconnectionstatechange = () => {

    console.log(
      "AYNA CALL connection:",
      pc.connectionState
    );


    if (pc.connectionState === "connected") {

      setCallStatus("কল সংযুক্ত হয়েছে");

    }


    if (
      pc.connectionState === "failed" ||
      pc.connectionState === "disconnected"
    ) {

      setCallStatus("কল সংযোগে সমস্যা হচ্ছে");

    }


    if (pc.connectionState === "closed") {

      cleanupCall(false);

    }

  };


  // ----------------------------------------------------------
  // ICE state
  // ----------------------------------------------------------

  pc.oniceconnectionstatechange = () => {

    console.log(
      "AYNA CALL ICE:",
      pc.iceConnectionState
    );

  };


  // ----------------------------------------------------------
  // Codec preference
  // ----------------------------------------------------------

  if (
    videoCall &&
    typeof RTCRtpSender !== "undefined" &&
    RTCRtpSender.getCapabilities
  ) {

    try {

      const capabilities =
        RTCRtpSender.getCapabilities("video");

      if (
        capabilities &&
        capabilities.codecs &&
        capabilities.codecs.length
      ) {

        const preferred = capabilities.codecs.sort(
          (a, b) => {

            const score = (codec) => {

              const mime =
                codec.mimeType.toLowerCase();

              if (mime.includes("av1")) return 4;
              if (mime.includes("vp9")) return 3;
              if (mime.includes("vp8")) return 2;
              if (mime.includes("h264")) return 1;

              return 0;
            };

            return score(b) - score(a);

          }
        );


        for (const sender of pc.getSenders()) {

          if (
            sender.track &&
            sender.track.kind === "video" &&
            sender.setCodecPreferences
          ) {

            try {
              sender.setCodecPreferences(preferred);
            } catch (error) {
              console.warn(
                "Codec preference unavailable:",
                error
              );
            }

          }

        }

      }

    } catch (error) {

      console.warn(
        "Codec selection skipped:",
        error
      );

    }

  }


  return pc;

}


// ============================================================
// ADD LOCAL TRACKS
// ============================================================

function addLocalTracks() {

  if (!peerConnection || !localStream) {
    return;
  }


  localStream.getTracks().forEach((track) => {

    try {

      peerConnection.addTrack(
        track,
        localStream
      );

    } catch (error) {

      console.warn(
        "Track add error:",
        error
      );

    }

  });

}


// ============================================================
// REMOTE ICE LISTENER
// ============================================================

function listenForRemoteCandidates(callId, remoteUid) {

  if (!peerConnection) {
    return;
  }


  const candidatesRef = ref(
    database,
    `${CALLS_PATH}/${callId}/candidates/${remoteUid}`
  );


  remoteCandidateListener = onChildAdded(
    candidatesRef,
    async (snapshot) => {

      const data = snapshot.val();

      if (!data || !data.candidate) {
        return;
      }


      try {

        await peerConnection.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );

      } catch (error) {

        console.warn(
          "Remote ICE candidate error:",
          error
        );

      }

    }
  );

}


// ============================================================
// WAIT FOR ANSWER
// ============================================================

function listenForAnswer(callId) {

  const answerRef = ref(
    database,
    `${CALLS_PATH}/${callId}/answer`
  );


  answerListener = onValue(
    answerRef,
    async (snapshot) => {

      const answer = snapshot.val();

      if (!answer || !peerConnection) {
        return;
      }

      if (
        peerConnection.currentRemoteDescription
      ) {
        return;
      }


      try {

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );

        setCallStatus("ভিডিও/অডিও সংযোগ প্রস্তুত হচ্ছে...");

      } catch (error) {

        console.error(
          "Set remote answer error:",
          error
        );

      }

    }
  );

}


// ============================================================
// CALL STATUS
// ============================================================

function listenForCallStatus(callId) {

  const statusRef = ref(
    database,
    `${CALLS_PATH}/${callId}/status`
  );


  callStatusListener = onValue(
    statusRef,
    (snapshot) => {

      const status = snapshot.val();

      if (!status) {
        return;
      }


      if (status === "accepted") {

        setCallStatus("কল গ্রহণ করা হয়েছে");

      }


      if (status === "rejected") {

        setCallStatus("কল প্রত্যাখ্যান করা হয়েছে");

        setTimeout(() => {
          cleanupCall(true);
        }, 1000);

      }


      if (status === "ended") {

        setCallStatus("কল শেষ হয়েছে");

        setTimeout(() => {
          cleanupCall(true);
        }, 500);

      }

    }
  );

}


// ============================================================
// START CALL
// ============================================================

async function startCall(
  peerId,
  videoCall = true,
  peerName = "AYNA User"
) {

  if (!currentUser) {

    alert("কল করার আগে লগইন করুন।");

    return;

  }


  if (!peerId) {

    alert("যাকে কল করবেন তার User UID পাওয়া যায়নি।");

    return;

  }


  if (peerId === currentUser.uid) {

    alert("নিজেকে কল করা যাবে না।");

    return;

  }


  if (peerConnection) {

    alert("একটি কল ইতিমধ্যে চলছে।");

    return;

  }


  currentPeerId = peerId;
  currentPeerName = peerName || "AYNA User";
  currentCallType = videoCall ? "video" : "audio";
  callEnded = false;


  try {

    setCallStatus(
      videoCall
        ? "ভিডিও কল শুরু হচ্ছে..."
        : "অডিও কল শুরু হচ্ছে..."
    );


    showCallPanel(
      currentPeerName,
      videoCall
    );


    // Media
    localStream = await getMedia(videoCall);


    if (localVideo) {

      localVideo.srcObject = localStream;
      localVideo.muted = true;
      localVideo.autoplay = true;
      localVideo.playsInline = true;

      if (videoCall) {
        localVideo.play().catch(() => {});
      }

    }


    // Call ID
    const callRef = push(
      ref(database, CALLS_PATH)
    );

    currentCallId = callRef.key;


    // Peer
    peerConnection =
      createPeerConnection(
        currentCallId,
        peerId,
        videoCall
      );


    addLocalTracks();


    // Offer
    const offer =
      await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: videoCall
      });


    await peerConnection.setLocalDescription(
      offer
    );


    // Call data
    await set(callRef, {

      callerId: currentUser.uid,

      receiverId: peerId,

      callerName:
        currentUser.displayName ||
        currentUser.email ||
        "AYNA User",

      receiverName:
        currentPeerName,

      type:
        videoCall ? "video" : "audio",

      offer: {
        type: offer.type,
        sdp: offer.sdp
      },

      status: "ringing",

      createdAt: serverTimestamp()

    });


    // Disconnect cleanup
    try {

      await onDisconnect(
        ref(
          database,
          `${CALLS_PATH}/${currentCallId}/status`
        )
      ).set("ended");

    } catch (error) {

      console.warn(
        "onDisconnect setup error:",
        error
      );

    }


    listenForAnswer(
      currentCallId
    );


    listenForRemoteCandidates(
      currentCallId,
      peerId
    );


    listenForCallStatus(
      currentCallId
    );


    setCallStatus(
      videoCall
        ? "ভিডিও কল করা হচ্ছে..."
        : "অডিও কল করা হচ্ছে..."
    );


  } catch (error) {

    console.error(
      "AYNA CALL start error:",
      error
    );


    alert(
      getCallError(error)
    );


    cleanupCall(false);

  }

}


// ============================================================
// ACCEPT CALL
// ============================================================

async function acceptCall(
  callId,
  videoCall = true
) {

  if (!currentUser) {
    return;
  }


  if (!callId) {
    return;
  }


  try {

    setCallStatus("কল গ্রহণ করা হচ্ছে...");


    const callRef = ref(
      database,
      `${CALLS_PATH}/${callId}`
    );


    const snapshot =
      await get(callRef);


    if (!snapshot.exists()) {

      alert("এই কলটি আর পাওয়া যাচ্ছে না.");

      return;

    }


    const call = snapshot.val();


    if (
      call.receiverId !== currentUser.uid
    ) {

      alert("এই কলটি আপনার জন্য নয়.");

      return;

    }


    currentCallId = callId;

    currentPeerId = call.callerId;

    currentPeerName =
      call.callerName ||
      "AYNA User";

    currentCallType =
      call.type ||
      (videoCall ? "video" : "audio");

    callEnded = false;


    const isVideo =
      currentCallType === "video";


    showCallPanel(
      currentPeerName,
      isVideo
    );


    // Media
    localStream =
      await getMedia(isVideo);


    if (localVideo) {

      localVideo.srcObject =
        localStream;

      localVideo.muted = true;
      localVideo.autoplay = true;
      localVideo.playsInline = true;

      if (isVideo) {
        localVideo.play().catch(() => {});
      }

    }


    // Peer
    peerConnection =
      createPeerConnection(
        callId,
        currentPeerId,
        isVideo
      );


    addLocalTracks();


    // Offer
    if (!call.offer) {

      throw new Error(
        "কলের offer পাওয়া যায়নি।"
      );

    }


    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(
        call.offer
      )
    );


    // Answer
    const answer =
      await peerConnection.createAnswer();


    await peerConnection.setLocalDescription(
      answer
    );


    await update(
      callRef,
      {

        answer: {
          type: answer.type,
          sdp: answer.sdp
        },

        status: "accepted",

        acceptedAt:
          serverTimestamp()

      }
    );


    listenForRemoteCandidates(
      callId,
      currentPeerId
    );


    listenForCallStatus(
      callId
    );


    setCallStatus(
      isVideo
        ? "ভিডিও কল সংযুক্ত হচ্ছে..."
        : "অডিও কল সংযুক্ত হচ্ছে..."
    );


  } catch (error) {

    console.error(
      "AYNA CALL accept error:",
      error
    );


    alert(
      getCallError(error)
    );


    cleanupCall(false);

  }

}


// ============================================================
// REJECT CALL
// ============================================================

async function rejectCall(callId) {

  if (!callId) {
    return;
  }


  try {

    await update(
      ref(
        database,
        `${CALLS_PATH}/${callId}`
      ),

      {
        status: "rejected",
        rejectedAt: serverTimestamp()
      }
    );

  } catch (error) {

    console.error(
      "Reject call error:",
      error
    );

  }

}


// ============================================================
// END CALL
// ============================================================

async function endCall() {

  if (callEnded) {
    return;
  }

  callEnded = true;


  const callId =
    currentCallId;


  try {

    if (callId) {

      await update(
        ref(
          database,
          `${CALLS_PATH}/${callId}`
        ),

        {
          status: "ended",
          endedAt: serverTimestamp()
        }
      );

    }

  } catch (error) {

    console.warn(
      "End call database error:",
      error
    );

  }


  cleanupCall(true);

}


// ============================================================
// CLEANUP
// ============================================================

async function cleanupCall(removeCall = false) {

  const callId =
    currentCallId;


  try {

    if (peerConnection) {

      peerConnection.ontrack = null;
      peerConnection.onicecandidate = null;

      peerConnection.close();

    }

  } catch (error) {

    console.warn(
      "Peer cleanup error:",
      error
    );

  }


  peerConnection = null;


  if (localStream) {

    localStream.getTracks().forEach(
      (track) => {

        try {
          track.stop();
        } catch (_) {}

      }
    );

  }


  localStream = null;


  if (remoteStream) {

    remoteStream.getTracks().forEach(
      (track) => {

        try {
          track.stop();
        } catch (_) {}

      }
    );

  }


  remoteStream = null;


  if (localVideo) {
    localVideo.srcObject = null;
  }


  if (remoteVideo) {
    remoteVideo.srcObject = null;
  }


  if (callId && removeCall) {

    try {

      await remove(
        ref(
          database,
          `${CALLS_PATH}/${callId}`
        )
      );

    } catch (error) {

      console.warn(
        "Call remove error:",
        error
      );

    }

  }


  currentCallId = null;
  currentPeerId = null;
  currentPeerName = "AYNA User";
  currentCallType = "audio";


  hideCallPanel();

  setCallStatus("");


}


// ============================================================
// MUTE MICROPHONE
// ============================================================

function toggleMute() {

  if (!localStream) {
    return;
  }


  const audioTracks =
    localStream.getAudioTracks();


  if (!audioTracks.length) {
    return;
  }


  const enabled =
    audioTracks[0].enabled;


  audioTracks.forEach(
    (track) => {
      track.enabled = !enabled;
    }
  );


  if (muteCallBtn) {

    muteCallBtn.textContent =
      enabled
        ? "🔇 Unmute"
        : "🎙️ Mute";

  }


  setCallStatus(
    enabled
      ? "Microphone বন্ধ"
      : "Microphone চালু"
  );

}


// ============================================================
// CAMERA
// ============================================================

function toggleCamera() {

  if (!localStream) {
    return;
  }


  const videoTracks =
    localStream.getVideoTracks();


  if (!videoTracks.length) {
    return;
  }


  const enabled =
    videoTracks[0].enabled;


  videoTracks.forEach(
    (track) => {
      track.enabled = !enabled;
    }
  );


  if (cameraCallBtn) {

    cameraCallBtn.textContent =
      enabled
        ? "📷 Camera ON"
        : "🚫 Camera OFF";

  }


}


// ============================================================
// SWITCH CAMERA
// ============================================================

async function switchCamera() {

  if (!localStream) {
    return;
  }


  const videoTracks =
    localStream.getVideoTracks();


  if (!videoTracks.length) {
    return;
  }


  const oldTrack =
    videoTracks[0];


  const currentFacing =
    oldTrack.getSettings().facingMode ||
    "user";


  const newFacing =
    currentFacing === "user"
      ? "environment"
      : "user";


  try {

    const newStream =
      await navigator.mediaDevices.getUserMedia({

        video: {
          width: {
            ideal: 1920
          },

          height: {
            ideal: 1080
          },

          frameRate: {
            ideal: 30
          },

          facingMode: {
            exact: newFacing
          }

        },

        audio: false

      });


    const newTrack =
      newStream.getVideoTracks()[0];


    const sender =
      peerConnection
        ?.getSenders()
        .find(
          (s) =>
            s.track &&
            s.track.kind === "video"
        );


    if (sender) {

      await sender.replaceTrack(
        newTrack
      );

    }


    oldTrack.stop();


    const audioTracks =
      localStream.getAudioTracks();


    localStream =
      new MediaStream([
        ...audioTracks,
        newTrack
      ]);


    if (localVideo) {

      localVideo.srcObject =
        localStream;

    }


    setCallStatus(
      newFacing === "environment"
        ? "Rear camera চালু"
        : "Front camera চালু"
    );


  } catch (error) {

    console.warn(
      "Switch camera failed:",
      error
    );


    alert(
      "এই ফোনে Camera Switch করা যাচ্ছে না।"
    );

  }

}


// ============================================================
// INCOMING CALL LISTENER
// ============================================================

function listenForIncomingCalls() {

  if (!currentUser) {
    return;
  }


  const incomingRef =
    ref(
      database,
      CALLS_PATH
    );


  onChildAdded(
    incomingRef,
    async (snapshot) => {

      const call =
        snapshot.val();


      const callId =
        snapshot.key;


      if (!call) {
        return;
      }


      if (
        call.receiverId !==
        currentUser.uid
      ) {
        return;
      }


      if (
        call.status !==
        "ringing"
      ) {
        return;
      }


      // যদি নিজের active call থাকে
      if (peerConnection) {
        return;
      }


      const callerName =
        call.callerName ||
        "AYNA User";


      const isVideo =
        call.type ===
        "video";


      showIncomingCallUI(
        callId,
        callerName,
        isVideo
      );

    }
  );

}


// ============================================================
// INCOMING CALL UI
// ============================================================

function showIncomingCallUI(
  callId,
  callerName,
  videoCall
) {

  const existing =
    document.getElementById(
      "aynaIncomingCall"
    );


  if (existing) {
    existing.remove();
  }


  const box =
    document.createElement("div");


  box.id =
    "aynaIncomingCall";


  box.style.cssText = `
    position:fixed;
    inset:0;
    z-index:99999;
    background:rgba(3,8,20,.96);
    display:flex;
    align-items:center;
    justify-content:center;
    padding:24px;
  `;


  box.innerHTML = `

    <div style="
      width:min(520px,100%);
      background:#07132d;
      border:2px solid #d4af37;
      border-radius:24px;
      padding:30px;
      text-align:center;
      color:#fff;
      box-shadow:0 20px 70px rgba(0,0,0,.7);
    ">

      <div style="
        font-size:70px;
        margin-bottom:15px;
      ">
        ${videoCall ? "🎥" : "📞"}
      </div>

      <div style="
        font-size:28px;
        font-weight:900;
        color:#ffd700;
        margin-bottom:10px;
      ">
        Incoming ${videoCall ? "Video" : "Audio"} Call
      </div>

      <div style="
        font-size:24px;
        font-weight:800;
        margin-bottom:28px;
      ">
        ${escapeHTML(callerName)}
      </div>

      <div style="
        display:flex;
        gap:15px;
        justify-content:center;
        flex-wrap:wrap;
      ">

        <button
          id="aynaAcceptCall"
          style="
            padding:18px 28px;
            border:0;
            border-radius:16px;
            background:#16a34a;
            color:#fff;
            font-size:21px;
            font-weight:900;
            cursor:pointer;
          "
        >
          ✅ ACCEPT
        </button>

        <button
          id="aynaRejectCall"
          style="
            padding:18px 28px;
            border:0;
            border-radius:16px;
            background:#dc2626;
            color:#fff;
            font-size:21px;
            font-weight:900;
            cursor:pointer;
          "
        >
          ❌ REJECT
        </button>

      </div>

    </div>
  `;


  document.body.appendChild(box);


  $("aynaAcceptCall")
    ?.addEventListener(
      "click",
      async () => {

        box.remove();

        await acceptCall(
          callId,
          videoCall
        );

      }
    );


  $("aynaRejectCall")
    ?.addEventListener(
      "click",
      async () => {

        box.remove();

        await rejectCall(
          callId
        );

      }
    );

}


// ============================================================
// ERROR MESSAGE
// ============================================================

function getCallError(error) {

  const name =
    error?.name || "";

  const code =
    error?.code || "";


  if (
    name ===
    "NotAllowedError"
  ) {

    return (
      "Camera/Microphone permission দেওয়া হয়নি। " +
      "Browser Settings থেকে Camera ও Microphone Allow করুন।"
    );

  }


  if (
    name ===
    "NotFoundError"
  ) {

    return (
      "Camera বা Microphone পাওয়া যায়নি।"
    );

  }


  if (
    name ===
    "NotReadableError"
  ) {

    return (
      "Camera/Microphone অন্য কোনো অ্যাপ ব্যবহার করছে।"
    );

  }


  if (
    name ===
    "OverconstrainedError"
  ) {

    return (
      "আপনার ডিভাইসের Camera এই Quality সমর্থন করছে না।"
    );

  }


  if (
    code ===
    "PERMISSION_DENIED"
  ) {

    return (
      "কলের জন্য Firebase permission পাওয়া যায়নি।"
    );

  }


  return (
    error?.message ||
    "কল শুরু করা যাচ্ছে না।"
  );

}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// ============================================================
// BUTTON EVENTS
// ============================================================

muteCallBtn?.addEventListener(
  "click",
  toggleMute
);


cameraCallBtn?.addEventListener(
  "click",
  toggleCamera
);


switchCameraBtn?.addEventListener(
  "click",
  switchCamera
);


endCallBtn?.addEventListener(
  "click",
  endCall
);


// ============================================================
// PUBLIC API
// ============================================================

window.AYNA_CALL = {

  startCall,

  acceptCall,

  rejectCall,

  endCall,

  toggleMute,

  toggleCamera,

  switchCamera,

  getState() {

    return {

      connected:
        !!peerConnection,

      callId:
        currentCallId,

      peerId:
        currentPeerId,

      peerName:
        currentPeerName,

      type:
        currentCallType

    };

  }

};


// ============================================================
// START INCOMING CALL MONITOR
// ============================================================

onAuthStateChanged(
  auth,
  (user) => {

    if (!user) {
      return;
    }

    setTimeout(
      listenForIncomingCalls,
      500
    );

  }
);


console.log(
  "AYNA BOOK Call Manager loaded successfully."
);