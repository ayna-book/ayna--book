/* ============================================================
   AYNA BOOK — CALL MANAGER
   ============================================================

   File:
   js/call-manager.js

   Features:
   ------------------------------------------------------------
   • WebRTC Audio Call
   • WebRTC Video Call
   • Incoming Call
   • Accept Call
   • Reject Call
   • End Call
   • Mute / Unmute
   • Camera On / Off
   • Front / Back Camera
   • Remote Audio / Video
   • RTDB Offer / Answer signaling
   • RTDB ICE candidate signaling
   • Connection state
   • Network quality monitoring
   • Automatic cleanup
   • Mobile browser friendly
   • GitHub Pages HTTPS compatible

   Firebase:
   • Authentication
   • Realtime Database

   No Firebase Storage required.
   ============================================================ */

import { auth, database } from "../firebase-init.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  ref,
  set,
  update,
  get,
  remove,
  onValue,
  push,
  onChildAdded,
  onChildRemoved,
  onDisconnect,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";


/* ============================================================
   AYNA CALL CONFIGURATION
   ============================================================ */

const AYNA_CALL_CONFIG = {

  /* ----------------------------------------------------------
     STUN servers
     ---------------------------------------------------------- */

  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302"
      ]
    }
  ],

  /* ----------------------------------------------------------
     Video
     ---------------------------------------------------------- */

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
    }
  },

  /* ----------------------------------------------------------
     Audio
     ---------------------------------------------------------- */

  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    channelCount: 2,
    sampleRate: 48000,
    sampleSize: 16
  },

  /* ----------------------------------------------------------
     Bitrate
     ---------------------------------------------------------- */

  videoMaxBitrate: 12000000,
  videoMinBitrate: 500000,

  audioMaxBitrate: 128000,

  /* ----------------------------------------------------------
     Quality monitor
     ---------------------------------------------------------- */

  qualityInterval: 3000,

  /* ----------------------------------------------------------
     Call timeout
     ---------------------------------------------------------- */

  callTimeout: 45000
};


/* ============================================================
   GLOBAL STATE
   ============================================================ */

let currentUser = null;

let currentCallId = null;

let currentPeerId = null;

let currentCallType = null;

let currentRole = null;

let peerConnection = null;

let localStream = null;

let remoteStream = null;

let callRecordListener = null;

let incomingCallsListener = null;

let candidateListeners = new Map();

let candidateWriteRef = null;

let qualityTimer = null;

let callTimeoutTimer = null;

let callEnded = false;

let microphoneMuted = false;

let cameraEnabled = true;

let currentFacingMode = "user";

let remoteDescriptionSet = false;


/* ============================================================
   DOM HELPERS
   ============================================================ */

function $(id) {
  return document.getElementById(id);
}


/* ============================================================
   LOGGING
   ============================================================ */

function callLog(...args) {
  console.log(
    "[AYNA CALL]",
    ...args
  );
}


/* ============================================================
   ERROR HANDLER
   ============================================================ */

function callError(...args) {
  console.error(
    "[AYNA CALL ERROR]",
    ...args
  );
}


/* ============================================================
   AUTH CHECK
   ============================================================ */

function requireUser() {

  if (!currentUser) {

    throw new Error(
      "AYNA BOOK: User is not authenticated."
    );
  }

  return currentUser;
}


/* ============================================================
   RANDOM CALL ID
   ============================================================ */

function createCallId() {

  const randomPart =
    Math.random()
      .toString(36)
      .slice(2, 12);

  return (
    "call_" +
    Date.now() +
    "_" +
    randomPart
  );
}


/* ============================================================
   USER NAME
   ============================================================ */

function getCurrentUserName() {

  return (
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "AYNA User"
  );
}


/* ============================================================
   USER EMAIL
   ============================================================ */

function getCurrentUserEmail() {

  return (
    currentUser?.email ||
    ""
  );
}


/* ============================================================
   FIREBASE CALL REFERENCE
   ============================================================ */

function getCallRef(callId) {

  return ref(
    database,
    `calls/${callId}`
  );
}


/* ============================================================
   UPDATE CALL UI
   ============================================================ */

function updateCallState(message) {

  const state =
    $("callState");

  if (state) {
    state.textContent = message;
  }

  callLog(message);
}


/* ============================================================
   OPEN CALL UI
   ============================================================ */

function openCallUI(
  type,
  name = "AYNA User"
) {

  const panel =
    $("callPanel");

  if (!panel) {
    callLog(
      "callPanel not found."
    );
    return;
  }

  panel.classList.add(
    "active"
  );

  panel.setAttribute(
    "aria-hidden",
    "false"
  );


  const title =
    $("callTitle");

  if (title) {

    title.textContent =
      type === "video"
        ? "AYNA Video Call"
        : "AYNA Audio Call";
  }


  const avatarName =
    $("callAvatarName");

  if (avatarName) {
    avatarName.textContent =
      name;
  }


  const remoteVideo =
    $("remoteVideo");

  const localVideo =
    $("localVideo");

  const callAvatar =
    $("callAvatar");


  if (type === "video") {

    if (remoteVideo) {
      remoteVideo.style.display =
        "block";
    }

    if (localVideo) {
      localVideo.style.display =
        "block";
    }

    if (callAvatar) {
      callAvatar.style.display =
        "none";
    }

  } else {

    if (remoteVideo) {
      remoteVideo.style.display =
        "none";
    }

    if (localVideo) {
      localVideo.style.display =
        "none";
    }

    if (callAvatar) {
      callAvatar.style.display =
        "flex";
    }
  }
}


/* ============================================================
   CLOSE CALL UI
   ============================================================ */

function closeCallUI() {

  const panel =
    $("callPanel");

  if (!panel) {
    return;
  }

  panel.classList.remove(
    "active"
  );

  panel.setAttribute(
    "aria-hidden",
    "true"
  );


  const remoteVideo =
    $("remoteVideo");

  const localVideo =
    $("localVideo");


  if (remoteVideo) {

    try {
      remoteVideo.pause();
    } catch (error) {}

    remoteVideo.srcObject = null;
  }


  if (localVideo) {

    try {
      localVideo.pause();
    } catch (error) {}

    localVideo.srcObject = null;
  }
}


/* ============================================================
   GET MEDIA
   ============================================================ */

async function getMedia(
  videoCall = true
) {

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {

    throw new Error(
      "এই browser WebRTC camera/microphone support করে না।"
    );
  }


  /* ----------------------------------------------------------
     First try UHD/4K
     ---------------------------------------------------------- */

  if (videoCall) {

    try {

      return await navigator
        .mediaDevices
        .getUserMedia({

          audio:
            AYNA_CALL_CONFIG.audio,

          video:
            AYNA_CALL_CONFIG.video

        });

    } catch (error) {

      callLog(
        "4K camera failed. Falling back to HD.",
        error
      );
    }
  }


  /* ----------------------------------------------------------
     HD fallback
     ---------------------------------------------------------- */

  if (videoCall) {

    return await navigator
      .mediaDevices
      .getUserMedia({

        audio:
          AYNA_CALL_CONFIG.audio,

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
            max: 60
          },

          facingMode:
            currentFacingMode
        }

      });
  }


  /* ----------------------------------------------------------
     Audio only
     ---------------------------------------------------------- */

  return await navigator
    .mediaDevices
    .getUserMedia({

      audio:
        AYNA_CALL_CONFIG.audio,

      video: false

    });
}


/* ============================================================
   SHOW LOCAL STREAM
   ============================================================ */

async function attachLocalStream(
  stream
) {

  localStream =
    stream;


  const localVideo =
    $("localVideo");

  if (
    localVideo &&
    currentCallType === "video"
  ) {

    localVideo.srcObject =
      stream;

    localVideo.muted =
      true;

    localVideo.playsInline =
      true;

    try {

      await localVideo.play();

    } catch (error) {

      callLog(
        "Local video autoplay blocked.",
        error
      );
    }
  }


  const audioTracks =
    stream.getAudioTracks();

  const videoTracks =
    stream.getVideoTracks();


  microphoneMuted =
    !audioTracks.some(
      track => track.enabled
    );


  cameraEnabled =
    videoTracks.length === 0
      ? false
      : videoTracks.some(
          track => track.enabled
        );


  updateCallControls();
}


/* ============================================================
   CREATE REMOTE STREAM
   ============================================================ */

function createRemoteStream() {

  if (!remoteStream) {

    remoteStream =
      new MediaStream();
  }

  return remoteStream;
}


/* ============================================================
   ATTACH REMOTE TRACK
   ============================================================ */

async function attachRemoteTrack(
  event
) {

  const stream =
    createRemoteStream();


  /* ----------------------------------------------------------
     Add tracks
     ---------------------------------------------------------- */

  event.streams?.forEach(
    incomingStream => {

      incomingStream
        .getTracks()
        .forEach(track => {

          if (
            !stream
              .getTracks()
              .some(
                t =>
                  t.id === track.id
              )
          ) {

            stream.addTrack(
              track
            );
          }

        });
    }
  );


  /* ----------------------------------------------------------
     Some browsers don't provide event.streams
     ---------------------------------------------------------- */

  if (
    event.track &&
    !stream
      .getTracks()
      .some(
        track =>
          track.id === event.track.id
      )
  ) {

    stream.addTrack(
      event.track
    );
  }


  const remoteVideo =
    $("remoteVideo");


  if (remoteVideo) {

    remoteVideo.srcObject =
      stream;

    remoteVideo.autoplay =
      true;

    remoteVideo.playsInline =
      true;


    try {

      await remoteVideo.play();

    } catch (error) {

      callLog(
        "Remote media autoplay blocked.",
        error
      );
    }
  }


  callLog(
    "Remote track received:",
    event.track?.kind
  );
}


/* ============================================================
   CREATE PEER CONNECTION
   ============================================================ */

function createPeerConnection() {

  if (peerConnection) {

    try {
      peerConnection.close();
    } catch (error) {}

    peerConnection = null;
  }


  peerConnection =
    new RTCPeerConnection({

      iceServers:
        AYNA_CALL_CONFIG.iceServers,

      bundlePolicy:
        "max-bundle",

      rtcpMuxPolicy:
        "require",

      iceCandidatePoolSize:
        10

    });


  /* ----------------------------------------------------------
     Local tracks
     ---------------------------------------------------------- */

  if (localStream) {

    localStream
      .getTracks()
      .forEach(track => {

        try {

          peerConnection.addTrack(
            track,
            localStream
          );

        } catch (error) {

          callError(
            "Could not add local track:",
            error
          );
        }
      });
  }


  /* ----------------------------------------------------------
     Remote tracks
     ---------------------------------------------------------- */

  peerConnection.ontrack =
    event => {

      attachRemoteTrack(
        event
      );
    };


  /* ----------------------------------------------------------
     ICE state
     ---------------------------------------------------------- */

  peerConnection.onicecandidate =
    event => {

      if (
        !event.candidate ||
        !currentCallId ||
        !currentUser
      ) {
        return;
      }


      const candidateRef =
        push(
          ref(
            database,
            `calls/${currentCallId}/candidates/${currentUser.uid}`
          )
        );


      candidateWriteRef =
        candidateRef;


      set(
        candidateRef,
        {
          candidate:
            event.candidate.candidate,

          sdpMid:
            event.candidate.sdpMid,

          sdpMLineIndex:
            event.candidate.sdpMLineIndex,

          usernameFragment:
            event.candidate.usernameFragment ||
            null,

          createdAt:
            serverTimestamp()
        }
      ).catch(
        error => {

          callError(
            "ICE candidate write failed:",
            error
          );
        }
      );
    };


  /* ----------------------------------------------------------
     ICE gathering
     ---------------------------------------------------------- */

  peerConnection.onicegatheringstatechange =
    () => {

      callLog(
        "ICE gathering:",
        peerConnection.iceGatheringState
      );
    };


  /* ----------------------------------------------------------
     Connection state
     ---------------------------------------------------------- */

  peerConnection.onconnectionstatechange =
    () => {

      if (!peerConnection) {
        return;
      }


      const state =
        peerConnection.connectionState;


      callLog(
        "Connection state:",
        state
      );


      if (
        state === "connected"
      ) {

        updateCallState(
          "Connected • HD/UHD WebRTC"
        );
      }


      if (
        state === "connecting"
      ) {

        updateCallState(
          "Connecting..."
        );
      }


      if (
        state === "disconnected"
      ) {

        updateCallState(
          "Connection unstable..."
        );
      }


      if (
        state === "failed"
      ) {

        updateCallState(
          "Connection failed."
        );
      }


      if (
        state === "closed"
      ) {

        updateCallState(
          "Call closed."
        );
      }
    };


  /* ----------------------------------------------------------
     ICE connection state
     ---------------------------------------------------------- */

  peerConnection.oniceconnectionstatechange =
    () => {

      if (!peerConnection) {
        return;
      }

      callLog(
        "ICE connection:",
        peerConnection
          .iceConnectionState
      );
    };


  /* ----------------------------------------------------------
     Signaling state
     ---------------------------------------------------------- */

  peerConnection.onsignalingstatechange =
    () => {

      if (!peerConnection) {
        return;
      }

      callLog(
        "Signaling state:",
        peerConnection
          .signalingState
      );
    };


  return peerConnection;
}


/* ============================================================
   ADD REMOTE ICE CANDIDATE
   ============================================================ */

async function addRemoteCandidate(
  candidateData
) {

  if (
    !peerConnection ||
    !candidateData
  ) {
    return;
  }


  if (
    !candidateData.candidate
  ) {
    return;
  }


  try {

    const candidate =
      new RTCIceCandidate({

        candidate:
          candidateData.candidate,

        sdpMid:
          candidateData.sdpMid,

        sdpMLineIndex:
          candidateData.sdpMLineIndex,

        usernameFragment:
          candidateData.usernameFragment ||
          undefined

      });


    await peerConnection
      .addIceCandidate(
        candidate
      );


    callLog(
      "Remote ICE candidate added."
    );

  } catch (error) {

    callError(
      "Remote ICE candidate failed:",
      error
    );
  }
}


/* ============================================================
   LISTEN FOR REMOTE ICE
   ============================================================ */

function listenForRemoteCandidates(
  callId,
  remoteUid
) {

  if (!callId || !remoteUid) {
    return;
  }


  const candidatePath =
    ref(
      database,
      `calls/${callId}/candidates/${remoteUid}`
    );


  const callback =
    snapshot => {

      const data =
        snapshot.val();

      if (!data) {
        return;
      }


      addRemoteCandidate(
        data
      );
    };


  onChildAdded(
    candidatePath,
    callback
  );


  candidateListeners.set(
    `${callId}:${remoteUid}`,
    {
      ref: candidatePath,
      callback
    }
  );
}


/* ============================================================
   REMOVE CANDIDATE LISTENERS
   ============================================================ */

function removeCandidateListeners() {

  candidateListeners.clear();
}


/* ============================================================
   CREATE OFFER
   ============================================================ */

async function createOffer() {

  if (!peerConnection) {

    throw new Error(
      "Peer connection is not ready."
    );
  }


  const offer =
    await peerConnection
      .createOffer({

        offerToReceiveAudio:
          true,

        offerToReceiveVideo:
          currentCallType === "video"

      });


  await peerConnection
    .setLocalDescription(
      offer
    );


  return {
    type:
      offer.type,

    sdp:
      offer.sdp
  };
}


/* ============================================================
   CREATE ANSWER
   ============================================================ */

async function createAnswer() {

  if (!peerConnection) {

    throw new Error(
      "Peer connection is not ready."
    );
  }


  const answer =
    await peerConnection
      .createAnswer({

        offerToReceiveAudio:
          true,

        offerToReceiveVideo:
          currentCallType === "video"

      });


  await peerConnection
    .setLocalDescription(
      answer
    );


  return {
    type:
      answer.type,

    sdp:
      answer.sdp
  };
}


/* ============================================================
   SET REMOTE DESCRIPTION
   ============================================================ */

async function setRemoteDescription(
  description
) {

  if (!peerConnection) {
    return;
  }


  if (
    !description ||
    !description.sdp
  ) {
    return;
  }


  try {

    await peerConnection
      .setRemoteDescription(
        new RTCSessionDescription(
          description
        )
      );


    remoteDescriptionSet =
      true;


    callLog(
      "Remote description set:",
      description.type
    );

  } catch (error) {

    callError(
      "Remote description error:",
      error
    );

    throw error;
  }
}


/* ============================================================
   START OUTGOING CALL
   ============================================================ */

async function startCall(
  peerId,
  videoCall = true,
  peerName = "AYNA User"
) {

  requireUser();


  if (!peerId) {

    throw new Error(
      "যাকে কল করবেন তার user ID প্রয়োজন।"
    );
  }


  if (
    peerId === currentUser.uid
  ) {

    throw new Error(
      "নিজেকে কল করা যাবে না।"
    );
  }


  if (
    currentCallId
  ) {

    throw new Error(
      "আপনার একটি call ইতিমধ্যে চলছে।"
    );
  }


  currentCallId =
    createCallId();

  currentPeerId =
    peerId;

  currentCallType =
    videoCall
      ? "video"
      : "audio";

  currentRole =
    "caller";

  callEnded =
    false;

  remoteDescriptionSet =
    false;


  openCallUI(
    currentCallType,
    peerName
  );


  updateCallState(
    "Microphone/Camera প্রস্তুত হচ্ছে..."
  );


  try {

    /* --------------------------------------------------------
       Get local media
       -------------------------------------------------------- */

    const stream =
      await getMedia(
        videoCall
      );


    await attachLocalStream(
      stream
    );


    /* --------------------------------------------------------
       Peer connection
       -------------------------------------------------------- */

    createPeerConnection();


    /* --------------------------------------------------------
       Offer
       -------------------------------------------------------- */

    const offer =
      await createOffer();


    /* --------------------------------------------------------
       Call database record
       -------------------------------------------------------- */

    const callRef =
      getCallRef(
        currentCallId
      );


    await set(
      callRef,
      {

        callerId:
          currentUser.uid,

        callerName:
          getCurrentUserName(),

        callerEmail:
          getCurrentUserEmail(),

        receiverId:
          peerId,

        receiverName:
          peerName,

        type:
          currentCallType,

        offer:
          offer,

        answer:
          null,

        status:
          "ringing",

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()

      }
    );


    /* --------------------------------------------------------
       Caller listens for answer
       -------------------------------------------------------- */

    listenForCallAnswer();


    /* --------------------------------------------------------
       Caller listens for receiver ICE
       -------------------------------------------------------- */

    listenForRemoteCandidates(
      currentCallId,
      peerId
    );


    /* --------------------------------------------------------
       Disconnect cleanup
       -------------------------------------------------------- */

    await onDisconnect(
      callRef
    ).update({

      status:
        "ended",

      endedBy:
        currentUser.uid,

      endedAt:
        serverTimestamp()

    });


    /* --------------------------------------------------------
       Timeout
       -------------------------------------------------------- */

    startCallTimeout();


    updateCallState(
      "Calling " +
      peerName +
      "..."
    );


    return currentCallId;

  } catch (error) {

    callError(
      "Start call failed:",
      error
    );


    await cleanupCall(
      true
    );


    throw error;
  }
}


/* ============================================================
   LISTEN FOR ANSWER
   ============================================================ */

function listenForCallAnswer() {

  if (
    !currentCallId
  ) {
    return;
  }


  const callRef =
    getCallRef(
      currentCallId
    );


  const callback =
    async snapshot => {

      const data =
        snapshot.val();

      if (!data) {
        return;
      }


      /* ------------------------------------------------------
         Ended / rejected
         ------------------------------------------------------ */

      if (
        data.status === "rejected"
      ) {

        updateCallState(
          "Call rejected."
        );

        await cleanupCall(
          false
        );

        return;
      }


      if (
        data.status === "ended"
      ) {

        updateCallState(
          "Call ended."
        );

        await cleanupCall(
          false
        );

        return;
      }


      /* ------------------------------------------------------
         Answer
         ------------------------------------------------------ */

      if (
        data.answer &&
        !remoteDescriptionSet
      ) {

        try {

          await setRemoteDescription(
            data.answer
          );


          updateCallState(
            "Connected..."
          );


          stopCallTimeout();

        } catch (error) {

          callError(
            "Setting answer failed:",
            error
          );
        }
      }

    };


  callRecordListener =
    callback;


  onValue(
    callRef,
    callback
  );
}


/* ============================================================
   ACCEPT INCOMING CALL
   ============================================================ */

async function acceptCall(
  callId,
  peerName = "AYNA User"
) {

  requireUser();


  if (
    currentCallId
  ) {

    throw new Error(
      "আপনার একটি call ইতিমধ্যে চলছে।"
    );
  }


  const callSnapshot =
    await get(
      getCallRef(
        callId
      )
    );


  if (!callSnapshot.exists()) {

    throw new Error(
      "Call পাওয়া যায়নি।"
    );
  }


  const call =
    callSnapshot.val();


  if (
    call.receiverId !==
    currentUser.uid
  ) {

    throw new Error(
      "এই call আপনার জন্য নয়।"
    );
  }


  if (
    call.status !== "ringing"
  ) {

    throw new Error(
      "Call আর available নেই।"
    );
  }


  currentCallId =
    callId;

  currentPeerId =
    call.callerId;

  currentCallType =
    call.type === "video"
      ? "video"
      : "audio";

  currentRole =
    "receiver";

  callEnded =
    false;

  remoteDescriptionSet =
    false;


  openCallUI(
    currentCallType,
    peerName ||
      call.callerName ||
      "AYNA User"
  );


  try {

    /* --------------------------------------------------------
       Local media
       -------------------------------------------------------- */

    const stream =
      await getMedia(
        currentCallType ===
        "video"
      );


    await attachLocalStream(
      stream
    );


    /* --------------------------------------------------------
       Peer connection
       -------------------------------------------------------- */

    createPeerConnection();


    /* --------------------------------------------------------
       Set caller offer
       -------------------------------------------------------- */

    await setRemoteDescription(
      call.offer
    );


    /* --------------------------------------------------------
       Listen for caller ICE
       -------------------------------------------------------- */

    listenForRemoteCandidates(
      callId,
      call.callerId
    );


    /* --------------------------------------------------------
       Create answer
       -------------------------------------------------------- */

    const answer =
      await createAnswer();


    /* --------------------------------------------------------
       Write answer
       -------------------------------------------------------- */

    await update(
      getCallRef(
        callId
      ),
      {

        answer:
          answer,

        status:
          "connected",

        acceptedBy:
          currentUser.uid,

        acceptedAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()

      }
    );


    updateCallState(
      "Connected..."
    );


    stopCallTimeout();


    return true;

  } catch (error) {

    callError(
      "Accept call failed:",
      error
    );


    await rejectCall(
      callId,
      false
    );


    throw error;
  }
}


/* ============================================================
   REJECT INCOMING CALL
   ============================================================ */

async function rejectCall(
  callId,
  cleanup = true
) {

  requireUser();


  if (!callId) {
    return;
  }


  try {

    const callRef =
      getCallRef(
        callId
      );


    const snapshot =
      await get(
        callRef
      );


    if (!snapshot.exists()) {
      return;
    }


    const call =
      snapshot.val();


    if (
      call.receiverId !==
      currentUser.uid
    ) {

      throw new Error(
        "এই call reject করার permission নেই।"
      );
    }


    await update(
      callRef,
      {

        status:
          "rejected",

        rejectedBy:
          currentUser.uid,

        rejectedAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()

      }
    );


    if (cleanup) {

      await cleanupCall(
        false
      );
    }


  } catch (error) {

    callError(
      "Reject call failed:",
      error
    );
  }
}


/* ============================================================
   END CURRENT CALL
   ============================================================ */

async function endCall() {

  if (
    !currentCallId
  ) {

    closeCallUI();

    return;
  }


  const callId =
    currentCallId;


  try {

    const callRef =
      getCallRef(
        callId
      );


    await update(
      callRef,
      {

        status:
          "ended",

        endedBy:
          currentUser?.uid ||
          null,

        endedAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()

      }
    );

  } catch (error) {

    callError(
      "End call update failed:",
      error
    );

  } finally {

    await cleanupCall(
      false
    );
  }
}


/* ============================================================
   CLEANUP CALL
   ============================================================ */

async function cleanupCall(
  removeDatabase = false
) {

  if (
    callEnded &&
    !currentCallId
  ) {
    return;
  }


  callEnded =
    true;


  stopCallTimeout();

  stopQualityMonitor();


  /* ----------------------------------------------------------
     Remove RTDB listener
     ---------------------------------------------------------- */

  callRecordListener =
    null;


  /* ----------------------------------------------------------
     Stop candidate listeners
     ---------------------------------------------------------- */

  removeCandidateListeners();


  /* ----------------------------------------------------------
     Stop local media
     ---------------------------------------------------------- */

  if (localStream) {

    localStream
      .getTracks()
      .forEach(
        track => {

          try {
            track.stop();
          } catch (error) {}

        }
      );

    localStream =
      null;
  }


  /* ----------------------------------------------------------
     Close peer connection
     ---------------------------------------------------------- */

  if (peerConnection) {

    try {

      peerConnection
        .getSenders()
        .forEach(
          sender => {

            try {
              sender.replaceTrack(
                null
              );
            } catch (error) {}

          }
        );

    } catch (error) {}


    try {
      peerConnection.close();
    } catch (error) {}

    peerConnection =
      null;
  }


  remoteStream =
    null;


  /* ----------------------------------------------------------
     Optional database cleanup
     ---------------------------------------------------------- */

  if (
    removeDatabase &&
    currentCallId
  ) {

    try {

      await remove(
        getCallRef(
          currentCallId
        )
      );

    } catch (error) {

      callError(
        "Call database cleanup failed:",
        error
      );
    }
  }


  currentCallId =
    null;

  currentPeerId =
    null;

  currentCallType =
    null;

  currentRole =
    null;

  remoteDescriptionSet =
    false;

  microphoneMuted =
    false;

  cameraEnabled =
    true;


  closeCallUI();


  updateCallControls();


  callLog(
    "Call cleanup complete."
  );
}


/* ============================================================
   CALL TIMEOUT
   ============================================================ */

function startCallTimeout() {

  stopCallTimeout();


  callTimeoutTimer =
    setTimeout(
      async () => {

        if (
          currentCallId &&
          currentRole === "caller"
        ) {

          updateCallState(
            "No answer."
          );

          await endCall();
        }

      },
      AYNA_CALL_CONFIG.callTimeout
    );
}


/* ============================================================
   STOP CALL TIMEOUT
   ============================================================ */

function stopCallTimeout() {

  if (
    callTimeoutTimer
  ) {

    clearTimeout(
      callTimeoutTimer
    );

    callTimeoutTimer =
      null;
  }
}


/* ============================================================
   MUTE / UNMUTE
   ============================================================ */

function toggleMute() {

  if (!localStream) {
    return false;
  }


  const tracks =
    localStream
      .getAudioTracks();


  if (!tracks.length) {
    return false;
  }


  microphoneMuted =
    !microphoneMuted;


  tracks.forEach(
    track => {

      track.enabled =
        !microphoneMuted;

    }
  );


  updateCallControls();


  updateCallState(
    microphoneMuted
      ? "Microphone muted"
      : "Microphone on"
  );


  return !microphoneMuted;
}


/* ============================================================
   CAMERA ON / OFF
   ============================================================ */

function toggleCamera() {

  if (!localStream) {
    return false;
  }


  const tracks =
    localStream
      .getVideoTracks();


  if (!tracks.length) {
    return false;
  }


  cameraEnabled =
    !cameraEnabled;


  tracks.forEach(
    track => {

      track.enabled =
        cameraEnabled;

    }
  );


  updateCallControls();


  updateCallState(
    cameraEnabled
      ? "Camera on"
      : "Camera off"
  );


  return cameraEnabled;
}


/* ============================================================
   SWITCH CAMERA
   ============================================================ */

async function switchCamera() {

  if (
    !localStream ||
    currentCallType !== "video"
  ) {

    return false;
  }


  const oldTrack =
    localStream
      .getVideoTracks()[0];


  if (!oldTrack) {
    return false;
  }


  const nextFacing =
    currentFacingMode === "user"
      ? "environment"
      : "user";


  let newStream;


  try {

    newStream =
      await navigator
        .mediaDevices
        .getUserMedia({

          audio: false,

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

            facingMode:
              nextFacing

          }

        });

  } catch (error) {

    callLog(
      "4K camera switch failed. Trying HD..."
    );


    try {

      newStream =
        await navigator
          .mediaDevices
          .getUserMedia({

            audio: false,

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

              facingMode:
                nextFacing

            }

          });

    } catch (secondError) {

      callError(
        "Camera switch failed:",
        secondError
      );

      return false;
    }
  }


  const newTrack =
    newStream
      .getVideoTracks()[0];


  if (!newTrack) {
    return false;
  }


  /* ----------------------------------------------------------
     Replace WebRTC sender
     ---------------------------------------------------------- */

  if (peerConnection) {

    const sender =
      peerConnection
        .getSenders()
        .find(
          item =>
            item.track &&
            item.track.kind ===
              "video"
        );


    if (sender) {

      try {

        await sender.replaceTrack(
          newTrack
        );

      } catch (error) {

        callError(
          "replaceTrack failed:",
          error
        );
      }
    }
  }


  /* ----------------------------------------------------------
     Replace local stream track
     ---------------------------------------------------------- */

  try {

    localStream.removeTrack(
      oldTrack
    );

  } catch (error) {}


  try {
    oldTrack.stop();
  } catch (error) {}


  localStream.addTrack(
    newTrack
  );


  currentFacingMode =
    nextFacing;


  const localVideo =
    $("localVideo");


  if (localVideo) {

    localVideo.srcObject =
      localStream;

    try {
      await localVideo.play();
    } catch (error) {}
  }


  updateCallState(
    nextFacing === "user"
      ? "Front camera"
      : "Back camera"
  );


  return true;
}


/* ============================================================
   UPDATE CALL BUTTONS
   ============================================================ */

function updateCallControls() {

  const muteBtn =
    $("muteCallBtn");

  const cameraBtn =
    $("cameraCallBtn");


  if (muteBtn) {

    muteBtn.textContent =
      microphoneMuted
        ? "🔇"
        : "🎙";
  }


  if (cameraBtn) {

    cameraBtn.textContent =
      cameraEnabled
        ? "📹"
        : "🚫";
  }
}


/* ============================================================
   INCOMING CALL LISTENER
   ============================================================ */

function listenForIncomingCalls() {

  if (
    !currentUser
  ) {
    return;
  }


  const callsRef =
    ref(
      database,
      "calls"
    );


  incomingCallsListener =
    snapshot => {

      const calls =
        snapshot.val();


      if (!calls) {
        return;
      }


      Object.entries(
        calls
      ).forEach(
        ([callId, call]) => {

          if (
            !call ||
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


          if (
            currentCallId
          ) {
            return;
          }


          showIncomingCall(
            callId,
            call
          );

        }
      );
    };


  onValue(
    callsRef,
    incomingCallsListener
  );
}


/* ============================================================
   INCOMING CALL UI
   ============================================================ */

let incomingCallData = null;

let incomingCallTimer = null;


function showIncomingCall(
  callId,
  call
) {

  if (
    incomingCallData
  ) {
    return;
  }


  incomingCallData = {
    callId,
    call
  };


  const callerName =
    call.callerName ||
    "AYNA User";


  const type =
    call.type === "video"
      ? "ভিডিও কল"
      : "অডিও কল";


  updateCallState(
    `Incoming ${type}: ${callerName}`
  );


  /* ----------------------------------------------------------
     Browser notification
     ---------------------------------------------------------- */

  try {

    if (
      "Notification" in window &&
      Notification.permission ===
        "granted"
    ) {

      new Notification(
        `AYNA BOOK — ${type}`,
        {
          body:
            `${callerName} আপনাকে কল করছেন।`
        }
      );
    }

  } catch (error) {}


  /* ----------------------------------------------------------
     Custom browser confirm
     ---------------------------------------------------------- */

  const accepted =
    window.confirm(
      `${callerName}\n\n${type} এসেছে।\n\nOK = গ্রহণ\nCancel = Reject`
    );


  if (
    incomingCallData?.callId !==
    callId
  ) {
    return;
  }


  if (accepted) {

    acceptCall(
      callId,
      callerName
    )
      .catch(
        error => {

          callError(
            error
          );

          incomingCallData =
            null;
        }
      );

  } else {

    rejectCall(
      callId
    )
      .finally(
        () => {

          incomingCallData =
            null;
        }
      );
  }


  if (
    incomingCallTimer
  ) {

    clearTimeout(
      incomingCallTimer
    );

    incomingCallTimer =
      null;
  }
}


/* ============================================================
   REQUEST NOTIFICATION PERMISSION
   ============================================================ */

async function requestCallNotificationPermission() {

  if (
    !("Notification" in window)
  ) {
    return;
  }


  if (
    Notification.permission ===
      "default"
  ) {

    try {

      await Notification
        .requestPermission();

    } catch (error) {}
  }
}


/* ============================================================
   QUALITY MONITOR
   ============================================================ */

function startQualityMonitor() {

  stopQualityMonitor();


  qualityTimer =
    setInterval(
      async () => {

        if (
          !peerConnection
        ) {
          return;
        }


        try {

          const stats =
            await peerConnection
              .getStats();


          let packetsLost = 0;
          let packetsReceived = 0;
          let packetsSent = 0;

          let bytesReceived = 0;
          let bytesSent = 0;

          let roundTripTime = null;

          let inboundVideo = false;
          let inboundAudio = false;


          stats.forEach(
            report => {

              if (
                report.type ===
                  "inbound-rtp"
              ) {

                if (
                  report.kind ===
                    "video" ||
                  report.mediaType ===
                    "video"
                ) {

                  inboundVideo =
                    true;

                }

                if (
                  report.kind ===
                    "audio" ||
                  report.mediaType ===
                    "audio"
                ) {

                  inboundAudio =
                    true;
                }


                packetsLost +=
                  report.packetsLost ||
                  0;

                packetsReceived +=
                  report.packetsReceived ||
                  0;

                bytesReceived +=
                  report.bytesReceived ||
                  0;
              }


              if (
                report.type ===
                  "outbound-rtp"
              ) {

                packetsSent +=
                  report.packetsSent ||
                  0;

                bytesSent +=
                  report.bytesSent ||
                  0;
              }


              if (
                report.type ===
                  "candidate-pair" &&
                report.state ===
                  "succeeded"
              ) {

                if (
                  typeof report.currentRoundTripTime ===
                    "number"
                ) {

                  roundTripTime =
                    report.currentRoundTripTime;
                }
              }

            }
          );


          const totalPackets =
            packetsLost +
            packetsReceived;


          const lossRate =
            totalPackets > 0
              ? (
                  packetsLost /
                  totalPackets
                ) * 100
              : 0;


          let quality =
            "Excellent";


          if (
            lossRate > 8 ||
            (
              roundTripTime !== null &&
              roundTripTime > 0.45
            )
          ) {

            quality =
              "Poor";

          } else if (
            lossRate > 3 ||
            (
              roundTripTime !== null &&
              roundTripTime > 0.25
            )
          ) {

            quality =
              "Fair";
          }


          const stateText =
            quality === "Excellent"
              ? "🟢 Excellent"
              : quality === "Fair"
                ? "🟡 Fair"
                : "🔴 Poor";


          callLog(
            "Quality:",
            stateText,
            {
              lossRate:
                Number(
                  lossRate.toFixed(2)
                ),

              rtt:
                roundTripTime !== null
                  ? Math.round(
                      roundTripTime *
                      1000
                    ) + " ms"
                  : "N/A",

              inboundVideo,

              inboundAudio,

              bytesReceived,

              bytesSent,

              packetsSent
            }
          );

        } catch (error) {

          callLog(
            "Quality monitor error:",
            error
          );
        }

      },

      AYNA_CALL_CONFIG.qualityInterval
    );
}


/* ============================================================
   STOP QUALITY MONITOR
   ============================================================ */

function stopQualityMonitor() {

  if (
    qualityTimer
  ) {

    clearInterval(
      qualityTimer
    );

    qualityTimer =
      null;
  }
}


/* ============================================================
   INITIALIZE
   ============================================================ */

function initializeCallManager() {

  callLog(
    "AYNA Call Manager initialized."
  );


  requestCallNotificationPermission();


  listenForIncomingCalls();


  /* ----------------------------------------------------------
     UI buttons
     ---------------------------------------------------------- */

  $("muteCallBtn")
    ?.addEventListener(
      "click",
      () => {
        toggleMute();
      }
    );


  $("cameraCallBtn")
    ?.addEventListener(
      "click",
      () => {
        toggleCamera();
      }
    );


  $("switchCameraBtn")
    ?.addEventListener(
      "click",
      () => {
        switchCamera();
      }
    );


  $("endCallBtn")
    ?.addEventListener(
      "click",
      () => {
        endCall();
      }
    );


  $("closeCallBtn")
    ?.addEventListener(
      "click",
      () => {
        endCall();
      }
    );


  /* ----------------------------------------------------------
     Start quality monitoring
     ---------------------------------------------------------- */

  startQualityMonitor();
}


/* ============================================================
   AUTH STATE
   ============================================================ */

onAuthStateChanged(
  auth,
  user => {

    currentUser =
      user || null;


    if (!user) {

      callLog(
        "User signed out."
      );

      cleanupCall(
        false
      ).catch(
        () => {}
      );

      return;
    }


    callLog(
      "Authenticated:",
      user.uid
    );


    initializeCallManager();

  },

  error => {

    callError(
      "Authentication state error:",
      error
    );
  }
);


/* ============================================================
   PUBLIC API
   ============================================================ */

window.AYNA_CALL = {

  /* Call */

  startCall,

  acceptCall,

  rejectCall,

  endCall,


  /* Media */

  toggleMute,

  toggleCamera,

  switchCamera,


  /* State */

  getCurrentCallId() {
    return currentCallId;
  },

  getCurrentPeerId() {
    return currentPeerId;
  },

  getCurrentCallType() {
    return currentCallType;
  },

  getCurrentRole() {
    return currentRole;
  },


  /* Connection */

  getPeerConnection() {
    return peerConnection;
  },

  getLocalStream() {
    return localStream;
  },

  getRemoteStream() {
    return remoteStream;
  },


  /* Quality */

  startQualityMonitor,

  stopQualityMonitor,


  /* Notification */

  requestCallNotificationPermission,


  /* Configuration */

  config:
    AYNA_CALL_CONFIG

};


callLog(
  "window.AYNA_CALL is ready."
);